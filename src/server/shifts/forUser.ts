import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Shift queries for individual staff members.
 *
 * These are used in the Staff Home Dashboard to show:
 *   - My assigned shifts (upcoming)
 *   - Swap requests I initiated (pending)
 *   - Swap requests addressed to me (pending, awaiting my response)
 */

export interface UserShift {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  role: string;
  notes: string | null;
  assignment_id: string;
  shift_id: string;
}

export interface UserSwap {
  id: string;
  kind: "exchange" | "takeover";
  status: string;
  requester_id: string;
  requester_name: string | null;
  target_user_id: string;
  target_name: string | null;
  requester_shift: {
    date: string;
    start_time: string;
    end_time: string;
    role: string;
  };
  target_shift?: {
    date: string;
    start_time: string;
    end_time: string;
    role: string;
  };
  reason: string | null;
  created_at: string;
  expires_at: string;
}

export interface OpenShift {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  role: string;
  notes: string | null;
}

/**
 * Returns all shifts assigned to the current user, ordered by date ascending.
 * Only returns future shifts (date >= today).
 */
export async function getMyShifts(): Promise<UserShift[]> {
  const sb = await supabaseServer();
  if (!sb) return [];

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return [];

  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await sb
    .from("shift_assignments")
    .select(
      `
      id,
      shift_id,
      shifts!inner (
        id,
        date,
        start_time,
        end_time,
        role,
        notes,
        published
      )
    `,
    )
    .eq("user_id", user.id)
    .gte("shifts.date", today)
    .eq("shifts.published", true)
    .order("shifts(date)", { ascending: true });

  if (error) {
    console.error("[forUser.getMyShifts]", error);
    return [];
  }

  interface JoinedShift {
    date: string;
    start_time: string;
    end_time: string;
    role: string;
    notes: string | null;
  }

  interface ShiftJoinRow {
    id: string;
    shift_id: string;
    // Supabase typegen flattens `select` with `!inner` to `T | T[] | null`
    // depending on FK cardinality detection; we accept both.
    shifts: JoinedShift | JoinedShift[] | null;
  }

  function pick(s: JoinedShift | JoinedShift[] | null): JoinedShift | null {
    if (!s) return null;
    return Array.isArray(s) ? (s[0] ?? null) : s;
  }

  return ((data ?? []) as unknown as ShiftJoinRow[])
    .map((row) => {
      const shift = pick(row.shifts);
      if (!shift) return null;
      return {
        id: row.id,
        assignment_id: row.id,
        shift_id: row.shift_id,
        date: shift.date,
        start_time: shift.start_time,
        end_time: shift.end_time,
        role: shift.role,
        notes: shift.notes,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);
}

/**
 * Returns all swap requests initiated by the current user that are still pending.
 */
export async function getMyOpenSwaps(): Promise<UserSwap[]> {
  const sb = await supabaseServer();
  if (!sb) return [];

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return [];

  const { data, error } = await sb
    .from("shift_swaps")
    .select(
      `
      id,
      kind,
      status,
      requester_id,
      target_user_id,
      reason,
      created_at,
      expires_at,
      assignment_id,
      target_assignment_id
    `,
    )
    .eq("requester_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[forUser.getMyOpenSwaps]", error);
    return [];
  }

  return await hydrateSwaps((data ?? []) as SwapRow[], sb);
}

/**
 * Returns all swap requests addressed to the current user that are pending
 * (awaiting their accept/reject decision).
 */
export async function getSwapsAddressedToMe(): Promise<UserSwap[]> {
  const sb = await supabaseServer();
  if (!sb) return [];

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return [];

  const { data, error } = await sb
    .from("shift_swaps")
    .select(
      `
      id,
      kind,
      status,
      requester_id,
      target_user_id,
      reason,
      created_at,
      expires_at,
      assignment_id,
      target_assignment_id
    `,
    )
    .eq("target_user_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[forUser.getSwapsAddressedToMe]", error);
    return [];
  }

  return await hydrateSwaps((data ?? []) as SwapRow[], sb);
}

