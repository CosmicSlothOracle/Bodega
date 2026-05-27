-- ─────────────────────────────────────────────────────────────────────────────
-- RLS policies — role-aware access control for Bloom OS.
--
-- Roles (see 0001_init.sql for the enum):
--   owner     → everything
--   manager   → reservations, guests, events, content, notifications
--   staff     → daily ops on reservations + guests view
--   marketing → analytics + content (events, menu, pages, media)
--
-- Public site reads via the anon key are intentionally restricted:
-- only events with published=true and menu_items where available=true and
-- pages where published=true are readable by anon.
-- Reservations are managed in DISH (external); internal entries (events,
-- private bookings) are inserted via the service-role key only — anon inserts
-- are blocked.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── helpers ──────────────────────────────────────────────────────────────────
create or replace function bloom_has_role(roles bloom_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from user_roles
    where user_id = auth.uid()
      and role = any(roles)
  );
$$;

-- ── enable RLS on every business table ───────────────────────────────────────
alter table user_roles            enable row level security;
alter table guests                enable row level security;
alter table tables                enable row level security;
alter table time_slots            enable row level security;
alter table reservations          enable row level security;
alter table reservation_reminders enable row level security;
alter table events                enable row level security;
alter table event_attendees       enable row level security;
alter table menu_sections         enable row level security;
alter table menu_items            enable row level security;
alter table media                 enable row level security;
alter table pages                 enable row level security;
alter table page_blocks           enable row level security;
alter table notifications         enable row level security;
alter table audit_log             enable row level security;

-- ── user_roles: only owner can write; users may read their own row ───────────
drop policy if exists user_roles_self_read on user_roles;
create policy user_roles_self_read on user_roles
  for select using (auth.uid() = user_id);

drop policy if exists user_roles_owner_all on user_roles;
create policy user_roles_owner_all on user_roles
  for all using (bloom_has_role(array['owner']::bloom_role[]))
         with check (bloom_has_role(array['owner']::bloom_role[]));

-- ── reservations / guests: staff+ can read; manager+ can write ──────────────
drop policy if exists reservations_staff_read on reservations;
create policy reservations_staff_read on reservations
  for select using (bloom_has_role(array['owner','manager','staff']::bloom_role[]));

drop policy if exists reservations_manager_write on reservations;
create policy reservations_manager_write on reservations
  for all using (bloom_has_role(array['owner','manager']::bloom_role[]))
         with check (bloom_has_role(array['owner','manager']::bloom_role[]));

drop policy if exists guests_staff_read on guests;
create policy guests_staff_read on guests
  for select using (bloom_has_role(array['owner','manager','staff','marketing']::bloom_role[]));

drop policy if exists guests_manager_write on guests;
create policy guests_manager_write on guests
  for all using (bloom_has_role(array['owner','manager']::bloom_role[]))
         with check (bloom_has_role(array['owner','manager']::bloom_role[]));

drop policy if exists tables_staff_read on tables;
create policy tables_staff_read on tables
  for select using (bloom_has_role(array['owner','manager','staff']::bloom_role[]));

drop policy if exists tables_manager_write on tables;
create policy tables_manager_write on tables
  for all using (bloom_has_role(array['owner','manager']::bloom_role[]))
         with check (bloom_has_role(array['owner','manager']::bloom_role[]));

drop policy if exists time_slots_staff_read on time_slots;
create policy time_slots_staff_read on time_slots
  for select using (bloom_has_role(array['owner','manager','staff']::bloom_role[]));

drop policy if exists time_slots_manager_write on time_slots;
create policy time_slots_manager_write on time_slots
  for all using (bloom_has_role(array['owner','manager']::bloom_role[]))
         with check (bloom_has_role(array['owner','manager']::bloom_role[]));

drop policy if exists reminders_manager_all on reservation_reminders;
create policy reminders_manager_all on reservation_reminders
  for all using (bloom_has_role(array['owner','manager']::bloom_role[]))
         with check (bloom_has_role(array['owner','manager']::bloom_role[]));

-- ── events: anon reads published; manager + marketing write ─────────────────
drop policy if exists events_public_read on events;
create policy events_public_read on events
  for select using (published);

drop policy if exists events_staff_read on events;
create policy events_staff_read on events
  for select using (bloom_has_role(array['owner','manager','staff','marketing']::bloom_role[]));

drop policy if exists events_marketing_write on events;
create policy events_marketing_write on events
  for all using (bloom_has_role(array['owner','manager','marketing']::bloom_role[]))
         with check (bloom_has_role(array['owner','manager','marketing']::bloom_role[]));

drop policy if exists event_attendees_manager on event_attendees;
create policy event_attendees_manager on event_attendees
  for all using (bloom_has_role(array['owner','manager']::bloom_role[]))
         with check (bloom_has_role(array['owner','manager']::bloom_role[]));

-- ── menu / pages / media: anon reads; marketing writes ──────────────────────
drop policy if exists menu_sections_public_read on menu_sections;
create policy menu_sections_public_read on menu_sections
  for select using (true);

drop policy if exists menu_sections_marketing_write on menu_sections;
create policy menu_sections_marketing_write on menu_sections
  for all using (bloom_has_role(array['owner','manager','marketing']::bloom_role[]))
         with check (bloom_has_role(array['owner','manager','marketing']::bloom_role[]));

drop policy if exists menu_items_public_read on menu_items;
create policy menu_items_public_read on menu_items
  for select using (available);

drop policy if exists menu_items_marketing_write on menu_items;
create policy menu_items_marketing_write on menu_items
  for all using (bloom_has_role(array['owner','manager','marketing']::bloom_role[]))
         with check (bloom_has_role(array['owner','manager','marketing']::bloom_role[]));

drop policy if exists pages_public_read on pages;
create policy pages_public_read on pages
  for select using (published);

drop policy if exists page_blocks_public_read on page_blocks;
create policy page_blocks_public_read on page_blocks
  for select using (
    exists (select 1 from pages p where p.id = page_id and p.published)
  );

drop policy if exists pages_marketing_write on pages;
create policy pages_marketing_write on pages
  for all using (bloom_has_role(array['owner','manager','marketing']::bloom_role[]))
         with check (bloom_has_role(array['owner','manager','marketing']::bloom_role[]));

drop policy if exists page_blocks_marketing_write on page_blocks;
create policy page_blocks_marketing_write on page_blocks
  for all using (bloom_has_role(array['owner','manager','marketing']::bloom_role[]))
         with check (bloom_has_role(array['owner','manager','marketing']::bloom_role[]));

drop policy if exists media_public_read on media;
create policy media_public_read on media
  for select using (true);

drop policy if exists media_marketing_write on media;
create policy media_marketing_write on media
  for all using (bloom_has_role(array['owner','manager','marketing']::bloom_role[]))
         with check (bloom_has_role(array['owner','manager','marketing']::bloom_role[]));

-- ── notifications / audit: staff read own; manager all ──────────────────────
drop policy if exists notifications_staff_read on notifications;
create policy notifications_staff_read on notifications
  for select using (
    recipient_user = auth.uid()
    or recipient_role = bloom_current_role()
    or bloom_has_role(array['owner','manager']::bloom_role[])
  );

drop policy if exists notifications_manager_write on notifications;
create policy notifications_manager_write on notifications
  for all using (bloom_has_role(array['owner','manager']::bloom_role[]))
         with check (bloom_has_role(array['owner','manager']::bloom_role[]));

drop policy if exists audit_owner_read on audit_log;
create policy audit_owner_read on audit_log
  for select using (bloom_has_role(array['owner','manager']::bloom_role[]));
