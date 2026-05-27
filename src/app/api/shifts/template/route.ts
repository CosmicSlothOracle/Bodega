import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

const Entry = z.object({
  dayOffset: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  role: z.enum(["service", "kitchen", "bar", "host", "manager_on_duty"]),
  notes: z.string().max(500).nullable(),
  assignedUserIds: z.array(z.string().uuid()).max(20),
});

const SaveBody = z.object({
  entries: z.array(Entry).max(80),
});

const ApplyBody = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  published: z.boolean().optional(),
});

async function requireManager() {
  const sb = await supabaseServer();
  if (!sb) return { error: "Supabase nicht konfiguriert", status: 503 as const };

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { error: "Nicht eingeloggt", status: 401 as const };

  const { data: roleRow } = await sb
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const role = (roleRow as { role?: string } | null)?.role;
  if (!role || !["owner", "manager"].includes(role)) {
    return { error: "Owner/Manager-Rolle erforderlich", status: 403 as const };
  }

  return { userId: user.id };
}

export async function GET() {
  const auth = await requireManager();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Admin nicht verfügbar" }, { status: 503 });

  const { data, error } = await admin
    .from("shift_week_templates")
    .select("id, name, entries")
    .eq("is_default", true)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Vorlage konnte nicht geladen werden", detail: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ template: data ?? null });
}

export async function POST(request: Request) {
  const auth = await requireManager();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const parsed = SaveBody.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validierung fehlgeschlagen", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Admin nicht verfügbar" }, { status: 503 });

  await admin
    .from("shift_week_templates")
    .delete()
    .eq("is_default", true);

  const { data, error } = await admin
    .from("shift_week_templates")
    .insert({
      name: "Standard",
      is_default: true,
      entries: parsed.data.entries,
      created_by: auth.userId,
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Vorlage konnte nicht gespeichert werden", detail: error?.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, id: (data as { id: string }).id });
}

export async function PUT(request: Request) {
  const auth = await requireManager();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const parsed = ApplyBody.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validierung fehlgeschlagen", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Admin nicht verfügbar" }, { status: 503 });

  const { data: template } = await admin
    .from("shift_week_templates")
    .select("entries")
    .eq("is_default", true)
    .maybeSingle();

  const entries = ((template as { entries?: z.infer<typeof Entry>[] } | null)
    ?.entries ?? []);
  if (entries.length === 0) {
    return NextResponse.json({ error: "Keine Vorlage gespeichert" }, { status: 404 });
  }

  const insertedShiftIds: string[] = [];
  for (const entry of entries) {
    const date = addDaysIso(parsed.data.weekStart, entry.dayOffset);
    const { data: shift, error: shiftErr } = await admin
      .from("shifts")
      .insert({
        date,
        start_time: entry.startTime,
        end_time: entry.endTime,
        role: entry.role,
        notes: entry.notes,
        published: parsed.data.published ?? false,
        created_by: auth.userId,
      })
      .select("id")
      .single();

    if (shiftErr || !shift) {
      return NextResponse.json(
        { error: "Schicht aus Vorlage konnte nicht erstellt werden", detail: shiftErr?.message },
        { status: 500 },
      );
    }

    const shiftId = (shift as { id: string }).id;
    insertedShiftIds.push(shiftId);
    if (entry.assignedUserIds.length > 0) {
      const { error: assignErr } = await admin.from("shift_assignments").insert(
        entry.assignedUserIds.map((userId) => ({ shift_id: shiftId, user_id: userId })),
      );
      if (assignErr) {
        return NextResponse.json(
          { error: "Zuweisung aus Vorlage fehlgeschlagen", detail: assignErr.message },
          { status: 500 },
        );
      }
    }
  }

  return NextResponse.json({ ok: true, created: insertedShiftIds.length });
}

export async function DELETE() {
  const auth = await requireManager();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Admin nicht verfügbar" }, { status: 503 });

  const { error } = await admin
    .from("shift_week_templates")
    .delete()
    .eq("is_default", true);

  if (error) {
    return NextResponse.json(
      { error: "Vorlage konnte nicht gelöscht werden", detail: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

function addDaysIso(iso: string, delta: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}
