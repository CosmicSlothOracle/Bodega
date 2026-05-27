import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

const AvailabilityBody = z.object({
  kind: z.literal("availability"),
  weekday: z.number().int().min(1).max(7),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  note: z.string().max(300).optional(),
});

const TimeOffBody = z.object({
  kind: z.literal("time_off"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(300).optional(),
});

const Body = z.discriminatedUnion("kind", [AvailabilityBody, TimeOffBody]);

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Admin nicht verfügbar" }, { status: 503 });

  const [availability, timeOff] = await Promise.all([
    admin
      .from("shift_availability")
      .select("id, weekday, start_time, end_time, note")
      .eq("user_id", auth.userId)
      .order("weekday", { ascending: true }),
    admin
      .from("shift_time_off")
      .select("id, start_date, end_date, reason, status")
      .eq("user_id", auth.userId)
      .neq("status", "cancelled")
      .order("start_date", { ascending: true }),
  ]);

  return NextResponse.json({
    availability: availability.data ?? [],
    timeOff: timeOff.data ?? [],
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const parsed = Body.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validierung fehlgeschlagen", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Admin nicht verfügbar" }, { status: 503 });

  if (parsed.data.kind === "availability") {
    const { error } = await admin.from("shift_availability").insert({
      user_id: auth.userId,
      weekday: parsed.data.weekday,
      start_time: parsed.data.startTime,
      end_time: parsed.data.endTime,
      note: parsed.data.note ?? null,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await admin.from("shift_time_off").insert({
      user_id: auth.userId,
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate,
      reason: parsed.data.reason ?? null,
      status: "approved",
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const url = new URL(request.url);
  const kind = url.searchParams.get("kind");
  const id = url.searchParams.get("id");
  if (!id || (kind !== "availability" && kind !== "time_off")) {
    return NextResponse.json({ error: "kind/id fehlen" }, { status: 400 });
  }

  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Admin nicht verfügbar" }, { status: 503 });

  const table = kind === "availability" ? "shift_availability" : "shift_time_off";
  const { error } = await admin.from(table).delete().eq("id", id).eq("user_id", auth.userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

async function requireUser() {
  const sb = await supabaseServer();
  if (!sb) return { error: "Supabase nicht konfiguriert", status: 503 as const };

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { error: "Nicht eingeloggt", status: 401 as const };

  return { userId: user.id };
}
