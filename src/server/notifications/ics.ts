/**
 * Minimal RFC-5545 ICS generator for reservation calendar attachments.
 * No external dep: keeps the bundle small and avoids needless surface.
 */

interface IcsInput {
  uid: string;
  startUtc: Date;
  durationMinutes?: number;
  summary: string;
  description?: string;
  location?: string;
  organizerEmail?: string;
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function toIcsDate(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T` +
    `${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function escapeText(s: string) {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export function buildIcs(input: IcsInput): string {
  const dur = input.durationMinutes ?? 120;
  const end = new Date(input.startUtc.getTime() + dur * 60_000);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bodega Buehlot//Bloom//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${input.uid}`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(input.startUtc)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escapeText(input.summary)}`,
    input.description ? `DESCRIPTION:${escapeText(input.description)}` : null,
    input.location ? `LOCATION:${escapeText(input.location)}` : null,
    input.organizerEmail
      ? `ORGANIZER;CN=Bodega Bühlot:mailto:${input.organizerEmail}`
      : null,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean) as string[];

  return lines.join("\r\n");
}
