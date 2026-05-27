# Bodega Bühlot — Phase F2 Deployment Checklist

**Schichtplaner v2: 3-Action-Model, Auto-Final, Magic-Link**

> Status zuletzt aktualisiert: 2026-05-11. Nach jeder größeren Änderung
> hier den Wahrheitsabgleich (Code ↔ Doku) erneuern.

## 🔍 Vorbereitung: Bug-Check & Implementierungs-Review

### ✅ Implementiert und live im Code

- [x] Migration `0004_shifts_and_telegram.sql` (Telegram-Spalten, shifts,
      shift_assignments, shift_swaps v1)
- [x] Migration `0005_shift_swaps_v2.sql` (idempotent: `kind`-Enum,
      `target_user_id`, `accept_token_hash`, `expires_at`, RPC
      `finalize_swap()`)
- [x] Zentraler `src/server/shifts/swapService.ts`
      (acceptSwap/rejectSwap/cancelSwap/expireOldSwaps + Telegram- &
      Email-Notifications)
- [x] Magic-Link Tokens (`src/server/shifts/swapToken.ts`): 32-Byte random,
      SHA-256-gehasht in DB, single-use
- [x] E-Mail-Templates (`swapRequestEmail`, `swapFinalizedEmail`) +
      `eventConfirmationEmail` als Test-Surface
- [x] Telegram-Bot: Onboarding via `/start <code>`, inline-Buttons via
      `callback_query` (alle 3 Entry-Points → ein swapService)
- [x] Role-aware Dashboard-Layout: Staff sieht nur Home + Reservierungen,
      Owner/Manager das volle Menu
- [x] StaffHome (`/dashboard` für Rolle `staff`) zeigt: heutige Schicht,
      Swap-Anfragen-an-mich (1-Klick), kommende Schichten, eigene
      offene Anfragen mit Cancel, heutige Auslastung
- [x] StaffHome-Buttons **funktional verdrahtet** über 3 Client-Components:
      `SwapResponseButtons` (Annehmen/Ablehnen), `SwapActionButtons`
      (Tauschen/Übernehmen mit Wizard für Target-User + Target-Shift),
      `CancelSwapButton`
- [x] API: `POST /api/shifts/swap` (Anfrage erstellen),
      `PATCH /api/shifts/swap` (Dashboard-Response — accept/reject/cancel
      via swapService), `GET /api/shifts/swap/confirm` (Magic-Link),
      `GET /api/team` (Team-Liste für Wizard),
      `GET /api/team/[userId]/shifts` (Target-Shift-Picker)
- [x] Manager Week Grid mit Drag&Drop (`@dnd-kit`) — `WeekGrid` +
      `WeekGridContainer` auf `/dashboard/schichten` aktiv (ersetzt das
      simple Tag-Grid). Konflikt-Erkennung bei überschneidenden Schichten.
- [x] ADR-007 dokumentiert (3-Action-Model + Auto-Final + Magic-Link)
- [x] TypeScript-Check grün (`npm run typecheck`)
- [x] ESLint grün (`npm run lint`) — 0 Errors, 0 Warnings
- [x] Smoke-Skript erweitert (`scripts/smoke.mjs`) um:
      `/dashboard/schichten/anfragen` + `/dashboard/meine-schichten` →
      404 (Legacy-Routen entfernt), Swap-API-Guards (POST/PATCH ohne Auth
      → 401), Magic-Link ohne Token → 400, Telegram-Webhook ohne Secret →
      401, Team-API ohne Auth → 401

### ⚠️ Bewusst zurückgestellt

- **Open-Shift-Pool UI** — Datenmodell in `shift_swap_kind` vorbereitet,
  Surface fehlt (kein Blocker)
- **WeekGrid Inline-Edit-Drawer** — aktuell nur Placeholder im
  Edit-Modal; Schicht-Bearbeitung läuft weiter über den `ShiftEditor`
  oben auf der Page
- **Compliance-Guards** (Max-Stunden/Woche, Mindestpause) — Phase F5
  (Gehaltsabrechnungen) zusammen mit Lohnabrechnung umsetzen
- **24h-Vorab-Reminder** an Staff — Cron + Edge-Function vorbereitet
  (`expireOldSwaps`), Reminder-Variante fehlt noch

### ❌ Bekannte Lücken die Cutover-relevant sind

- `RESEND_FROM=onboarding@resend.dev` (Sandbox) ist gesetzt — Mails gehen
  aktuell nur an die in Resend verifizierte Owner-Adresse. Vor dem
  Cutover: DKIM/SPF/DMARC für `bodega-buehlot.de` einrichten und
  `RESEND_FROM` auf `Bodega Bühlot <hola@bodega-buehlot.de>` umstellen
- Telegram-Webhook ist auf Vercel-Preview noch nicht registriert
  (siehe Schritt 3️⃣ unten)

---

## 📋 Deployment-Schritte

### 1️⃣ Datenbank-Migration anwenden

**Lokal (Dev):**

```bash
cd bodega-web
npx supabase db push
```

**Produktion (Supabase Dashboard):**

