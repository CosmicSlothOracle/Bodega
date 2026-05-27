/**
 * Transactional email + SMS templates.
 *
 * Reservation confirmations are handled by DISH directly — Bloom only sends
 * messages for things DISH doesn't cover:
 *   - Event ticket confirmations (when we sell event tickets via Supabase)
 *   - Event reminder SMS (24h before)
 *   - Owner / staff reports
 *
 * All templates are pure functions returning { subject, html, text } so they
 * can be unit-tested without network calls.
 */

import { site } from "@/lib/site";

export interface EventConfirmationCtx {
  guestFirstName: string;
  eventTitle: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  partySize: number;
  reservationId: string;
}

export function eventConfirmationEmail(ctx: EventConfirmationCtx) {
  const dateLabel = formatGermanDate(ctx.date);
  const subject = `${ctx.eventTitle} · ${dateLabel} bestätigt`;

  const html = `<!doctype html>
  <html lang="de">
  <body style="margin:0;background:#161616;font-family:Inter,system-ui,sans-serif;color:#F3EEE6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#161616;padding:40px 0;">
      <tr><td align="center">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#1d1614;border:1px solid rgba(216,199,170,.14);border-radius:24px;padding:40px;">
          <tr><td>
            <p style="font-size:11px;letter-spacing:.32em;text-transform:uppercase;color:#8B7A3D;margin:0 0 8px;">Bodega Bühlot</p>
            <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:400;font-size:40px;line-height:1.1;color:#F3EEE6;margin:0 0 16px;">
              Hola ${escapeHtml(ctx.guestFirstName)} – wir freuen uns auf den Abend.
            </h1>
            <p style="font-size:16px;line-height:1.65;color:#d8c7aa;margin:0 0 24px;">
              Dein Platz für <strong>${escapeHtml(ctx.eventTitle)}</strong> ist bestätigt.
            </p>
            <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 28px;">
              ${row("Event", ctx.eventTitle)}
              ${row("Datum", dateLabel)}
              ${row("Beginn", `${ctx.time} Uhr`)}
              ${row("Personen", String(ctx.partySize))}
              ${row("Ref", ctx.reservationId.slice(0, 12))}
            </table>
            <p style="font-size:14px;line-height:1.65;color:#d8c7aa;margin:0 0 24px;">
              Den Kalendereintrag findest du im Anhang. Falls etwas dazwischenkommt:
              <a style="color:#8B7A3D;" href="tel:${site.contact.phone}">${site.contact.phoneDisplay}</a>.
            </p>
            <p style="font-size:14px;line-height:1.65;color:#d8c7aa;margin:0;">
              Bis bald.<br/>
              <strong style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:400;font-size:18px;color:#F3EEE6;">${site.name}</strong>
            </p>
          </td></tr>
        </table>
        <p style="font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#6F7356;margin:24px 0 0;">
          ${site.contact.address.street} · ${site.contact.address.zip} ${site.contact.address.city}
        </p>
      </td></tr>
    </table>
  </body></html>`;

  const text = [
    `Hola ${ctx.guestFirstName} – wir freuen uns auf den Abend.`,
    "",
    `Event:    ${ctx.eventTitle}`,
    `Datum:    ${dateLabel}`,
    `Beginn:   ${ctx.time} Uhr`,
    `Personen: ${ctx.partySize}`,
    `Ref:      ${ctx.reservationId.slice(0, 12)}`,
    "",
    `${site.name} · ${site.contact.address.street}, ${site.contact.address.zip} ${site.contact.address.city}`,
    `${site.contact.phoneDisplay} · ${site.contact.email}`,
  ].join("\n");

  return { subject, html, text };
}

export function eventReminderSms({
  guestFirstName,
  eventTitle,
  date,
  time,
}: {
  guestFirstName: string;
  eventTitle: string;
  date: string;
  time: string;
}) {
  return `Hola ${guestFirstName}! Morgen ${formatGermanDate(date)} um ${time} Uhr: ${eventTitle} – wir freuen uns auf dich. Bodega Bühlot · ${site.contact.phoneDisplay}`;
}

