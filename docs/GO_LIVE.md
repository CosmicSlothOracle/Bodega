# Bloom · Go-Live Checklist

Everything required to flip `bodega-web` from mock-mode preview to a live
production deploy. Walk top-to-bottom; nothing here requires writing code.

## 1. Content & assets

The current build ships with the existing photo set under `public/gallery/` and
`public/assets/` — enough for a credible launch but the manifest's "magazine
look" benefits from a richer library.

### Photo brief (8–12 additional shots)

Shoot at golden hour and during service. Cinematic, narrative, never sterile.

| Slot | Subject | Use |
|---|---|---|
| Hero ×3       | Hands pouring wine · candles · steam off a tapas plate · close-up cutlery | `heroSlides` in [`src/content/home.ts`](../src/content/home.ts) |
| Atmosphäre ×2 | Wide interior at dusk · terrace dawn/blue-hour | `atmosphere.image` |
| Food ×4       | Patatas bravas drop · gambas plating · padrón sizzle · croquetas hand-off | `signatureFood` cards (optional thumbs) |
| Wein ×2       | Glass-by-glass pour · sherry on a wood bar | `wineCocktails.image` |
| Galerie ×3    | One vertical, one wide, one square — guests, hands, conversation | `gallery` masonry |

**Specs:** sRGB, longest edge ≥ 2400 px, JPEG q 85+. The Next/Image pipeline
(`next.config.ts`) re-encodes to AVIF/WebP at deploy time.

### Copy to confirm

- `/ueber-uns` brand story — in [`src/app/(bloom)/ueber-uns/page.tsx`](../src/app/(bloom)/ueber-uns/page.tsx). Replace placeholder body with Leandra's voice.
- `/datenschutz` — verify language with the lawyer; the current text is a
  good-faith DSGVO baseline, not legal advice.
- `/speisekarte` — current items in [`src/content/menu.ts`](../src/content/menu.ts) are sample. Swap with the real, current Tapaskarte.

### Branding

- `/public/og-image.jpg` — currently absent. Generate a 1200×630 OpenGraph card
  using the Bloom palette (Cormorant headline + Inter sub, Bloom Wine background).
- `/public/favicon.ico` and `/public/apple-touch-icon.png` already exist; verify
  they match the new identity.

## 2. Accounts & secrets

Get keys for each integration, drop into `.env.local` (dev) and the hosting
platform (prod). Until set, the system stays in graceful mock-mode.

| Integration | Where | Notes |
|---|---|---|
| **Supabase** | https://supabase.com/dashboard | Create project · copy URL + anon + service_role · set in `.env` |
| **DISH**     | https://reservation.dish.co (existing contract) | Just needs `NEXT_PUBLIC_DISH_RESTAURANT_ID` (default `343512`). "Reserve with Google" is configured inside the DISH backoffice. |
| **Resend**   | https://resend.com/api-keys | Verify `bodega-buehlot.de` DKIM + SPF (event confirmations) |
| **Twilio**   | https://console.twilio.com | A SMS-capable EU number — only required for event reminders |
| **PostHog**  | https://eu.posthog.com | Project API key (browser SDK), Personal API key + Project ID (server-side KPI fetch). Single source of truth for web analytics — see ADR-006. |

## 3. Supabase bring-up

```bash
supabase login
supabase link --project-ref <ref>
supabase db push                                              # applies 0001..0003
supabase functions deploy reservation-reminder --no-verify-jwt
supabase secrets set TWILIO_ACCOUNT_SID=… TWILIO_AUTH_TOKEN=… TWILIO_FROM_NUMBER=…
supabase secrets set TELEGRAM_BOT_TOKEN=…
```

> Migration `0004_shifts_and_telegram.sql` adds the shifts/swap tables and
> the `telegram_chat_id` / `telegram_invite_code` columns on `user_roles`.

Schedule the reminder cron in the Supabase Dashboard → Database → Cron, every
15 minutes. Then invite the first owner:

```sql
insert into user_roles (user_id, role, display_name)
values ('<auth.users.id>', 'owner', 'Leandra Ehinger');
```

## 4. DISH wiring

Online reservations live entirely in DISH — Bloom hands off via deep-link.

1. Confirm in the DISH backoffice that `bodega-buehlot.de` is the public URL
   listed on the Google Business Profile (where "Reserve with Google" pulls
   the booking widget from).
2. Optional: customize the DISH widget colors to match Bloom (Wine + Ochre)
   in the DISH backoffice settings.
3. Smoke-test:
   - open `/reservierung` on the live site, choose a date/time/party-size
   - confirm the redirect lands on `https://reserve.dish.co/<id>?date=…&time=…&persons=…`
   - confirm the booking lands in DISH backoffice
   - confirm the customer receives DISH's confirmation email
4. (Optional, future) If DISH grants partner-API access, layer it into
   `/dashboard/reservierungen` to show a live list inside Bloom OS.

