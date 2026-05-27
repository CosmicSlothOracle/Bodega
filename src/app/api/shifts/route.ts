import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { telegram } from "@/server/notifications/telegram";

/**
 * Schichtplanung — manager API.
 *
 * POST: create or update one shift (idempotent via `id`), assign users,
 *       optionally publish. When publishing, every newly assigned staff
 *       member gets a Telegram notification (mock if not configured).
 */

const Body = z.object({
  id: z.string().uuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  role: z.enum(["service", "kitchen", "bar", "host", "manager_on_duty"]),
  notes: z.string().max(500).optional(),
  published: z.boolean().optional(),
  assignedUserIds: z.array(z.string().uuid()).max(20),
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
  const role = (roleRow as { role?: string } | null)?.role;
  if (!role || !["owner", "manager"].includes(role)) {
    return NextResponse.json({ error: "Owner/Manager-Rolle erforderlich" }, { status: 403 });
  }

  const parsed = Body.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierung fehlgeschlagen", issues: parsed.error.flatten() }, { status: 400 });
  }

  const v = parsed.data;
  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Admin nicht verfügbar" }, { status: 503 });

  const ruleViolation = await validateShiftRules(admin, {
    currentShiftId: v.id,
    date: v.date,
    startTime: v.startTime,
    endTime: v.endTime,
    assignedUserIds: v.assignedUserIds,
  });
  if (ruleViolation) {
    return NextResponse.json({ error: ruleViolation }, { status: 400 });
  }

  let wasPublished = false;
  let previousAssigned = new Set<string>();
  if (v.id) {
    const { data: existing } = await admin
      .from("shifts")
      .select("published, assignments:shift_assignments(user_id)")
      .eq("id", v.id)
      .maybeSingle();

    const typedExisting = existing as
      | {
          published: boolean;
          assignments?: Array<{ user_id: string }> | null;
        }
      | null;
    wasPublished = typedExisting?.published ?? false;
    previousAssigned = new Set(
      (typedExisting?.assignments ?? []).map((a) => a.user_id),
    );
  }

  const upsertResult = await admin
    .from("shifts")
    .upsert({
      ...(v.id ? { id: v.id } : {}),
      date: v.date,
      start_time: v.startTime,
      end_time: v.endTime,
      role: v.role,
      notes: v.notes ?? null,
      published: v.published ?? false,
      created_by: user.id,
    })
    .select("id, published")
    .single();

  if (upsertResult.error || !upsertResult.data) {
    return NextResponse.json(
      { error: "Schicht konnte nicht gespeichert werden", detail: upsertResult.error?.message },
      { status: 500 },
    );
  }
  const shift = upsertResult.data as { id: string; published: boolean };

  // Replace assignments fully (idempotent edit semantics).
  await admin.from("shift_assignments").delete().eq("shift_id", shift.id);

  if (v.assignedUserIds.length > 0) {
    const { error: assignErr } = await admin
      .from("shift_assignments")
      .insert(
        v.assignedUserIds.map((uid) => ({ shift_id: shift.id, user_id: uid })),
      );
    if (assignErr) {
      return NextResponse.json(
        { error: "Zuweisung fehlgeschlagen", detail: assignErr.message },
        { status: 500 },
      );
    }
  }

  // Notifications: only fire if shift is now published AND user has chat ID.
  if (shift.published && v.assignedUserIds.length > 0) {
    const { data: targets } = await admin
      .from("user_roles")
      .select("user_id, display_name, telegram_chat_id")
      .in("user_id", v.assignedUserIds);

    for (const t of (targets ?? []) as Array<{
      user_id: string;
      display_name: string | null;
      telegram_chat_id: string | null;
    }>) {
      if (wasPublished && previousAssigned.has(t.user_id)) continue;
      if (!t.telegram_chat_id) continue;
      try {
        await telegram.sendMessage(
          t.telegram_chat_id,
          `<b>Neue Schicht</b>\n${formatDate(v.date)} · ${v.startTime}–${v.endTime}\nRolle: ${v.role}${v.notes ? `\nNotiz: ${v.notes}` : ""}`,
        );
      } catch (err) {
        console.warn("[shifts] telegram send failed", err);
      }
    }
  }

  return NextResponse.json({ ok: true, id: shift.id });
}

