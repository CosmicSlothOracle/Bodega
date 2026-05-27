import { supabaseAdmin } from "@/lib/supabase/admin";
import type {
  Shift,
  ShiftAssignment,
  BloomRole,
} from "@/lib/supabase/types";

/**
 * Schichtplanung — server queries.
 *
 * Reads via the service-role client (the calling page is gated by
 * `proxy.ts` plus role checks). We do not depend on Postgrest joins to
 * `user_roles` because there is no FK from `shift_assignments` →
 * `user_roles` (only to `auth.users`). Instead we hydrate display names
 * in a second pass.
 */

interface UserRoleRow {
  user_id: string;
  display_name: string | null;
  role: BloomRole;
  telegram_chat_id: string | null;
}

export interface ShiftTemplateEntry {
  dayOffset: number;
  startTime: string;
  endTime: string;
  role: string;
  notes: string | null;
  assignedUserIds: string[];
}

export interface ShiftWeekTemplate {
  id: string;
  name: string;
  entries: ShiftTemplateEntry[];
}

async function loadUserRoles(userIds: string[]): Promise<Map<string, UserRoleRow>> {
  const sb = supabaseAdmin();
  if (!sb || userIds.length === 0) return new Map();
  const { data } = await sb
    .from("user_roles")
    .select("user_id, display_name, role, telegram_chat_id")
    .in("user_id", userIds);
  const map = new Map<string, UserRoleRow>();
  for (const row of (data ?? []) as UserRoleRow[]) map.set(row.user_id, row);
  return map;
}

export async function getShiftsForRange(
  startIso: string,
  endIso: string,
): Promise<Array<Shift & { assignments: ShiftAssignment[] }>> {
  const sb = supabaseAdmin();
  if (!sb) return [];

  const { data, error } = await sb
    .from("shifts")
    .select("*, assignments:shift_assignments(id, user_id, created_at)")
    .gte("date", startIso)
    .lte("date", endIso)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("[shifts.getShiftsForRange]", error);
    return [];
  }

  const shifts = (data ?? []) as Array<
    Shift & { assignments: ShiftAssignment[] }
  >;

  const allUserIds = Array.from(
    new Set(shifts.flatMap((s) => s.assignments.map((a) => a.user_id))),
  );
  const roles = await loadUserRoles(allUserIds);

  return shifts.map((s) => ({
    ...s,
    assignments: s.assignments.map((a) => ({
      ...a,
      display_name: roles.get(a.user_id)?.display_name ?? "Unbekannt",
    })),
  }));
}

/**
 * Per-user dashboard queries live in `src/server/shifts/forUser.ts` (used by
 * the role-aware Staff Home). Legacy helpers (`getMyShifts`, `getPendingSwaps`)
 * were removed with ADR-007 along with the manager-approval flow.
 */

export async function listAssignableUsers(): Promise<
  Array<{ user_id: string; display_name: string; role: BloomRole; chat_id: string | null }>
> {
  const sb = supabaseAdmin();
  if (!sb) return [];

  const { data, error } = await sb
    .from("user_roles")
    .select("user_id, display_name, role, telegram_chat_id");

  if (error) {
    console.error("[shifts.listAssignableUsers]", error);
    return [];
  }

  return ((data ?? []) as UserRoleRow[]).map((r) => ({
    user_id: r.user_id,
    display_name: r.display_name ?? "Unbekannt",
    role: r.role,
    chat_id: r.telegram_chat_id,
  }));
}

export async function getDefaultWeekTemplate(): Promise<ShiftWeekTemplate | null> {
  const sb = supabaseAdmin();
  if (!sb) return null;

  const { data, error } = await sb
    .from("shift_week_templates")
    .select("id, name, entries")
    .eq("is_default", true)
    .maybeSingle();

  if (error) {
    console.error("[shifts.getDefaultWeekTemplate]", error);
    return null;
  }

  const row = data as
    | { id: string; name: string; entries: ShiftTemplateEntry[] | null }
    | null;
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    entries: Array.isArray(row.entries) ? row.entries : [],
  };
}