function row(label: string, value: string) {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid rgba(216,199,170,.12);font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#8B7A3D;width:140px;">${label}</td>
    <td style="padding:10px 0;border-bottom:1px solid rgba(216,199,170,.12);font-family:'Cormorant Garamond',Georgia,serif;font-weight:400;font-size:20px;color:#F3EEE6;">${escapeHtml(value)}</td>
  </tr>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatGermanDate(iso: string) {
  const [y, m, d] = iso.split("-").map((n) => Number(n));
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(y, m - 1, d, 12, 0, 0)));
}

// ── Shift swap emails ────────────────────────────────────────────────────────

export interface SwapRequestEmailCtx {
  kind: "exchange" | "takeover";
  requesterName: string;
  targetName: string;
  requesterShift: {
    date: string;
    startTime: string;
    endTime: string;
    role: string;
  };
  targetShift?: {
    date: string;
    startTime: string;
    endTime: string;
    role: string;
  };
  reason?: string;
  acceptUrl: string;
  rejectUrl: string;
}

export function swapRequestEmail(ctx: SwapRequestEmailCtx) {
  const kindLabel = ctx.kind === "exchange" ? "Schichttausch" : "Schichtübernahme";
  const subject =
    ctx.kind === "exchange"
      ? `${ctx.requesterName} möchte Schichten tauschen`
      : `${ctx.requesterName} bittet um Schichtübernahme`;

  const html = `<!doctype html>
  <html lang="de">
  <body style="margin:0;background:#161616;font-family:Inter,system-ui,sans-serif;color:#F3EEE6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#161616;padding:40px 0;">
      <tr><td align="center">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#1d1614;border:1px solid rgba(216,199,170,.14);border-radius:24px;padding:40px;">
          <tr><td>
            <p style="font-size:11px;letter-spacing:.32em;text-transform:uppercase;color:#8B7A3D;margin:0 0 8px;">Bodega Bühlot · ${kindLabel}</p>
            <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:400;font-size:36px;line-height:1.1;color:#F3EEE6;margin:0 0 16px;">
              Hola ${escapeHtml(ctx.targetName)}
            </h1>
            <p style="font-size:16px;line-height:1.65;color:#d8c7aa;margin:0 0 24px;">
              <strong>${escapeHtml(ctx.requesterName)}</strong> ${
                ctx.kind === "exchange" ? "möchte mit dir Schichten tauschen" : "bittet dich, eine Schicht zu übernehmen"
              }.
            </p>

            <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 28px;">
              <tr><td colspan="2" style="padding:10px 0;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#8B7A3D;">${
                ctx.kind === "exchange" ? "Schicht von " + escapeHtml(ctx.requesterName) : "Zu übernehmende Schicht"
              }</td></tr>
              ${row("Datum", formatGermanDate(ctx.requesterShift.date))}
              ${row("Zeit", `${ctx.requesterShift.startTime}–${ctx.requesterShift.endTime} Uhr`)}
              ${row("Rolle", ctx.requesterShift.role)}
              ${
                ctx.targetShift
                  ? `<tr><td colspan="2" style="padding:24px 0 10px;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#8B7A3D;">Deine Schicht</td></tr>
              ${row("Datum", formatGermanDate(ctx.targetShift.date))}
              ${row("Zeit", `${ctx.targetShift.startTime}–${ctx.targetShift.endTime} Uhr`)}
              ${row("Rolle", ctx.targetShift.role)}`
                  : ""
              }
              ${ctx.reason ? `<tr><td colspan="2" style="padding:24px 0 10px;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#8B7A3D;">Begründung</td></tr>
              <tr><td colspan="2" style="padding:10px 0;color:#d8c7aa;font-size:14px;line-height:1.65;">${escapeHtml(ctx.reason)}</td></tr>` : ""}
            </table>

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td style="padding:0 6px 0 0;">
                  <a href="${ctx.acceptUrl}" style="display:block;background:#8B7A3D;color:#161616;text-align:center;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;">✓ Annehmen</a>
                </td>
                <td style="padding:0 0 0 6px;">
                  <a href="${ctx.rejectUrl}" style="display:block;background:transparent;border:1px solid rgba(216,199,170,.2);color:#d8c7aa;text-align:center;padding:14px 24px;border-radius:12px;text-decoration:none;font-size:14px;">✗ Ablehnen</a>
                </td>
              </tr>
            </table>

            <p style="font-size:12px;line-height:1.65;color:#6F7356;margin:24px 0 0;text-align:center;">
              Oder im <a href="${site.url}/dashboard" style="color:#8B7A3D;">Dashboard</a> antworten.
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;

  const text = [
    `Hola ${ctx.targetName},`,
    "",
    `${ctx.requesterName} ${ctx.kind === "exchange" ? "möchte mit dir Schichten tauschen" : "bittet dich, eine Schicht zu übernehmen"}.`,
    "",
    `${ctx.kind === "exchange" ? "Schicht von " + ctx.requesterName : "Zu übernehmende Schicht"}:`,
    `  ${formatGermanDate(ctx.requesterShift.date)}`,
    `  ${ctx.requesterShift.startTime}–${ctx.requesterShift.endTime} Uhr`,
    `  ${ctx.requesterShift.role}`,
    ctx.targetShift
      ? [
          "",
          "Deine Schicht:",
          `  ${formatGermanDate(ctx.targetShift.date)}`,
          `  ${ctx.targetShift.startTime}–${ctx.targetShift.endTime} Uhr`,
          `  ${ctx.targetShift.role}`,
        ].join("\n")
      : "",
    ctx.reason ? `\nBegründung: ${ctx.reason}` : "",
    "",
    `Annehmen: ${ctx.acceptUrl}`,
    `Ablehnen: ${ctx.rejectUrl}`,
    "",
    `Oder im Dashboard antworten: ${site.url}/dashboard`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

export interface SwapFinalizedEmailCtx {
  recipientName: string;
  kind: "exchange" | "takeover";
  partnerName: string;
  yourNewShift: {
    date: string;
    startTime: string;
    endTime: string;
    role: string;
  };
}

export function swapFinalizedEmail(ctx: SwapFinalizedEmailCtx) {
  const subject =
    ctx.kind === "exchange"
      ? `Schichttausch mit ${ctx.partnerName} bestätigt`
      : `Schichtübernahme bestätigt`;

  const html = `<!doctype html>
  <html lang="de">
  <body style="margin:0;background:#161616;font-family:Inter,system-ui,sans-serif;color:#F3EEE6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#161616;padding:40px 0;">
      <tr><td align="center">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#1d1614;border:1px solid rgba(216,199,170,.14);border-radius:24px;padding:40px;">
          <tr><td>
            <p style="font-size:11px;letter-spacing:.32em;text-transform:uppercase;color:#8B7A3D;margin:0 0 8px;">Bodega Bühlot</p>
            <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:400;font-size:36px;line-height:1.1;color:#F3EEE6;margin:0 0 16px;">
              ✓ ${ctx.kind === "exchange" ? "Tausch bestätigt" : "Übernahme bestätigt"}
            </h1>
            <p style="font-size:16px;line-height:1.65;color:#d8c7aa;margin:0 0 24px;">
              ${
                ctx.kind === "exchange"
                  ? `Dein Schichttausch mit <strong>${escapeHtml(ctx.partnerName)}</strong> wurde akzeptiert.`
                  : `<strong>${escapeHtml(ctx.partnerName)}</strong> übernimmt deine Schicht.`
              }
            </p>

            <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 28px;">
              <tr><td colspan="2" style="padding:10px 0;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#8B7A3D;">Deine neue Schicht</td></tr>
              ${row("Datum", formatGermanDate(ctx.yourNewShift.date))}
              ${row("Zeit", `${ctx.yourNewShift.startTime}–${ctx.yourNewShift.endTime} Uhr`)}
              ${row("Rolle", ctx.yourNewShift.role)}
            </table>

            <p style="font-size:14px;line-height:1.65;color:#d8c7aa;margin:0;">
              Schau im <a href="${site.url}/dashboard" style="color:#8B7A3D;">Dashboard</a> für Details.
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;

  const text = [
    `Hola ${ctx.recipientName},`,
    "",
    ctx.kind === "exchange"
      ? `Dein Schichttausch mit ${ctx.partnerName} wurde akzeptiert.`
      : `${ctx.partnerName} übernimmt deine Schicht.`,
    "",
    "Deine neue Schicht:",
    `  ${formatGermanDate(ctx.yourNewShift.date)}`,
    `  ${ctx.yourNewShift.startTime}–${ctx.yourNewShift.endTime} Uhr`,
    `  ${ctx.yourNewShift.role}`,
    "",
    `Details im Dashboard: ${site.url}/dashboard`,
  ].join("\n");

  return { subject, html, text };
}
