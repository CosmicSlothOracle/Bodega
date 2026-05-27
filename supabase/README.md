# Supabase — Bloom OS backend

Single source of truth for the Bodega Bloom Hospitality OS database, RLS, and
Edge Functions. Apply with the Supabase CLI:

```bash
# 1. Install once
npm i -g supabase

# 2. Link this folder to your project
supabase login
supabase link --project-ref <YOUR_PROJECT_REF>

# 3. Apply migrations
supabase db push

# 4. Deploy edge functions
supabase functions deploy reservation-reminder --no-verify-jwt
supabase secrets set TWILIO_ACCOUNT_SID=... TWILIO_AUTH_TOKEN=... TWILIO_FROM_NUMBER=...

# 5. Schedule the cron (every 15 minutes)
#    via Dashboard → Database → Cron, or:
supabase db query "select cron.schedule(
  'reservation-reminder', '*/15 * * * *',
  $$ select net.http_post(
       url := '<edge-fn-url>/reservation-reminder',
       headers := jsonb_build_object('Authorization','Bearer ' || current_setting('app.cron_secret'))
     ); $$
);"
```

## Environment

Required Supabase project settings:

| Setting | Where | Purpose |
|---|---|---|
| Email auth | Auth → Providers | Magic-link only (no signup) |
| Service role key | Settings → API | `SUPABASE_SERVICE_ROLE_KEY` env in the Next app |
| Anon key | Settings → API | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Project URL | Settings → API | `NEXT_PUBLIC_SUPABASE_URL` |

## Inviting your first owner

Roles are not auto-assigned. After the first user signs in via magic-link:

```sql
insert into user_roles (user_id, role, display_name)
values ('<auth.users.id>', 'owner', 'Leandra Ehinger');
```

## Schema overview

| Table | Owner role to write | Notes |
|---|---|---|
| `guests`               | manager+         | DSGVO consent timestamp recorded |
| `reservations`         | manager+         | internal entries only (events, walk-ins, manual) — DISH owns online bookings |
| `reservation_reminders`| manager+ (cron)  | idempotent reminder queue (event reminders) |
| `tables`               | manager+         | x/y for visual table plan |
| `time_slots`           | manager+         | seeded for next 60 days |
| `events`               | marketing+       | `published=true` is publicly readable |
| `event_attendees`      | manager+         | join table |
| `menu_sections/items`  | marketing+       | publicly readable |
| `media`                | marketing+       | publicly readable |
| `pages` / `page_blocks`| marketing+       | publicly readable when `published` |
| `notifications`        | manager+         | recipient-aware reads |
| `audit_log`            | manager+ read    | append-only |

## Public-facing reads

Anonymous users (the public site) can read:
- `events` where `published = true`
- `menu_sections` (always)
- `menu_items` where `available = true`
- `pages` where `published = true` and their `page_blocks`
- `media` (always — assumed public assets)

## Reservations

Online reservations live in **DISH** (https://reservation.dish.co), not in
Supabase. The Bodega Bloom site collects date/time/party-size in a Bloom-styled
prefilter and hands the user off to `https://reserve.dish.co/{restaurant_id}`
with the values appended as query parameters. "Reserve with Google" runs
through the same DISH integration.

The `reservations` table in Supabase is reserved for **internal** entries
(events, walk-ins, manual private bookings) and is only writable via the
service-role key — anon clients cannot insert reservation rows.
