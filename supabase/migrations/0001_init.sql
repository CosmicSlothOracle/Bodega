-- ─────────────────────────────────────────────────────────────────────────────
-- Bodega Bloom — Hospitality OS schema (init)
-- Idempotent.  Run with `supabase db push` or via the SQL editor.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ── Roles ────────────────────────────────────────────────────────────────────
do $$ begin
  create type bloom_role as enum ('owner', 'manager', 'staff', 'marketing');
exception when duplicate_object then null; end $$;

create table if not exists user_roles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  role        bloom_role not null default 'staff',
  created_at  timestamptz not null default now(),
  invited_by  uuid references auth.users(id),
  display_name text
);

create index if not exists idx_user_roles_role on user_roles (role);

-- Helper: current user's role.
create or replace function bloom_current_role()
returns bloom_role
language sql
stable
security definer
set search_path = public
as $$
  select role from user_roles where user_id = auth.uid();
$$;

-- ── Guests ────────────────────────────────────────────────────────────────────
create table if not exists guests (
  id                uuid primary key default uuid_generate_v4(),
  email             citext unique not null,
  first_name        text not null,
  last_name         text not null,
  phone             text,
  birthday          date,
  vip               boolean not null default false,
  allergies         text[] not null default '{}',
  preferences       text[] not null default '{}',
  favourite_wine    text,
  notes             text,
  lifetime_visits   integer not null default 0,
  dsgvo_consent_at  timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_guests_lastname on guests (last_name);
create index if not exists idx_guests_vip on guests (vip) where vip;

-- ── Tables (physical seating) ────────────────────────────────────────────────
do $$ begin
  create type table_zone as enum ('bodega', 'terrasse', 'bar', 'private');
exception when duplicate_object then null; end $$;

create table if not exists tables (
  id          uuid primary key default uuid_generate_v4(),
  number      text not null,
  capacity    integer not null check (capacity between 1 and 20),
  zone        table_zone not null default 'bodega',
  pos_x       numeric not null default 0,
  pos_y       numeric not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (number, zone)
);

-- ── Time slots ───────────────────────────────────────────────────────────────
create table if not exists time_slots (
  id          uuid primary key default uuid_generate_v4(),
  date        date not null,
  time        time not null,
  capacity    integer not null check (capacity > 0),
  is_event    boolean not null default false,
  notes       text,
  unique (date, time)
);

-- ── Reservations ─────────────────────────────────────────────────────────────
do $$ begin
  create type reservation_status as enum (
    'requested', 'confirmed', 'seated', 'completed', 'no_show', 'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type reservation_source as enum (
    'dish', 'walk_in', 'phone', 'event', 'internal'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type reservation_atmosphere as enum (
    'dinner', 'wine_evening', 'cocktail_lounge', 'event_night'
  );
exception when duplicate_object then null; end $$;

create table if not exists reservations (
  id           uuid primary key default uuid_generate_v4(),
  guest_id     uuid references guests(id) on delete set null,
  table_id     uuid references tables(id) on delete set null,
  date         date not null,
  time         time not null,
  party_size   integer not null check (party_size between 1 and 30),
  atmosphere   reservation_atmosphere,
  status       reservation_status not null default 'requested',
  source       reservation_source not null default 'internal',
  external_id  text unique, -- DISH reservation id, future API hooks, or null for purely internal entries
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_reservations_date on reservations (date);
create index if not exists idx_reservations_status on reservations (status);
create index if not exists idx_reservations_guest on reservations (guest_id);

-- ── Reminder & notification queue ────────────────────────────────────────────
do $$ begin
  create type reminder_kind as enum (
    'confirmation_email', 'reminder_sms_24h', 'review_request'
  );
exception when duplicate_object then null; end $$;

create table if not exists reservation_reminders (
  id              uuid primary key default uuid_generate_v4(),
  reservation_id  uuid not null references reservations(id) on delete cascade,
  kind            reminder_kind not null,
  scheduled_for   timestamptz not null,
  sent_at         timestamptz,
  attempt_count   integer not null default 0,
  last_error      text,
  created_at      timestamptz not null default now(),
  unique (reservation_id, kind)
);

create index if not exists idx_reminders_due
  on reservation_reminders (scheduled_for)
  where sent_at is null;

-- ── Events ───────────────────────────────────────────────────────────────────
create table if not exists events (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,
  title         text not null,
  date          date not null,
  start_time    time,
  hero_image    text,
  description   text,
  capacity      integer,
  ticket_price  numeric(10,2),
  dj            text,
  menu_id       uuid,
  published     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_events_date on events (date);
create index if not exists idx_events_published on events (published);

create table if not exists event_attendees (
  event_id      uuid not null references events(id) on delete cascade,
  guest_id      uuid not null references guests(id) on delete cascade,
  party_size    integer not null default 1,
  created_at    timestamptz not null default now(),
  primary key (event_id, guest_id)
);

-- ── Menu ─────────────────────────────────────────────────────────────────────
create table if not exists menu_sections (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  title       text not null,
  intro       text,
  position    integer not null default 0
);

create table if not exists menu_items (
  id            uuid primary key default uuid_generate_v4(),
  section_id    uuid not null references menu_sections(id) on delete cascade,
  name          text not null,
  description   text,
  price         numeric(10,2) not null,
  allergens     text[] not null default '{}',
  is_vegan      boolean not null default false,
  is_vegetarian boolean not null default false,
  is_spicy      boolean not null default false,
  image         text,
  position      integer not null default 0,
  available     boolean not null default true
);

create index if not exists idx_menu_items_section on menu_items (section_id);

-- ── Media library ────────────────────────────────────────────────────────────
create table if not exists media (
  id           uuid primary key default uuid_generate_v4(),
  storage_path text unique not null,
  alt_text     text,
  caption      text,
  focal_x      numeric default 0.5,
  focal_y      numeric default 0.5,
  width        integer,
  height       integer,
  size_bytes   integer,
  mime_type    text,
  uploaded_by  uuid references auth.users(id),
  created_at   timestamptz not null default now()
);

-- ── Pages (atmosphere copy, ueber-uns blocks, footer story) ──────────────────
create table if not exists pages (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  title       text not null,
  published   boolean not null default true,
  updated_at  timestamptz not null default now()
);

create table if not exists page_blocks (
  id          uuid primary key default uuid_generate_v4(),
  page_id     uuid not null references pages(id) on delete cascade,
  kind        text not null,
  position    integer not null default 0,
  data        jsonb not null default '{}'::jsonb
);

create index if not exists idx_page_blocks_page on page_blocks (page_id, position);

-- ── Notifications & audit ────────────────────────────────────────────────────
create table if not exists notifications (
  id              uuid primary key default uuid_generate_v4(),
  kind            text not null,
  title           text not null,
  body            text,
  payload         jsonb not null default '{}'::jsonb,
  recipient_role  bloom_role,
  recipient_user  uuid references auth.users(id),
  read_at         timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists idx_notifications_unread
  on notifications (created_at desc)
  where read_at is null;

create table if not exists audit_log (
  id          bigserial primary key,
  user_id     uuid references auth.users(id),
  action      text not null,
  entity      text not null,
  entity_id   text,
  diff        jsonb,
  created_at  timestamptz not null default now()
);

-- ── updated_at triggers ──────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare r record;
begin
  for r in
    select tablename from pg_tables
    where schemaname = 'public'
      and tablename in ('guests','reservations','events','pages')
  loop
    execute format(
      'drop trigger if exists trg_%s_updated on %I; '
      'create trigger trg_%s_updated before update on %I '
      'for each row execute function set_updated_at();',
      r.tablename, r.tablename, r.tablename, r.tablename
    );
  end loop;
end $$;
