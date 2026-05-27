import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import type { BloomRole } from "@/lib/supabase/types";

/**
 * Team management — server queries.
 *
 * Joins `user_roles` against `auth.users` (which is not exposed via PostgREST
 * by default). The service-role client has access through
 * `auth.admin.listUsers`. We hydrate emails in a second pass and cache the
 * lookup for the lifetime of the request.
 */

export interface TeamMember {
  user_id: string;
  email: string | null;
  display_name: string | null;
  role: BloomRole;
  telegram_chat_id: string | null;
  telegram_invite_code: string | null;
  telegram_linked_at: string | null;
  created_at: string;
}

export async function getCurrentUserRole(): Promise<BloomRole | null> {
  const sb = await supabaseServer();
  if (!sb) return null;

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;

  const { data } = await sb
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  const role = (data as { role?: BloomRole } | null)?.role;
  return role ?? null;
}

export async function currentUserHasRole(
  allowed: readonly BloomRole[],
): Promise<boolean> {
  const role = await getCurrentUserRole();
  return Boolean(role && allowed.includes(role));
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const admin = supabaseAdmin();
  if (!admin) return [];

  const { data: roles, error } = await admin
    .from("user_roles")
    .select(
      "user_id, role, display_name, telegram_chat_id, telegram_invite_code, telegram_linked_at, created_at",
    )
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[team.getTeamMembers]", error);
    return [];
  }

  // The auth.admin.listUsers API is paginated; a Bodega-sized team fits
  // comfortably in one page (perPage default 50). If it ever grows beyond
  // that we paginate.
  const { data: usersList } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  const emailById = new Map<string, string>();
  for (const u of usersList?.users ?? []) {
    if (u.id && u.email) emailById.set(u.id, u.email);
  }

  return ((roles ?? []) as Array<Omit<TeamMember, "email">>).map((r) => ({
    ...r,
    email: emailById.get(r.user_id) ?? null,
  }));
}

/**
 * Look up an auth.users record by email. Returns null when not found.
 * Used by the invite flow to upsert a user_roles row for a user that
 * already has an account.
 */
export async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const admin = supabaseAdmin();
  if (!admin) return null;

  const normalized = email.trim().toLowerCase();
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  for (const u of data?.users ?? []) {
    if ((u.email ?? "").toLowerCase() === normalized) return u.id;
  }
  return null;
}
