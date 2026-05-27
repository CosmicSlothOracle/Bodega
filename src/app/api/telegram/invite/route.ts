import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { buildOnboardingLink } from "@/server/notifications/telegram";

/**
 * POST /api/telegram/invite
 *
 * Owner generates a one-time onboarding code for a staff member. The code
 * is stored on `user_roles.telegram_invite_code`; the response includes
 * the `https://t.me/<bot>?start=<code>` link the owner forwards to the
 * staff member (out-of-band — email, paper, in person).
 */

const Body = z.object({
  userId: z.string().uuid(),
});

function randomCode(): string {
  // Telegram start parameters allow [A-Za-z0-9_-]{0,64}. 12 chars from the
  // safe alphabet is enough entropy for a one-time code.
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const buf = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(buf, (b) => alphabet[b % alphabet.length]).join("");
}

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
  if (role !== "owner") {
    return NextResponse.json({ error: "Nur Owner darf Einladungen generieren" }, { status: 403 });
  }

  const parsed = Body.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Validierung fehlgeschlagen" }, { status: 400 });
  }

  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Admin-Client nicht verfügbar" }, { status: 503 });

  const code = randomCode();
  const { error } = await admin
    .from("user_roles")
    .update({
      telegram_invite_code: code,
      telegram_chat_id: null,
      telegram_linked_at: null,
    })
    .eq("user_id", parsed.data.userId);

  if (error) {
    return NextResponse.json({ error: "Update fehlgeschlagen", detail: error.message }, { status: 500 });
  }

  const link = buildOnboardingLink(code);
  return NextResponse.json({
    ok: true,
    code,
    link, // null when TELEGRAM_BOT_USERNAME is not configured
  });
}