1. Öffne [Supabase Dashboard](https://supabase.com/dashboard) → dein Projekt
2. SQL Editor → New Query
3. Kopiere den Inhalt von `supabase/migrations/0005_shift_swaps_v2.sql`
4. Execute
5. Verifiziere:
   ```sql
   -- Prüfe neue Enum-Werte
   SELECT unnest(enum_range(NULL::shift_swap_status));
   SELECT unnest(enum_range(NULL::shift_swap_kind));
   
   -- Prüfe neue Spalten
   \d shift_swaps
   
   -- Prüfe Funktion
   \df finalize_swap
   ```

**Rollback-Plan (falls nötig):**

```sql
-- Falls Migration fehlschlägt, neue Spalten rückgängig machen:
ALTER TABLE shift_swaps
  DROP COLUMN IF EXISTS kind,
  DROP COLUMN IF EXISTS target_assignment_id,
  DROP COLUMN IF EXISTS target_user_id,
  DROP COLUMN IF EXISTS accept_token_hash,
  DROP COLUMN IF EXISTS accepted_by_target_at,
  DROP COLUMN IF EXISTS finalized_at,
  DROP COLUMN IF EXISTS expires_at;

DROP FUNCTION IF EXISTS finalize_swap(uuid);
DROP TYPE IF EXISTS shift_swap_kind;
```

---

### 2️⃣ Environment Variables prüfen

**In Vercel Dashboard → Settings → Environment Variables:**

Stelle sicher, dass folgende Vars **für Production UND Preview** gesetzt sind:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST` (https://eu.i.posthog.com)
- `POSTHOG_PERSONAL_API_KEY` (für Server-KPIs)
- `POSTHOG_PROJECT_ID`
- `RESEND_API_KEY`
- `RESEND_FROM` (z.B. `Bodega Bühlot <hola@bodega-buehlot.de>`)
- `NEXT_PUBLIC_DISH_RESTAURANT_ID`
- `NEXT_PUBLIC_SITE_URL` (z.B. `https://bodega-gray.vercel.app`)

---

### 3️⃣ Telegram Webhook konfigurieren

**Nach dem ersten Deploy:**

1. Erstelle Test-Script `scripts/setup-telegram-webhook.mjs`:

```javascript
import "dotenv/config";

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const webhookUrl = process.env.NEXT_PUBLIC_SITE_URL + "/api/telegram/webhook";
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!botToken || !webhookUrl || !secret) {
  console.error("Missing env vars");
  process.exit(1);
}

const res = await fetch(
  `https://api.telegram.org/bot${botToken}/setWebhook`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: secret,
      allowed_updates: ["message", "callback_query"],
    }),
  },
);