## 5. Payload CMS (when ready)

Currently a config skeleton. To activate:

```bash
npm i payload @payloadcms/next @payloadcms/db-postgres @payloadcms/richtext-lexical
```

Set `DATABASE_URL` to the Supabase Postgres connection string and follow
[Payload's "install in existing Next.js"](https://payloadcms.com/docs/getting-started/installation)
guide to scaffold `src/app/(payload)/admin/[...segments]/page.tsx`. Replace the
stub at `src/app/admin/page.tsx` once the real mount is live.

## 6. Hardening before launch

- Set production env vars in your host (Vercel / Render / etc.).
- Verify Lighthouse on `/` and `/reservierung` — Perf ≥ 90, A11y ≥ 95, SEO ≥ 95.
- Confirm `/robots.txt` disallows `/dashboard /admin /login /api`.
- Confirm `/sitemap.xml` lists all 10 public routes.
- DSGVO: PostHog runs cookieless (`persistence: "memory"`); no second
  analytics provider is loaded — no cookie banner needed for analytics.
  Re-confirm if
  any new vendor is added.
- 301 redirects from any old reservation paths → `/reservierung`.
- Run the smoke test against the preview URL **before** flipping DNS:
  `npm run smoke -- https://<your-preview>.vercel.app`. Failures on public
  routes block the cutover; failures on `/dashboard*` are expected (302 to
  `/login`) and are tolerated by the script.

## 6a. Telegram bot bring-up

1. Create the bot via [@BotFather](https://t.me/BotFather) (already done:
   `@Bodega_Buehlot_bot`). Drop the token into `.env.local` and Vercel as
   `TELEGRAM_BOT_TOKEN`. Set `TELEGRAM_BOT_USERNAME=Bodega_Buehlot_bot`.
2. Generate a random `TELEGRAM_WEBHOOK_SECRET` (32 chars) and add it to both
   environments.
3. Register the webhook once after the production URL is live:
   ```bash
   curl -F "url=https://bodega-buehlot.de/api/telegram/webhook" \
        -F "secret_token=$TELEGRAM_WEBHOOK_SECRET" \
        https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook
   ```
4. Onboard each staff member from the Bloom dashboard:
   `Einstellungen → Team → Telegram-Einladung erzeugen` posts to
   `/api/telegram/invite` and returns a one-time `https://t.me/<bot>?start=<code>`
   link the owner forwards to the staff member. The bot stores the chat ID on
   first `/start <code>` and the staff member then receives shift + swap
   notifications automatically.

## 6b. Domain cutover (Phase E)

Run **after** F1 + F2 + F4 + F6 are green and the smoke test passes.

| Schritt | Wer | Notiz |
|---|---|---|
| 1. TTL der bestehenden A/CNAME-Records auf 300 Sek senken (~1 h vor Cutover) | Alte IT | Reduziert Propagation auf Minuten |
| 2. Vercel: `bodega-buehlot.de` + `www.bodega-buehlot.de` als Custom Domain hinzufügen | Entwicklung | Vercel zeigt die Ziel-A/CNAME-Werte |
| 3. DNS-Records bei Domain-Registrar umbiegen | Alte IT | A → 76.76.21.21, CNAME `www` → cname.vercel-dns.com |
| 4. SSL-Zertifikat (Let's Encrypt) abwarten | Vercel automatisch | typisch 30 s–5 min |
| 5. Smoke-Test gegen die Apex-Domain | Entwicklung | `npm run smoke -- https://bodega-buehlot.de` |
| 6. DKIM/SPF/DMARC-Records für `bodega-buehlot.de` aus Resend übernehmen | Alte IT + Entwicklung | erst danach `RESEND_FROM` zurück auf `hola@bodega-buehlot.de` setzen |
| 7. Telegram-Webhook auf Production-URL umstellen (siehe 6a) | Entwicklung | nur einmal nötig |
| 8. Google Business Profile: Website-URL bestätigen (URL bleibt) | Owner | bestehende Reviews bleiben |
| 9. Altes Hosting nach 7 Tagen Puffer kündigen | Alte IT | Domain bleibt registriert |

**Reviews & SEO bleiben unangetastet** — Google hängt sie an das Business
Profile, nicht an Domain oder Hosting.

## 7. Monitoring

- Supabase Dashboard → Logs for DB and Edge Function output.
- PostHog → Reservation funnel: `pageview /reservierung` → outbound click on
  `reserve.dish.co` (autocapture + custom `dish_redirect` event from
  `src/lib/analytics/track.ts`). PostHog also feeds the Bloom OS
  `/dashboard/analytics` KPIs server-side via the HogQL Query API.
- Resend → delivery + bounce dashboard (event confirmations).
- Twilio → message log + opt-out replies (event reminders).
- DISH backoffice → daily reservation list, no-show flags, Google booking
  source breakdown.