export async function DELETE(request: Request) {
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
  const role = (roleRow as { role?: string } | null)?.role;
  if (!role || !["owner", "manager"].includes(role)) {
    return NextResponse.json({ error: "Owner/Manager-Rolle erforderlich" }, { status: 403 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });

  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Admin nicht verfügbar" }, { status: 503 });

  const { error } = await admin.from("shifts").delete().eq("id", id);
  if (error) {
    return NextResponse.json(
      { error: "Schicht konnte nicht gelöscht werden", detail: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(y, m - 1, d));
}

async function validateShiftRules(
  admin: NonNullable<ReturnType<typeof supabaseAdmin>>,
  input: {
    currentShiftId?: string;
    date: string;
    startTime: string;
    endTime: string;
    assignedUserIds: string[];
  },
): Promise<string | null> {
  if (input.assignedUserIds.length === 0) return null;

  const weekStart = mondayOf(input.date);
  const weekEnd = addDaysIso(weekStart, 6);
  const proposedStart = new Date(`${input.date}T${input.startTime}`);
  const proposedEnd = normalizeEnd(proposedStart, input.endTime);
  const proposedMinutes = (proposedEnd.getTime() - proposedStart.getTime()) / 60000;

  const { data: timeOff } = await admin
    .from("shift_time_off")
    .select("user_id, start_date, end_date, status")
    .in("user_id", input.assignedUserIds)
    .lte("start_date", input.date)
    .gte("end_date", input.date)
    .eq("status", "approved");

  if ((timeOff ?? []).length > 0) {
    return "Mindestens eine zugewiesene Person ist an diesem Tag abwesend.";
  }

  const { data: rows } = await admin
    .from("shift_assignments")
    .select("user_id, shift_id, shifts!inner(date, start_time, end_time)")
    .in("user_id", input.assignedUserIds)
    .gte("shifts.date", weekStart)
    .lte("shifts.date", weekEnd);

  for (const userId of input.assignedUserIds) {
    const userRows = ((rows ?? []) as Array<{
      user_id: string;
      shift_id: string;
      shifts:
        | { date: string; start_time: string; end_time: string }
        | Array<{ date: string; start_time: string; end_time: string }>
        | null;
    }>).filter((row) => row.user_id === userId && row.shift_id !== input.currentShiftId);

    let weeklyMinutes = proposedMinutes;
    for (const row of userRows) {
      const shift = Array.isArray(row.shifts) ? (row.shifts[0] ?? null) : row.shifts;
      if (!shift) continue;
      const start = new Date(`${shift.date}T${shift.start_time.slice(0, 5)}`);
      const end = normalizeEnd(start, shift.end_time.slice(0, 5));
      weeklyMinutes += (end.getTime() - start.getTime()) / 60000;

      const overlaps = proposedStart < end && proposedEnd > start;
      if (overlaps) return "Schicht überschneidet sich mit einer bestehenden Zuweisung.";

      const restBefore = Math.abs(proposedStart.getTime() - end.getTime()) / 3600000;
      const restAfter = Math.abs(start.getTime() - proposedEnd.getTime()) / 3600000;
      if (restBefore < 10 || restAfter < 10) {
        return "Mindestpause von 10 Stunden zwischen zwei Schichten wird unterschritten.";
      }
    }
    if (weeklyMinutes > 40 * 60) {
      return "Maximale Wochenarbeitszeit von 40 Stunden würde überschritten.";
    }
  }

  return null;
}

function normalizeEnd(start: Date, endTime: string) {
  const [hours, minutes] = endTime.split(":").map(Number);
  const end = new Date(start);
  end.setHours(hours, minutes, 0, 0);
  if (end <= start) end.setDate(end.getDate() + 1);
  return end;
}

function mondayOf(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const day = dt.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  dt.setUTCDate(dt.getUTCDate() + diff);
  return dt.toISOString().slice(0, 10);
}

function addDaysIso(iso: string, delta: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}
