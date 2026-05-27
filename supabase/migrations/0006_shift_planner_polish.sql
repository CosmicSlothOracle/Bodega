-- ─────────────────────────────────────────────────────────────────────────────
-- Bodega Bühlot — Phase F3: Schichtplaner Polish
--
-- Adds:
--   1. token prefix storage for Telegram inline swap verification
--   2. reusable owner/manager weekly shift templates
--   3. staff availability and time-off primitives for planning guards
--
-- Idempotent. Safe to run multiple times.
-- ─────────────────────────────────────────────────────────────────────────────

alter table shift_swaps
  add column if not exists accept_token_prefix text;

create index if not exists idx_swaps_token_prefix
  on shift_swaps (id, accept_token_prefix)
  where status = 'pending';

create table if not exists shift_week_templates (
  id          uuid primary key default gen_random_uuid(),
  name        text not null default 'Standard',
  is_default  boolean not null default true,
  entries     jsonb not null default '[]'::jsonb,
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create unique index if not exists idx_shift_week_templates_single_default
  on shift_week_templates (is_default)
  where is_default;

create table if not exists shift_availability (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  weekday     smallint not null check (weekday between 1 and 7),
  start_time  time not null,
  end_time    time not null,
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_shift_availability_user_weekday
  on shift_availability (user_id, weekday);

create table if not exists shift_time_off (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  start_date  date not null,
  end_date    date not null,
  reason      text,
  status      text not null default 'approved'
              check (status in ('requested', 'approved', 'rejected', 'cancelled')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (end_date >= start_date)
);

create index if not exists idx_shift_time_off_user_range
  on shift_time_off (user_id, start_date, end_date);

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_shift_week_templates_updated') then
    create trigger trg_shift_week_templates_updated
      before update on shift_week_templates
      for each row execute function set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_shift_availability_updated') then
    create trigger trg_shift_availability_updated
      before update on shift_availability
      for each row execute function set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_shift_time_off_updated') then
    create trigger trg_shift_time_off_updated
      before update on shift_time_off
      for each row execute function set_updated_at();
  end if;
end $$;

alter table shift_week_templates enable row level security;
alter table shift_availability enable row level security;
alter table shift_time_off enable row level security;

drop policy if exists shift_week_templates_manager_all on shift_week_templates;
create policy shift_week_templates_manager_all on shift_week_templates
  for all using (bloom_has_role(array['owner','manager']::bloom_role[]))
         with check (bloom_has_role(array['owner','manager']::bloom_role[]));

drop policy if exists shift_availability_self_read on shift_availability;
create policy shift_availability_self_read on shift_availability
  for select using (
    user_id = auth.uid()
    or bloom_has_role(array['owner','manager']::bloom_role[])
  );

drop policy if exists shift_availability_self_write on shift_availability;
create policy shift_availability_self_write on shift_availability
  for all using (
    user_id = auth.uid()
    or bloom_has_role(array['owner','manager']::bloom_role[])
  )
  with check (
    user_id = auth.uid()
    or bloom_has_role(array['owner','manager']::bloom_role[])
  );

drop policy if exists shift_time_off_self_read on shift_time_off;
create policy shift_time_off_self_read on shift_time_off
  for select using (
    user_id = auth.uid()
    or bloom_has_role(array['owner','manager']::bloom_role[])
  );

drop policy if exists shift_time_off_self_write on shift_time_off;
create policy shift_time_off_self_write on shift_time_off
  for all using (
    user_id = auth.uid()
    or bloom_has_role(array['owner','manager']::bloom_role[])
  )
  with check (
    user_id = auth.uid()
    or bloom_has_role(array['owner','manager']::bloom_role[])
  );
