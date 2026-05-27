/**
 * Lightweight hand-written types mirroring the Bloom OS schema (see
 * `supabase/migrations/`). When the Supabase project is provisioned, replace
 * this with `supabase gen types typescript --project-id <ref> > src/lib/supabase/types.gen.ts`.
 */

export type BloomRole = "owner" | "manager" | "staff" | "marketing";

export type ReservationStatus =
  | "requested"
  | "confirmed"
  | "seated"
  | "completed"
  | "no_show"
  | "cancelled";

export type ReservationSource =
  | "dish"
  | "walk_in"
  | "phone"
  | "event"
  | "internal";

export type ReservationAtmosphere =
  | "dinner"
  | "wine_evening"
  | "cocktail_lounge"
  | "event_night";

export type TableZone = "bodega" | "terrasse" | "bar" | "private";

export interface Guest {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  birthday: string | null;
  vip: boolean;
  allergies: string[];
  preferences: string[];
  favourite_wine: string | null;
  notes: string | null;
  lifetime_visits: number;
  dsgvo_consent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: string;
  guest_id: string | null;
  table_id: string | null;
  date: string;
  time: string;
  party_size: number;
  atmosphere: ReservationAtmosphere | null;
  status: ReservationStatus;
  source: ReservationSource;
  external_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  guest?: Guest;
  table?: Table;
}

export interface Table {
  id: string;
  number: string;
  capacity: number;
  zone: TableZone;
  pos_x: number;
  pos_y: number;
  active: boolean;
}

export interface BloomEvent {
  id: string;
  slug: string;
  title: string;
  date: string;
  start_time: string | null;
  hero_image: string | null;
  description: string | null;
  capacity: number | null;
  ticket_price: number | null;
  dj: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuSection {
  id: string;
  slug: string;
  title: string;
  intro: string | null;
  position: number;
  items?: MenuItem[];
}

export interface MenuItem {
  id: string;
  section_id: string;
  name: string;
  description: string | null;
  price: number;
  allergens: string[];
  is_vegan: boolean;
  is_vegetarian: boolean;
  is_spicy: boolean;
  image: string | null;
  position: number;
  available: boolean;
}

export interface Notification {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  payload: Record<string, unknown>;
  recipient_role: BloomRole | null;
  recipient_user: string | null;
  read_at: string | null;
  created_at: string;
}

export type ShiftRole =
  | "service"
  | "kitchen"
  | "bar"
  | "host"
  | "manager_on_duty";

export type ShiftSwapStatus =
  | "pending"
  | "approved"
  | "accepted_by_target"
  | "finalized"
  | "expired"
  | "rejected"
  | "cancelled";

export type ShiftSwapKind = "exchange" | "takeover";

export interface Shift {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  role: ShiftRole;
  notes: string | null;
  published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShiftAssignment {
  id: string;
  shift_id: string;
  user_id: string;
  created_at: string;
  shift?: Shift;
  display_name?: string;
}

export interface ShiftSwap {
  id: string;
  assignment_id: string;
  target_assignment_id: string | null;
  requester_id: string;
  target_user_id: string;
  kind: ShiftSwapKind;
  reason: string | null;
  status: ShiftSwapStatus;
  accept_token_hash: string | null;
  accept_token_prefix: string | null;
  accepted_by_target_at: string | null;
  finalized_at: string | null;
  expires_at: string;
  decided_by: string | null;
  decided_at: string | null;
  decision_note: string | null;
  created_at: string;
  assignment?: ShiftAssignment;
  requester_display_name?: string;
}