export async function getOpenShifts(): Promise<OpenShift[]> {
  const sb = await supabaseServer();
  if (!sb) return [];

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return [];

  const admin = supabaseAdmin();
  if (!admin) return [];

  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await admin
    .from("shifts")
    .select("id, date, start_time, end_time, role, notes, assignments:shift_assignments(id)")
    .eq("published", true)
    .gte("date", today)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("[forUser.getOpenShifts]", error);
    return [];
  }

  return ((data ?? []) as Array<OpenShift & { assignments?: Array<{ id: string }> }>)
    .filter((shift) => (shift.assignments ?? []).length === 0)
    .map(({ assignments: _assignments, ...shift }) => shift)
    .slice(0, 12);
}

interface SwapRow {
  id: string;
  kind: "exchange" | "takeover";
  status: string;
  requester_id: string;
  target_user_id: string;
  assignment_id: string;
  target_assignment_id: string | null;
  reason: string | null;
  created_at: string;
  expires_at: string;
}

interface JoinedShortShift {
  date: string;
  start_time: string;
  end_time: string;
  role: string;
}

interface AssignmentWithShift {
  id: string;
  shift_id: string;
  shifts: JoinedShortShift | JoinedShortShift[] | null;
}

interface ShiftSummary {
  date: string;
  start_time: string;
  end_time: string;
  role: string;
}

async function hydrateSwaps(
  swaps: SwapRow[],
  sb: SupabaseClient,
): Promise<UserSwap[]> {
  if (swaps.length === 0) return [];

  const assignmentIds = new Set<string>();
  const userIds = new Set<string>();

  for (const swap of swaps) {
    if (swap.assignment_id) assignmentIds.add(swap.assignment_id);
    if (swap.target_assignment_id) assignmentIds.add(swap.target_assignment_id);
    userIds.add(swap.requester_id);
    userIds.add(swap.target_user_id);
  }

  const { data: assignments } = await sb
    .from("shift_assignments")
    .select(
      `
      id,
      shift_id,
      shifts!inner (
        date,
        start_time,
        end_time,
        role
      )
    `,
    )
    .in("id", Array.from(assignmentIds));

  const assignmentMap = new Map<string, ShiftSummary>();
  for (const a of (assignments ?? []) as unknown as AssignmentWithShift[]) {
    const shift = Array.isArray(a.shifts) ? (a.shifts[0] ?? null) : a.shifts;
    if (!shift) continue;
    assignmentMap.set(a.id, {
      date: shift.date,
      start_time: shift.start_time,
      end_time: shift.end_time,
      role: shift.role,
    });
  }

  const { data: userRoles } = await sb
    .from("user_roles")
    .select("user_id, display_name")
    .in("user_id", Array.from(userIds));

  const nameMap = new Map<string, string | null>();
  for (const u of (userRoles ?? []) as Array<{
    user_id: string;
    display_name: string | null;
  }>) {
    nameMap.set(u.user_id, u.display_name);
  }

  const empty: ShiftSummary = {
    date: "",
    start_time: "",
    end_time: "",
    role: "",
  };

  return swaps.map((swap) => ({
    id: swap.id,
    kind: swap.kind,
    status: swap.status,
    requester_id: swap.requester_id,
    requester_name: nameMap.get(swap.requester_id) ?? null,
    target_user_id: swap.target_user_id,
    target_name: nameMap.get(swap.target_user_id) ?? null,
    requester_shift: assignmentMap.get(swap.assignment_id) ?? empty,
    target_shift: swap.target_assignment_id
      ? assignmentMap.get(swap.target_assignment_id)
      : undefined,
    reason: swap.reason,
    created_at: swap.created_at,
    expires_at: swap.expires_at,
  }));
}
