import { NextResponse } from "next/server";
import { resend } from "@/server/notifications/resend";
import { eventConfirmationEmail } from "@/server/notifications/templates";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Test endpoint that sends one rendered event-confirmation email through
 * Resend. Owner/manager only — verifies that the Resend key, template
 * renderer, and DKIM are all wired up.
 *
 * Usage: GET /api/test-mail?to=deine@mail.de
 */
export async function GET(request: Request) {
  const sb = await supabaseServer();
  if (!sb) {
    return NextResponse.json(
      { error: "Supabase nicht konfiguriert" },
      { status: 503 },
    );
  }

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Nicht eingeloggt" },
      { status: 401 },
    );
  }

  const { data: roleRow } = await sb
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  const role = (roleRow as { role?: string } | null)?.role;
  if (!role || !["owner", "manager"].includes(role)) {
    return NextResponse.json(
      { error: "Owner/Manager-Rolle erforderlich" },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const to = searchParams.get("to");
  if (!to) {
    return NextResponse.json(
      { error: "?to=email required" },
      { status: 400 },
    );
  }

  const template = eventConfirmationEmail({
    guestFirstName: "Leandra",
    eventTitle: "Flamenco Nacht",
    date: "2026-06-14",
    time: "20:00",
    partySize: 2,
    reservationId: "test-00000001",
  });

  try {
    const result = await resend.send({ to, ...template });
    return NextResponse.json({
      ok: true,
      mock: result.mock,
      id: result.id,
      to,
      subject: template.subject,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
