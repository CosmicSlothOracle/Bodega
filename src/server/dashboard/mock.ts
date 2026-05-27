/**
 * Deterministic mock data so the Bloom OS dashboard is browsable without a
 * Supabase project configured. Replace with live queries via
 * `src/server/dashboard/queries.ts` once the database is provisioned.
 */

import type {
  BloomEvent,
  Guest,
  Notification,
  Reservation,
  Table,
} from "@/lib/supabase/types";

const todayIso = () => new Date().toISOString().slice(0, 10);
const offsetIso = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const mockTables: Table[] = [
  { id: "t1", number: "B1", capacity: 2, zone: "bodega",   pos_x: 80,  pos_y: 110, active: true },
  { id: "t2", number: "B2", capacity: 2, zone: "bodega",   pos_x: 200, pos_y: 110, active: true },
  { id: "t3", number: "B3", capacity: 4, zone: "bodega",   pos_x: 340, pos_y: 110, active: true },
  { id: "t4", number: "B4", capacity: 4, zone: "bodega",   pos_x: 80,  pos_y: 230, active: true },
  { id: "t5", number: "B5", capacity: 6, zone: "bodega",   pos_x: 240, pos_y: 230, active: true },
  { id: "t6", number: "B6", capacity: 8, zone: "bodega",   pos_x: 420, pos_y: 230, active: true },
  { id: "t7", number: "T1", capacity: 4, zone: "terrasse", pos_x: 80,  pos_y: 380, active: true },
  { id: "t8", number: "T2", capacity: 4, zone: "terrasse", pos_x: 200, pos_y: 380, active: true },
  { id: "t9", number: "T3", capacity: 6, zone: "terrasse", pos_x: 340, pos_y: 380, active: true },
  { id: "t10", number: "T4", capacity: 2, zone: "terrasse", pos_x: 80, pos_y: 480, active: true },
  { id: "t11", number: "T5", capacity: 2, zone: "terrasse", pos_x: 200, pos_y: 480, active: true },
  { id: "t12", number: "BR1", capacity: 2, zone: "bar",    pos_x: 460, pos_y: 110, active: true },
];

export const mockGuests: Guest[] = [
  guest("g1", "Anna",   "Schmidt",  "+49 170 1234567", { vip: true,  visits: 12, allergies: ["Nüsse"], wine: "Rioja Reserva" }),
  guest("g2", "Marco",  "Rossi",    "+49 171 2345678", { visits: 1 }),
  guest("g3", "Sofia",  "Becker",   "+49 172 3456789", { visits: 5, preferences: ["Terrasse"] }),
  guest("g4", "Paul",   "Mayer",    "+49 173 4567890", { visits: 8, vip: true, wine: "Priorat" }),
  guest("g5", "Helena", "Weber",    "+49 174 5678901", { visits: 3, allergies: ["Gluten"] }),
  guest("g6", "Tobias", "Schwarz",  "+49 175 6789012", { visits: 2 }),
  guest("g7", "Julia",  "Krause",   "+49 176 7890123", { visits: 6, preferences: ["Ruhig"] }),
  guest("g8", "David",  "Lehmann",  "+49 177 8901234", { visits: 0 }),
];

export const mockReservations: Reservation[] = [
  reservation("r1", "g1", "t6", todayIso(), "19:00", 6, "dinner",        "confirmed"),
  reservation("r2", "g2", "t1", todayIso(), "18:30", 2, "wine_evening",  "confirmed"),
  reservation("r3", "g3", "t8", todayIso(), "19:30", 4, "dinner",        "confirmed"),
  reservation("r4", "g4", "t5", todayIso(), "20:00", 6, "event_night",   "seated"),
  reservation("r5", "g5", "t10", todayIso(), "20:30", 2, "cocktail_lounge","requested"),
  reservation("r6", "g6", null, todayIso(), "21:00", 3, "dinner",        "requested"),
  reservation("r7", "g7", "t4", todayIso(), "21:30", 4, "wine_evening",  "no_show"),
  reservation("r8", "g8", "t9", todayIso(), "19:30", 5, "dinner",        "confirmed"),
  reservation("r9", "g3", null, offsetIso(1), "19:00", 2, "dinner",      "confirmed"),
  reservation("r10","g1", "t3", offsetIso(2), "20:00", 4, "event_night", "confirmed"),
];

export const mockEvents: BloomEvent[] = [
  bevent("e1", "voices-ivories",  "Voices & Ivories",  offsetIso(20), "20:00",
         "Swing, Rock und Blues live im MusikSommer.", 60, true,  "The Ivory Trio"),
  bevent("e2", "clave-de-sol",    "Clave de Sol",      offsetIso(40), "20:00",
         "Lateinamerikanische Klänge und Sommer-Vibe.", 60, true,  "Clave de Sol Quartet"),
  bevent("e3", "lilia-jones",     "Lilia Jones Special", offsetIso(60), "20:30",
         "Kubanischer Abend im Buena-Vista-Style.", 50, false, "Lilia Jones"),
];

