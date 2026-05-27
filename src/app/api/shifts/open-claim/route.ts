import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

const Body = z.object({
  shiftId: z.string().uuid(),
});

export async function POST(request: Request) {
  const sb = await supabaseServer();
  if (!sb) return NextResponse.json({ error: "Supabase nicht konfiguriert" }, { status: 503 });

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });

  const parsed = Body.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validierung fehlgeschlagen", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Admin nicht verfügbar" }, { status: 503 });

  const { data: shift } = await admin
    .from("shifts")
    .select("id, published, date, start_time")
    .eq("id", parsed.data.shiftId)
    .maybeSingle();

  const typedShift = shift as
    | { id: string; published: boolean; date: string; start_time: string }
    | null;
  if (!typedShift?.published) {
    return NextResponse.json({ error: "Offene Schicht nicht gefunden" }, { status: 404 });
  }

  const startsAt = new Date(`${typedShift.date}T${typedShift.start_time}`);
  if ((startsAt.getTime() - Date.now()) / 3600000 < 24) {
    return NextResponse.json(
      { error: "Übernahme ist nur bis 24 Stunden vor Schichtbeginn möglich" },
      { status: 400 },
    );
  }

  const { data: existing } = await admin
    .from("shift_assignments")
    .select("id")
    .eq("shift_id", typedShift.id)
    .limit(1);
  if ((existing ?? []).length > 0) {
    return NextResponse.json({ error: "Schicht ist bereits vergeben" }, { status: 409 });
  }

  const { error } = await admin
    .from("shift_assignments")
    .insert({ shift_id: typedShift.id, user_id: user.id });

  if (error) {
    return NextResponse.json(
      { error: "Schicht konnte nicht übernommen werden", detail: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
