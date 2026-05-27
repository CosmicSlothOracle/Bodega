# 1blu → Vercel Cutover: Fertige Anleitung

> **Domain:** `bodega-buehlot.de` · **Konto:** 2741804 (Bodega Bühlot)
> **Nameserver:** 1blu (`ns01.1blu.de` / `ns02.1blu.de`) — DNS wird direkt bei 1blu verwaltet.
>
> **Regel:** Website → Vercel. E-Mail bleibt bei 1blu. Mail-Records werden nicht angefasst.

---

## Aktueller DNS-Stand (12.05.2026)

| Host | Typ | Ziel | Aktion |
|------|-----|------|--------|
| `@` | A | `178.254.10.141` | **ÄNDERN** → `76.76.21.21` |
| `www` | A | `178.254.10.141` | **LÖSCHEN**, neuen CNAME anlegen |
| `mail` | A | `178.254.4.101` | NICHT ANFASSEN |
| `@` | MX | `mail.bodega-buehlot.de` | NICHT ANFASSEN |
| `@` | TXT | `v=spf1 mx include:_spf.1blu.de ~all` | **ERWEITERN** (siehe unten) |
| `blu2553516._domainkey` | TXT | DKIM-Schlüssel (RSA) | NICHT ANFASSEN |

### Aktive E-Mail-Postfächer (bleiben bei 1blu)

| Postfach | Adressen |
|----------|----------|
| kathrin | `hola@bodega-buehlot.de`, `mail@bodega-buehlot.de`, … |
| leandra | `reservierung@bodega-buehlot.de`, … |

---

## Phase 1 — Vorbereitung (kann sofort gemacht werden)

### 1.1 Resend: Domain verifizieren

- [ ] Resend Dashboard → Domains → `bodega-buehlot.de` hinzufügen
- [ ] Resend zeigt dir DNS-Einträge. Diese bei 1blu **hinzufügen** (nicht ersetzen):
  - **CNAME** `resend._domainkey.bodega-buehlot.de` → (Wert von Resend)
  - **TXT** `_dmarc.bodega-buehlot.de` → (Wert von Resend)
- [ ] **SPF erweitern** — den bestehenden `@` TXT-Record ändern von:
  ```
  v=spf1 mx include:_spf.1blu.de ~all
  ```
  auf:
  ```
  v=spf1 mx include:_spf.1blu.de include:amazonses.com ~all
  ```
  (Nur `include:amazonses.com` vor `~all` einfügen. Keinen zweiten TXT-SPF anlegen!)
- [ ] In Resend: "Verify" klicken — dauert 5–30 Min.

### 1.2 Vercel: Domain vorbereiten

- [ ] Vercel Dashboard → Projekt → Settings → Domains
- [ ] `bodega-buehlot.de` hinzufügen (Apex)
- [ ] `www.bodega-buehlot.de` hinzufügen
- [ ] Vercel zeigt Warnungen (DNS zeigt noch woanders hin) — das ist OK, wird am Cutover-Tag behoben

### 1.3 Supabase: SMTP + URLs

- [ ] Supabase → Project Settings → Authentication → SMTP Settings
- [ ] Custom SMTP aktivieren:
  - Host: `smtp.resend.com`
  - Port: `465`
  - User: `resend`
  - Password: Resend API Key
- [ ] Authentication → URL Configuration:
  - Site URL: `https://bodega-buehlot.de`
  - Redirect URLs: `https://bodega-buehlot.de/auth/callback`
- [ ] Vercel Env Var `RESEND_FROM` ändern auf: `Bodega Bühlot <hola@bodega-buehlot.de>`

---

## Phase 2 — Cutover-Tag (< 15 Minuten)

> Bester Zeitpunkt: Montag Mittag (kein Service).

### T-60 Min: TTL senken

Im 1blu DNS-Panel:
- `@` A-Record → TTL auf **300** ändern
- `www` A-Record → TTL auf **300** ändern
- 1 Stunde warten

### T-0: DNS umschalten

Im 1blu DNS-Panel **genau diese 2 Änderungen**:

| # | Was tun | Host | Typ | Neuer Wert | TTL |
|---|---------|------|-----|------------|-----|
| 1 | **Ändern** | `@` | A | `76.76.21.21` | 300 |
| 2 | `www` A-Record **löschen**, dann **neuen Eintrag**: | `www` | CNAME | `cname.vercel-dns.com` | 300 |

**Alles andere bleibt wie es ist** (`mail` A, MX, TXT-Records).

### T+5 Min: SSL abwarten

Vercel stellt automatisch ein Let's-Encrypt-Zertifikat aus (30 Sek. – 5 Min.).
Vercel Dashboard → Domains → grünes Häkchen abwarten.

### T+10 Min: Prüfen

- [ ] `https://bodega-buehlot.de` → neue Seite lädt
- [ ] `https://www.bodega-buehlot.de` → leitet auf Apex um
- [ ] Login → Magic-Link anfordern → E-Mail kommt an
- [ ] Dashboard erreichbar
- [ ] `/reservierung` → DISH-Widget erscheint
- [ ] Test-Mail an `hola@bodega-buehlot.de` senden → kommt bei Kathrin an (1blu-Mail funktioniert noch)

### T+15 Min: Telegram-Webhook

```bash
curl -F "url=https://bodega-buehlot.de/api/telegram/webhook" \
     -F "secret_token=DEIN_TELEGRAM_WEBHOOK_SECRET" \
     https://api.telegram.org/botDEIN_TELEGRAM_BOT_TOKEN/setWebhook
```

---

## Nach dem Cutover

- [ ] 7 Tage beobachten (Mail, Website, Magic-Links)
- [ ] Dann erst: 1blu-**Webhosting** kündigen (nur das Hosting, NICHT die Domain und NICHT die E-Mail!)
- [ ] Domain + E-Mail-Paket bei 1blu weiterlaufen lassen

---

## Risiken und Fallback

| Risiko | Fallback |
|--------|---------|
| DNS propagiert langsam (> 1h) | Warten, nichts tun — TTL war 300 |
| Vercel SSL schlägt fehl | Vercel Panel → Domain → "Refresh" |
| Magic-Link kommt nicht an | Supabase Custom SMTP prüfen (Phase 1.3) |
| 1blu-Mail geht nicht mehr | Kann nicht passieren — `mail` A, MX, SPF, DKIM bleiben unangetastet |
| Rollback nötig | `@` A zurück auf `178.254.10.141`, `www` CNAME löschen → A `178.254.10.141` |

---

*Aktualisiert: 2026-05-12 · Basierend auf tatsächlichem DNS-Export und E-Mail-Status*
*Referenz: docs/GO_LIVE.md §6b Domain Cutover*