const data = await res.json();
console.log("Webhook setup:", data);
```

2. Ausführen:

```bash
node scripts/setup-telegram-webhook.mjs
```

3. Verifizieren:

```bash
curl https://api.telegram.org/bot<DEIN_TOKEN>/getWebhookInfo
```

---

### 4️⃣ Test-Szenario durchspielen

#### A) Staff-User anlegen

1. Dashboard → Einstellungen → Team
2. Neuen Mitarbeiter einladen mit Rolle `staff`
3. Magic-Link aus Email öffnen
4. Telegram-Onboarding durchführen (falls noch nicht)

#### B) Schicht erstellen & zuweisen

1. Als Owner/Manager: Dashboard → Schichten
2. Neue Schicht erstellen (z.B. morgen 12:00-18:00, Service)
3. Staff-User per Drag&Drop zuweisen
4. Schicht veröffentlichen
5. **Erwartung:** Staff bekommt Telegram-Notification

#### C) Tausch-Flow testen (Dashboard-Wizard, kein curl mehr nötig)

Die UI ist seit ADR-007 (Phase F2-Final) komplett verdrahtet. Test-Pfad:

1. **Als Staff 1 einloggen** → `/dashboard` (StaffHome).
2. Auf einer kommenden Schicht (≥ 24h Vorlauf) **Tauschen** oder
   **Übernehmen** klicken.
3. Wizard-Schritt 1: Kolleg:in aus dem Picker wählen (`/api/team`).
4. Bei `Tauschen` (`kind = exchange`): Wizard-Schritt 2 lädt die
   passenden Schichten der gewählten Person (gleiche Rolle, in der
   Zukunft) via `/api/team/<userId>/shifts?role=…`.
5. Optionalen Grund eintragen, Anfrage senden.

**Erwartungen direkt nach Submit:**

1. Target-Staff bekommt Telegram-Nachricht mit Inline-Buttons (✓ / ✗)
2. Target-Staff bekommt Email mit Magic-Link (1-Klick Accept/Reject)
3. Klick auf „Annehmen" in **Telegram, Email oder Dashboard** ruft alle
   drei `swapService.acceptSwap()` auf → `finalize_swap()` führt den
   atomaren Swap aus → beide bekommen eine Bestätigungs-Notification
4. Antrag ist nach 72h `expires_at` automatisch `status = 'expired'` und
   verschwindet aus „Meine Anfragen"

**Cancel-Flow:** Antragsteller sieht in StaffHome unter „Meine Anfragen"
einen `Abbrechen`-Button (PATCH `/api/shifts/swap` mit `action: cancel`).

#### D) Magic-Link testen

1. Email öffnen
2. "Annehmen"-Link klicken (ohne Login)
3. **Erwartung:** Bestätigungsseite mit "✅ Die Schichten wurden erfolgreich getauscht"
4. Prüfe in DB:
   ```sql
   SELECT * FROM shift_swaps ORDER BY created_at DESC LIMIT 5;
   SELECT * FROM shift_assignments WHERE shift_id IN (...);
   ```

---

### 5️⃣ Monitoring & Logs

**Nach Deploy prüfen:**

1. **Vercel Logs** → Functions → `/api/shifts/swap`
   - Achte auf Fehler bei Token-Generierung oder Supabase-Calls

2. **Supabase Logs** → Database → Recent Queries
   - Prüfe `finalize_swap()` Calls
   - Achte auf RLS-Errors

3. **PostHog** → Activity
   - Prüfe ob `swap_initiated`, `swap_accepted` Events ankommen

4. **Telegram Bot Info**:
   ```bash
   curl https://api.telegram.org/bot<TOKEN>/getUpdates
   ```

---

### 6️⃣ Rollout-Strategie

**Option A: Sofort für alle (empfohlen)**

- Migration läuft, neue Features sind backward-compatible
- Alte v1-Swap-Requests (ohne `kind`, `target_user_id`) bleiben im Manager-Approval-Flow
- Neue Requests nutzen Auto-Final-Flow

**Option B: Stufenweise**

1. Woche 1: Nur Owner/Manager testen
2. Woche 2: 2-3 Staff-Members als Beta
3. Woche 3: Alle Staff

---

## 🐛 Troubleshooting

### Problem: "Swap not found" beim Accept

**Ursache:** Token ungültig oder Swap bereits verarbeitet

**Lösung:**

```sql
SELECT id, status, accept_token_hash, expires_at
FROM shift_swaps
WHERE status = 'pending' AND expires_at > now();
```

Prüfe ob Token-Hash matcht (SHA-256 von Token).

---

### Problem: Telegram Inline-Buttons funktionieren nicht

**Ursache:** Webhook nicht auf `callback_query` registriert

**Lösung:**

```bash
# Webhook neu setzen mit allowed_updates
node scripts/setup-telegram-webhook.mjs
```

---

### Problem: Email wird nicht versendet

**Ursache:** DKIM/SPF nicht konfiguriert oder Resend-Key falsch

**Lösung:**

1. Prüfe Resend Dashboard → Logs
2. Verifiziere Domain in Resend
3. Füge DKIM/SPF/DMARC Records hinzu (siehe Resend Docs)

---

### Problem: finalize_swap() wirft Error

**Ursache:** Entweder `assignment_id` oder `target_assignment_id` existiert nicht

**Lösung:**

```sql
-- Debug
SELECT s.*, a.user_id, a.shift_id
FROM shift_swaps s
LEFT JOIN shift_assignments a ON s.assignment_id = a.id
WHERE s.id = '<SWAP_ID>';
```

Prüfe ob beide Assignments noch existieren.

---

## 📊 Success Metrics

Nach 1 Woche solltest du sehen:

- ✅ Mind. 3 erfolgreiche Swaps via Auto-Final
- ✅ 0 Manager-Interventionen bei Staff-to-Staff-Swaps
- ✅ Durchschnittliche Antwortzeit < 4h (statt vorher ~24h)
- ✅ Keine expired Swaps (72h-Fenster reicht aus)

**PostHog Query:**

```sql
SELECT
  toDate(timestamp) as day,
  count() as swap_count,
  countIf(properties.status = 'finalized') as finalized,
  countIf(properties.status = 'rejected') as rejected
FROM events
WHERE event = 'swap_result'
GROUP BY day
ORDER BY day DESC
LIMIT 7;
```

---

## 🚀 Nächste Iteration (Optional)

Wenn alles läuft, diese Features priorisieren:

1. **Open-Shift-Pool** — "Make available to anyone" (`shift_swap_kind`
   Enum-Vorbereitung steht, Surface fehlt)
2. **Auto-Reminder** — 24h vor Schicht via Telegram
3. **Compliance-Guards** — Max 40h/Woche Check vor Swap-Accept
4. **WeekGrid Inline-Edit-Drawer** — Zeit, Rolle, Notizen direkt im Grid
   editieren statt im ShiftEditor oben
5. **Audit-Log-Surface** — Anstelle der entfernten „Tauschanfragen"-Page
   eine read-only Übersicht aller `shift_swaps`-Einträge (auch
   abgelehnte / abgelaufene) als Manager-Tool

---

## 📞 Support

Bei Problemen:

1. Prüfe [Vercel Logs](https://vercel.com/dashboard)
2. Prüfe [Supabase Logs](https://supabase.com/dashboard)
3. Prüfe [ADR-007](docs/DECISIONS.md) für Kontext
4. Prüfe [Plan](c:\Users\skank\.cursor\plans\schichtplaner_v2_+_staff_dashboard_a7ac9e99.plan.md)