export const mockNotifications: Notification[] = [
  notif("n1", "reservation.created",   "Neue Reservierung", "Anna Schmidt · 6 Gäste · heute 19:00", "manager"),
  notif("n2", "reservation.large",     "Große Gruppe angefragt", "8 Personen · Freitag 20:00 · Tisch noch offen", "owner"),
  notif("n3", "event.almost_full",     "Event fast ausgebucht", "Voices & Ivories · 52/60 verkauft", "marketing"),
  notif("n4", "reservation.no_show",   "No-Show",           "Tobias Schwarz · gestern 21:00", "manager"),
  notif("n5", "review.new",            "Neue Bewertung",    "Google · 5 Sterne · Anna S.", "marketing", true),
];

function guest(
  id: string,
  first: string,
  last: string,
  phone: string,
  opts: {
    vip?: boolean;
    visits?: number;
    allergies?: string[];
    preferences?: string[];
    wine?: string;
  } = {},
): Guest {
  return {
    id,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
    first_name: first,
    last_name: last,
    phone,
    birthday: null,
    vip: opts.vip ?? false,
    allergies: opts.allergies ?? [],
    preferences: opts.preferences ?? [],
    favourite_wine: opts.wine ?? null,
    notes: null,
    lifetime_visits: opts.visits ?? 0,
    dsgvo_consent_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function reservation(
  id: string,
  guestId: string,
  tableId: string | null,
  date: string,
  time: string,
  partySize: number,
  atmosphere: Reservation["atmosphere"],
  status: Reservation["status"],
): Reservation {
  return {
    id,
    guest_id: guestId,
    table_id: tableId,
    date,
    time,
    party_size: partySize,
    atmosphere,
    status,
    source: "internal",
    external_id: null,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    guest: mockGuests.find((g) => g.id === guestId),
    table: mockTables.find((t) => t.id === tableId) ?? undefined,
  };
}

function bevent(
  id: string,
  slug: string,
  title: string,
  date: string,
  startTime: string,
  description: string,
  capacity: number,
  published: boolean,
  dj: string,
): BloomEvent {
  return {
    id,
    slug,
    title,
    date,
    start_time: startTime,
    hero_image: null,
    description,
    capacity,
    ticket_price: null,
    dj,
    published,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function notif(
  id: string,
  kind: string,
  title: string,
  body: string,
  role: Notification["recipient_role"],
  read = false,
): Notification {
  const t = new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 8);
  return {
    id,
    kind,
    title,
    body,
    payload: {},
    recipient_role: role,
    recipient_user: null,
    read_at: read ? t.toISOString() : null,
    created_at: t.toISOString(),
  };
}

export const mockKpis = {
  todayReservations: mockReservations.filter((r) => r.date === todayIso()).length,
  todayCovers: mockReservations
    .filter((r) => r.date === todayIso())
    .reduce((s, r) => s + r.party_size, 0),
  occupancyPct: 72,
  conversionPct: 4.2,
  noShowsThisWeek: 3,
  visitsToday: 1284,
  visitsTrendPct: 14,
  peakTime: "20:00",
  sources: [
    { label: "Google",        share: 38 },
    { label: "Direkt / QR",   share: 22 },
    { label: "Instagram",     share: 17 },
    { label: "ChatGPT / AI",  share: 12 },
    { label: "OpenTable",     share: 7  },
    { label: "Sonstige",      share: 4  },
  ],
  topPages: [
    { path: "/",            views: 412 },
    { path: "/speisekarte", views: 287 },
    { path: "/events",      views: 156 },
    { path: "/reservierung",views: 134 },
    { path: "/galerie",     views:  91 },
    { path: "/ueber-uns",   views:  64 },
  ] as { path: string; views: number }[],
};

export const mockAiTraffic = {
  share: 12,
  top: "ChatGPT",
  pages: [
    { path: "/events",        share: 4.2 },
    { path: "/speisekarte",   share: 3.1 },
    { path: "/",              share: 2.4 },
    { path: "/galerie",       share: 1.5 },
    { path: "/reservierung",  share: 0.8 },
  ],
  llms: [
    { name: "ChatGPT",    sessions: 312 },
    { name: "Perplexity", sessions: 184 },
    { name: "Claude",     sessions: 96  },
    { name: "Gemini",     sessions: 71  },
    { name: "Copilot",    sessions: 22  },
  ],
};
