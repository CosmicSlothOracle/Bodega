import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * GET /api/team/[userId]/shifts?role=<shift_role>&from=YYYY-MM-DD
 *
 * Returns future published shifts a teammate is assigned to, optionally
 * filtered by role. Used by the staff swap-target wizard to let the
 * requester pick which of the teammate's shifts to exchange against.
 *
 * Authentication only (no role gate) — staff swap planning is a peer flow.
 * RLS still gates the read on the server side via `assignments_self_read` +
 * `shifts_staff_read`; this admin-client query bypasses RLS because we
 * already verified the requester is authenticated, and the returned shape
 * contains nothing sensitive (no email, no telegram_chat_id).
 */

interface ShiftRow {
  date: string;
  start_time: string;
  end_time: string;
  role: string;
  published: boolean;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
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

  const { userId } = await params;
  if (!userId.match(/^[0-9a-f-]{36}$/i)) {
    return NextResponse.json({ error: "Ungültige userId" }, { status: 400 });
  }

  const url = new URL(request.url);
  const roleFilter = url.searchParams.get("role");
  const fromIso =
    url.searchParams.get("from") ?? new Date().toISOString().slice(0, 10);

  const admin = supabaseAdmin();
  if (!admin)
    return NextResponse.json(
      { error: "Admin nicht verfügbar" },
      { status: 503 },
    );

  const { data, error } = await admin
    .from("shift_assignments")
    .select(
      `
      id,
      shift:shifts!inner(
        date,
        start_time,
        end_time,
        role,
        published
      )
    `,
    )
    .eq("user_id", userId)
    .gte("shifts.date", fromIso)
    .eq("shifts.published", true)
    .order("shifts(date)", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Schichten konnten nicht geladen werden", detail: error.message },
      { status: 500 },
    );
  }

  type RowShape = { id: string; shift: ShiftRow | ShiftRow[] | null };
  const assignments = ((data ?? []) as RowShape[])
    .map((row) => {
      const shift = Array.isArray(row.shift)
        ? (row.shift[0] ?? null)
        : row.shift;
      if (!shift) return null;
      return {
        assignment_id: row.id,
        date: shift.date,
        start_time: shift.start_time,
        end_time: shift.end_time,
        role: shift.role,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .filter((row) => (roleFilter ? row.role === roleFilter : true));

  return NextResponse.json({ shifts: assignments });
}
