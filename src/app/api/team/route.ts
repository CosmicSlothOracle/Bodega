import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { findAuthUserIdByEmail } from "@/server/dashboard/team";
import { env } from "@/lib/env";

/**
 * GET /api/team
 *
 * Returns a minimal list of team members for the staff swap-target picker.
 * Authenticated users only — staff sees teammates with `staff` or
 * `manager_on_duty` so they know who they can ask to take a shift. Sensitive
 * fields (email, telegram_chat_id) are intentionally omitted.
 */
export async function GET() {
  const sb = await supabaseServer();
  if (!sb)
    return NextResponse.json(
      { error: "Supabase nicht konfiguriert" },
      { status: 503 },
    );

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });

  const admin = supabaseAdmin();
  if (!admin)
    return NextResponse.json(
      { error: "Admin nicht verfügbar" },
      { status: 503 },
    );

  const { data, error } = await admin
    .from("user_roles")
    .select("user_id, display_name, role")
    .neq("user_id", user.id)
    .in("role", ["staff", "manager"])
    .order("display_name", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Team konnte nicht geladen werden", detail: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    members: (data ?? []).map(
      (m) => m as { user_id: string; display_name: string | null; role: string },
    ),
  });
}

/**
 * POST /api/team
 *
 * Owner invites a new team member. Two paths:
 *   1. Email is unknown → `auth.admin.inviteUserByEmail` sends a magic-link
 *      invitation; user_roles row is inserted on the new user's id.
 *   2. Email already exists in auth.users → we just upsert the user_roles
 *      row (e.g. to add a role to a user that previously logged in for
 *      another reason).
 *
 * The `display_name` and `role` are stored on `user_roles` immediately so
 * the invitee shows up correctly the moment they finish their first login.
 */

const Body = z.object({
  email: z.string().email().max(254),
  displayName: z.string().min(1).max(80),
  role: z.enum(["owner", "manager", "staff", "marketing"]),
});

export async function POST(request: Request) {
  const sb = await supabaseServer();
  if (!sb) return NextResponse.json({ error: "Supabase nicht konfiguriert" }, { status: 503 });

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });

  const { data: roleRow } = await sb
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if ((roleRow as { role?: string } | null)?.role !== "owner") {
    return NextResponse.json({ error: "Nur Owner darf einladen" }, { status: 403 });
  }

  const parsed = Body.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validierung fehlgeschlagen", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Admin-Client nicht verfügbar" }, { status: 503 });

  const { email, displayName, role } = parsed.data;
  const existingId = await findAuthUserIdByEmail(email);

  let userId: string;
  let invited = false;

  if (existingId) {
    userId = existingId;
  } else {
    const { data: invite, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: `${env.public.siteUrl}/auth/confirm?next=/dashboard`,
      },
    );
    if (inviteErr || !invite?.user?.id) {
      return NextResponse.json(
        { error: "Einladung fehlgeschlagen", detail: inviteErr?.message },
        { status: 500 },
      );
    }
    userId = invite.user.id;
    invited = true;
  }

  const { error: upsertErr } = await admin
    .from("user_roles")
    .upsert(
      {
        user_id: userId,
        role,
        display_name: displayName,
      },
      { onConflict: "user_id" },
    );

  if (upsertErr) {
    return NextResponse.json(
      { error: "Rolle konnte nicht gesetzt werden", detail: upsertErr.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, userId, invited });
}
