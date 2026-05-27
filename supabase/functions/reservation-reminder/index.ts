// Supabase Edge Function: reservation-reminder
//
// Cron candidate (every 15 minutes via pg_cron / Supabase scheduled triggers).
// Picks reservations that:
//   - are confirmed
//   - happen ~24 hours from now (±15 min window)
//   - haven't already been reminded
// Sends an SMS via Twilio and records the reminder in `reservation_reminders`.
//
// Env vars expected (Supabase project secrets):
//   SUPABASE_URL                 (auto-provided)
//   SUPABASE_SERVICE_ROLE_KEY    (auto-provided as SUPABASE_SERVICE_ROLE)
//   TWILIO_ACCOUNT_SID
//   TWILIO_AUTH_TOKEN
//   TWILIO_FROM_NUMBER
//
// Deploy: `supabase functions deploy reservation-reminder --no-verify-jwt`

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
    Deno.env.get("SUPABASE_SERVICE_ROLE")!,
  { auth: { persistSession: false } },
);

const twilio = {
  sid: Deno.env.get("TWILIO_ACCOUNT_SID") ?? "",
  token: Deno.env.get("TWILIO_AUTH_TOKEN") ?? "",
  from: Deno.env.get("TWILIO_FROM_NUMBER") ?? "",
};

async function sendSms(to: string, body: string) {
  if (!twilio.sid || !twilio.token || !twilio.from) {
    console.info("[reminder] twilio not configured; skip", to);
    return;
  }
  const auth = btoa(`${twilio.sid}:${twilio.token}`);
  const params = new URLSearchParams({ To: to, From: twilio.from, Body: body });
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${twilio.sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    },
  );
  if (!res.ok) throw new Error(`twilio ${res.status} ${await res.text()}`);
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date(y, m - 1, d));
}

Deno.serve(async () => {
  // Reservations within the next 23h45m–24h15m window, status confirmed,
  // without an existing 'reminder_sms_24h' reminder row.
  const nowIso = new Date().toISOString();
  const lo = new Date(Date.now() + 23.75 * 3600 * 1000).toISOString();
  const hi = new Date(Date.now() + 24.25 * 3600 * 1000).toISOString();

  const { data: candidates, error } = await supabase
    .from("reservations")
    .select(
      "id, date, time, party_size, guest:guests(first_name, phone, email)",
    )
    .eq("status", "confirmed")
    .gte("date", new Date(lo).toISOString().slice(0, 10))
    .lte("date", new Date(hi).toISOString().slice(0, 10));

  if (error) {
    console.error("query failed", error);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  let sent = 0;
  let skipped = 0;

  for (const r of candidates ?? []) {
    const startMs = Date.parse(`${r.date}T${r.time}+02:00`);
    if (
      Number.isNaN(startMs) ||
      startMs < Date.parse(lo) ||
      startMs > Date.parse(hi)
    ) {
      skipped++;
      continue;
    }

    const guest = (r as any).guest;
    if (!guest?.phone) {
      skipped++;
      continue;
    }

    // Idempotency: insert the reminder row up-front; if it already exists, skip.
    const { error: insErr } = await supabase
      .from("reservation_reminders")
      .insert({
        reservation_id: r.id,
        kind: "reminder_sms_24h",
        scheduled_for: nowIso,
      });
    if (insErr) {
      skipped++;
      continue;
    }

    try {
      await sendSms(
        guest.phone,
        `Hola ${guest.first_name}! Wir sehen uns morgen, ${fmtDate(
          r.date,
        )} um ${String(r.time).slice(0, 5)} Uhr in der Bodega Bühlot. ¡Salud!`,
      );
      await supabase
        .from("reservation_reminders")
        .update({ sent_at: new Date().toISOString() })
        .eq("reservation_id", r.id)
        .eq("kind", "reminder_sms_24h");
      sent++;
    } catch (err) {
      await supabase
        .from("reservation_reminders")
        .update({
          attempt_count: 1,
          last_error: err instanceof Error ? err.message : String(err),
        })
        .eq("reservation_id", r.id)
        .eq("kind", "reminder_sms_24h");
    }
  }

  return new Response(JSON.stringify({ ok: true, sent, skipped }), {
    headers: { "content-type": "application/json" },
  });
});
