# Architecture Decisions

Short ADRs (Architecture Decision Records) for choices that shape the codebase.
Each entry: context · decision · consequences. Append new ADRs at the bottom.

---

## ADR-001 — Reservations: DISH, not aleno

**Date:** 2026-05-07
**Status:** Accepted
**Supersedes:** original Bloom manifest §2 / §6 / §7 ("aleno" reservation engine)

### Context

The original plan (`Bodega Bloom — Backend & Hospitality Operations`) named
`aleno` as the Phase-1 reservation engine, with a custom 6-step UI calling the
aleno REST API and mirroring data into Supabase. During the Phase-A walkthrough
the owner confirmed two material facts:

1. The restaurant already has an active **DISH Reservation** contract
   (`reserve.dish.co/343512`) with **Reserve with Google** configured.
2. Staff already operate the DISH backoffice; the Google review pipeline (4.9★)
   is anchored to the same Google Business Profile DISH integrates with.

`aleno` would have meant a new vendor contract, duplicate staff training, and
data migration risk — for benefits (Reserve with Google, multi-channel inbox)
DISH already provides.

### Decision

Use **DISH** as the booking engine. Bloom collects date/time/party-size in a
4-step Bloom-styled prefilter on `/reservierung` and hands the user off to
`https://reserve.dish.co/<id>?date=…&time=…&persons=…&seats=…&guests=…`. DISH
owns the booking, confirmation email, "Reserve with Google", staff app and
no-show handling.

DISH does not publish a stable REST API for reservation creation; URL-param
prefill is best-effort (we append the three field names DISH has historically
used and degrade gracefully if any are ignored — the user re-enters at most
three values on the DISH page).

### Consequences

- **Removed:** `src/server/reservations/{aleno,service,types}.ts`,
  `src/app/api/reservations/{route,webhook/route}.ts`,
  `src/components/reservation/{ReservationFlow,Step{Atmosphere,Contact,Confirmation},state}.{ts,tsx}`.
- **Added:** `src/lib/reservation/dish.ts` (URL builder),
  `src/components/reservation/DishPrefilter.tsx` (4-step prefilter + handover screen).
- The Supabase `reservations` table is no longer the source of truth for online
  bookings — it is reserved for **internal entries** (event ticket sales,
  walk-ins, manual private bookings). Anon writes remain blocked by RLS.
- The Supabase `reservation_source` enum changed from
  `('web','aleno','walk_in','phone')` → `('dish','walk_in','phone','event','internal')`.
  The `aleno_id` column was renamed `external_id` to keep a future-friendly
  field for any partner-API integration.
- `/dashboard/reservierungen` ships a banner ("Reservierungen werden in DISH
  verwaltet") with a deep-link to the DISH backoffice. The visual TablePlan
  still renders against internal entries.
- `/api/reservations` is gone; analytics tracks the handover via outbound
  click on the "Weiter zur Buchung" button.

### Reversibility

The `serverEnv()` separation and the small `dish.ts` helper keep the boundary
thin. If DISH later grants partner-API access, the same prefilter UI can post
to a new server endpoint instead of redirecting — Bloom OS would then own a
live DISH reservation list. No schema migration needed beyond re-enabling a
DISH-native `source` value (already in the enum).

---

## ADR-002 — DISH stays deeplink-only (no partner API)

**Date:** 2026-05-08
**Status:** Accepted
**Refines:** ADR-001

### Context

After ADR-001 we evaluated whether to layer a synced reservation list on top of
DISH (so `/dashboard/reservierungen` could mirror DISH bookings). DISH does not
publish a stable partner API for read or write access, and any unofficial
scraping pattern would couple Bloom to internal DISH schemas we do not control.

### Decision

The Bloom dashboard does **not** mirror DISH bookings. The `reservations`
table in Supabase tracks **internal** entries only (phone bookings, walk-ins,
private/event reservations entered via Quick-Add). DISH remains the single
source of truth for online bookings; staff continues to operate the DISH
backoffice for any cross-channel views.

### Consequences

- `/dashboard/reservierungen` ships a permanent banner pointing to the DISH
  backoffice and a "+ Telefonbuchung" Quick-Add button that writes through
  `/api/reservations/internal` into Supabase with `source = 'phone'`.
- The visual table-plan (`TablePlan.tsx`) is no longer rendered on the page —
  see ADR-004 for the listing view that replaces it.
- No background job pulls from DISH. No webhook listens. No queue exists.

### Reversibility

If DISH releases a partner API later, we add a new `dish-sync` Edge Function
that writes incoming bookings with `source = 'dish'` and re-render the
dashboard against the unified table. Schema-wise nothing changes; the
`reservation_source` enum already contains `'dish'`.

---

## ADR-003 — Staff messaging: Telegram Bot, not WhatsApp Business API

**Date:** 2026-05-08
**Status:** Accepted

### Context

The Phase-F brief asked for an automatic notification channel for the
restaurant team (shift publication, swap requests, swap decisions). Two
realistic options:

1. **WhatsApp Business API via Twilio** — most familiar app for the team, but
   requires Meta Business verification (1–2 weeks), template approval per
   message kind, ~5–10 ¢/conversation, and a Twilio WhatsApp sender.
2. **Telegram Bot API** — free, no verification, full automation, instant.
   Trade-off: each staff member must install Telegram once.

### Decision

Build on the **Telegram Bot API**. The team is small (≈8–15 people), the
opt-in step is one-time, and the cost/integration profile is dramatically
better.

For *guests* we keep the original strategy: SMS via Twilio plus a `wa.me/…`
deeplink in the confirmation page. This avoids the WhatsApp Business
overhead while still meeting guests where they prefer to reply.

### Consequences

- New module `src/server/notifications/telegram.ts` with a `sendMessage`
  helper that mocks when `TELEGRAM_BOT_TOKEN` is missing.
- New columns on `user_roles`: `telegram_chat_id`, `telegram_invite_code`,
  `telegram_linked_at` (migration `0004_shifts_and_telegram.sql`).
- New routes:
  - `POST /api/telegram/invite` — owner generates a one-time onboarding
    link `https://t.me/<bot>?start=<code>`.
  - `POST /api/telegram/webhook` — Telegram delivers `/start <code>`, the
    handler captures the chat ID and clears the invite code.
- The shifts module (ADR-???) and the swap workflow trigger
  `telegram.sendMessage` for assigned staff and decision-maker(s).
- ENV: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`,
  `TELEGRAM_WEBHOOK_SECRET`.

### Reversibility

Adding WhatsApp Business later is additive: keep the Telegram path, add a
`src/server/notifications/whatsapp.ts` helper, and per-user
opt-in (`user_roles.preferred_channel`). Existing call sites already route
through a thin layer.

---

## ADR-004 — Reservation dashboard: list, not floor plan

**Date:** 2026-05-08
**Status:** Accepted

### Context

The Phase-A floor-plan UI (`TablePlan.tsx`) rendered a SVG of the room with
hover details per table. Two findings made it less useful than expected:

1. We do not see DISH online bookings, so the floor plan only ever reflects
   the small subset of internal entries — most tables are always empty in the
   plan, which misleads the eye.
2. The actual operational workflow during service is sequential
   (time → guest → status), not spatial. Staff already use DISH for the
   spatial view.

### Decision

Replace the floor-plan widget on `/dashboard/reservierungen` with a single
list view (Time · Guest · Party · Table · Note · Status), and add a
"+ Telefonbuchung" Quick-Add button at the top right. The DISH banner +
backoffice deeplink stay above the list.

### Consequences

- `TablePlan.tsx` remains in the codebase but is no longer rendered. We can
  bring it back later as a drawer on a list row if a real seating-plan
  workflow emerges.
- The list adapts to source variety (phone, event, internal) via a small
  source label in the note column.
- The page is dramatically simpler on mobile.

### Reversibility

The component still exists and renders independently against a
`tables` + `reservations` pair. Re-mounting it is a one-line import.

---

## ADR-005 — PostHog: autocapture on, server-side query API for KPIs

**Date:** 2026-05-08
**Status:** Accepted

### Context

PostHog was initialised in Phase A but with `autocapture: false` and
`persistence: "memory"`, which meant the dashboard's KPI cards still came
from `mockKpis`. We needed real visitor numbers, source breakdowns, and a
funnel that didn't require us to instrument every CTA by hand.

### Decision

- Enable `autocapture: true` in the public site so PostHog records every
  click + form submit (cookieless thanks to `persistence: "memory"`).
- Add a small set of named custom events (`reservation_clicked`,
  `dish_redirect`, `menu_viewed`, `event_clicked`, `contact_clicked`) at
  the strategic conversion points so funnels stay portable across
  PostHog UI changes.
- Build a server-side query reader (`src/server/analytics/posthog.ts`) that
  pulls `visitsToday`, `visitsTrendPct` and source share via the HogQL
  query API. The personal API key never reaches the browser.
- `getKpis()` becomes async and falls back to mock numbers when PostHog is
  not configured, so dev environments still render meaningful KPIs.

### Consequences

- New ENV: `POSTHOG_API_HOST`, `POSTHOG_PROJECT_ID`,
  `POSTHOG_PERSONAL_API_KEY`.
- `MockBanner` reflects whether PostHog has the personal key, separate from
  the browser SDK key.
- Heat-maps and full path-analysis live in PostHog's own UI (linked from
  the dashboard).

### Reversibility

Reverting to mock-only is a one-line change in `getKpis()`. The autocapture
flag can be flipped per environment without redeploying server code.

---

## ADR-006 — PostHog as the single web-analytics provider (Plausible removed)

### Context

The original Phase B plan paired Plausible (classic reach: visits, sources)
with PostHog (product analytics: events, autocapture, funnels). After
Phase F we observed:

- The dashboard's Plausible iframe required the public dashboard to be
  toggled on in Plausible **and** an active Plausible subscription
  (~14 €/month for the smallest plan that includes embeds).
- PostHog already exposes the same data via the HogQL Query API
  (`visits_today`, `top_sources`, `top_pages`, conversion-style funnels)
  and in our Bloom OS dashboard we render them server-side without any
  cross-origin iframe.
- Operating two analytics SDKs roughly doubled the maintenance + privacy
  surface (two cookie disclosures, two outage paths, two retention
  policies in the Datenschutz copy) for a feature set we already cover.

### Decision

- Remove the Plausible script from `<Analytics />` and the
  `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` env var.
- Replace the embedded Plausible iframe in `/dashboard/analytics` with
  a native Bloom-styled `TopPagesWidget` driven by the existing
  PostHog server reader (`fetchPostHogKpis()`).
- Update the Datenschutz page to declare PostHog as the only reach
  measurement, hosted on `eu.i.posthog.com`, cookieless via
  `persistence: "memory"`.
- The dashboard analytics surface (`getKpis()` → `KpiCard`s,
  `TopPagesWidget`, `AiTrafficWidget`) is intentionally left as a
  composable extension point: any future custom statistic is added by
  extending the server reader and rendering a new widget — no embed
  permissions, no third-party script.

### Consequences

- One fewer paid SaaS line item (~14 €/month saved).
- One fewer external script blocked by Firefox Enhanced Tracking
  Protection / uBlock — fewer empty iframes for end users / staff who
  use strict browsers.
- All web analytics live in **one** UI for staff, with the Bloom OS
  dashboard as the daily-use front end.
- Custom statistics (e.g. peak-time histogram, geographic breakdown,
  conversion-by-source) are now feature-flagless: just add a HogQL
  query to `src/server/analytics/posthog.ts` and a widget under
  `src/components/dashboard/`.

### Reversibility

A self-hosted Plausible / Umami / Matomo can be added back as an
additional widget without ripping out PostHog. The widget contract is
`{ pages, visits, sources, ... } → JSX`, so any provider that exposes
those numbers can be plugged in side-by-side.

---

## ADR-007: Schichtplaner v2 — Three-Action Model, Auto-Final, Magic-Link Confirm

**Date:** 2026-05-11

**Status:** Accepted

### Context

Phase F2 extends the shift planner with interactive swap and takeover flows
for staff. Design requirements from research of production shift-management
tools (7shifts, Sling, Planday, Deputy):

1. **Three distinct actions** — not just "find cover":
   - **Exchange** (1:1 swap): two staff members trade their shifts
   - **Takeover**: one staff member asks another to take over their shift
     (no swap required)
   - **Open Shift** (deferred): post a shift to an available pool
2. **Auto-final** — once the target staff member accepts, the swap executes
   immediately (no manager approval loop). Manager is notified but doesn't
   gate the swap.
3. **Multi-channel confirm** — target staff can accept/reject via:
   - Dashboard UI
   - Telegram inline button (1-click)
   - Email magic-link (1-click, no login)
4. **72h auto-expiry** — pending swaps cancel automatically to prevent
   limbo states.

### Decision

**Data Model:**

- `shift_swap_kind` enum: `'exchange' | 'takeover'`
- `shift_swaps` table extended:
  - `kind`: enum distinguishing swap type
  - `target_user_id`: the staff member receiving the request
  - `target_assignment_id`: (for exchange only) the shift they're giving up
  - `accept_token_hash`: SHA-256 of the magic-link token (single-use)
  - `expires_at`: 72h from creation, auto-cancelled by cron
  - Status: `pending → accepted_by_target → finalized | rejected | cancelled | expired`
- DB function `finalize_swap(swap_id)` atomically swaps `user_id` values
  in `shift_assignments` (or assigns target to requester's shift for
  takeover). Runs in a single transaction.

**Swap Service:**

Central `src/server/shifts/swapService.ts` handles all state transitions:

- `acceptSwap(swapId, by: 'dashboard' | 'telegram' | 'magic_link')`
- `rejectSwap(swapId, ...)`
- `cancelSwap(swapId)` (requester only)
- `expireOldSwaps()` (cron)

All entry points (dashboard API, Telegram webhook callback_query, magic-link
route `/api/shifts/swap/confirm`) call the same service, ensuring consistent
validation and notifications.

**Telegram Inline Buttons:**

- `telegram.sendMessage` now accepts `replyMarkup: { inline_keyboard }`
- Swap notification includes `[Annehmen]` and `[Ablehnen]` buttons
- Callback data: `swap:accept:<swap_id>:<short_token>`
- Webhook route extended to handle `callback_query` updates

**Magic-Link Email:**

- Token: 32-byte random, base64url-encoded
- Hash stored in `shift_swaps.accept_token_hash` (SHA-256)
- Link: `https://.../api/shifts/swap/confirm?token=...&action=accept|reject`
- Renders a static confirmation page (no login required)
- Single-use via status transition

**Staff Dashboard:**

- Role-aware layout: staff see only Home, Reservierungen
- Staff Home shows:
  - Today's shift (above the fold)
  - Swap requests addressed to them (inline accept/reject)
  - My open swap requests (with cancel)
  - Upcoming shifts
  - Today's occupancy (reservation count + guest count)

**Manager Dashboard:**

- Week grid with drag&drop (via `@dnd-kit`)
- Conflict detection: warns if user already assigned in overlapping time
- Inline publish toggle per shift

### Consequences

- **No approval bottleneck:** Staff-to-staff swaps execute immediately,
  reducing manager workload. Manager receives info notification.
- **No limbo:** 72h expiry + original shift responsibility (until finalized)
  prevents "ghost" shifts.
- **Multi-channel confirm:** 1-click accept via Telegram or email reduces
  friction. Staff don't need to log in to respond.
- **Atomic DB transaction:** `finalize_swap()` ensures no partial state
  (both shifts swapped or none).
- **Single source of truth:** All swap logic in `swapService.ts`, reused
  by three entry points. Bugs fixed once, apply everywhere.
- **Extensible:** Open Shift pool prepared in schema but UI deferred to
  later iteration. Compliance guards (max hours/week) deferred to Phase F5
  (Gehaltsabrechnungen).

### Trade-offs

- **No manager veto:** Auto-final means manager can't block swaps
  preemptively. Trade-off accepted for 8–15 person team where trust is
  high. If needed, manager can manually reverse in emergency (via direct
  DB access or future admin override UI).
- **72h window:** Staff have 3 days to respond. Shorter window (24h)
  considered but rejected to avoid weekend/off-day pressure.

### Reversibility

- Can reintroduce manager approval by changing state machine:
  `accepted_by_target → pending_manager_approval → finalized`
- Can shorten expiry to 24h or 48h by updating default in migration
- Open Shift pool ready for activation: UI + server endpoint, no schema
  change needed

---

## ADR-008 — Magic-Link single-factor for current surface, Telegram-OTP Step-up before F5

**Date:** 2026-05-11
**Status:** Accepted

### Context

During a security review, the question arose whether passwordless Magic-Link authentication is sufficient or if Multi-Factor Authentication (MFA) is required. The current surface area of the application (Phase F2) exposes shift schedules and internal reservations.

### Decision

We defer the implementation of MFA. The current Magic-Link single-factor authentication is deemed sufficient for the current data sensitivity.

When we approach Phase F5 (Gehaltsabrechnungen / Payroll), which introduces highly sensitive personal and financial data, we will implement a "Telegram-OTP Step-up" for sensitive routes.

### Consequences

- No immediate action required for MFA.
- The onboarding friction remains low for the current team.
- Phase F5 roadmap is updated to include Telegram-OTP Step-up as a prerequisite.

### Reversibility

If the data sensitivity profile changes before Phase F5, we can prioritize the Telegram-OTP Step-up earlier. The Telegram Bot infrastructure is already in place (ADR-003).

