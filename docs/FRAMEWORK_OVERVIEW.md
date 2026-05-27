# Bodega Bühlot · Web-Framework — Kurzübersicht

*Stand: Mai 2026 · Codename des Designsystems: „Bloom" · Öffentliche Marke bleibt Bodega Bühlot*

Diese Seite ist die Kurzfassung für Auftraggeberinnen, Personal und die
bisherige IT. Eine Seite Print, alles drin.

---

## 1. Was wird gebaut

Eine moderne, cineastische Restaurantseite plus ein internes
**„Bloom OS"-Dashboard** für die tägliche Hospitality-Arbeit.

- **Öffentliche Seite** (`/`, `/speisekarte`, `/events`, `/galerie`,
  `/ueber-uns`, `/reservierung`, `/to-go`, `/kontakt`, `/impressum`,
  `/datenschutz`)
- **Internes Dashboard** (`/dashboard/*`): Reservierungen, Gäste-CRM,
  **Schichten**, Events, Inhalte, Analytics, Benachrichtigungen, Einstellungen
- **Mitarbeiter-Workflows**:
  - eigene Schichten ansehen (Staff Home Dashboard)
  - **Tausch** (1:1) oder **Übernahme** (1-way) mit Grund anfragen
  - 1-Klick-Bestätigung via Telegram Inline-Button oder E-Mail Magic-Link
  - Telegram-Bot benachrichtigt automatisch über neue Schichten + Entscheidungen
  - Auto-Final: Swap wird sofort wirksam, keine Manager-Approval nötig
- **Login** über Magic-Link (kein Passwort), rollenbasiert
  (Owner / Manager / Staff / Marketing)

---

## 2. Tech-Stack auf einen Blick

| Schicht | Technologie | Warum |
|---|---|---|
| Frontend Framework | **Next.js 16** + React 19 | Server-Rendering, Bilder, SEO |
| Sprache | TypeScript | Typsicher, weniger Fehler |
| Styling | **Tailwind CSS v4** + Custom Bloom Tokens | Konsistentes Design, schnell |
| Animation | Framer Motion + Lenis (Smooth Scroll) | Cineastische Übergänge |
| Typografie | Cormorant Garamond + Inter (`next/font`) | Editorial, edel |
| Datenbank + Auth + Storage | **Supabase** (Postgres, EU-Region) | DSGVO, alles in einem |
| Reservierungen | **DISH Reservation** (bestehender Vertrag) | „Reserve with Google" inkl. |
| E-Mail | Resend | Event-Bestätigungen, Owner-Reports |
| SMS (optional) | Twilio | Event-Erinnerungen, No-Show-Prävention |
| Mitarbeiter-Messenger | **Telegram Bot API** | Schichten, Tauschanfragen — kostenlos, sofort einsatzbereit |
| Analytics | PostHog (cookielos, autocapture, EU-gehostet) | DSGVO-konform, kein Cookie-Banner |
| CMS (Phase 2) | Payload v3 | Hero, Speisekarte, Galerie pflegen |
| Hosting (Empfehlung) | Vercel · Frankfurt fra1 | Native Next.js, DSGVO, Auto-CDN |

---

## 3. Architektur kompakt

```
Gast ─▶ bodega-buehlot.de (Vercel · EU)
        │
        ├─ Öffentliche Seite (Bloom-Design)
        │
        ├─ /reservierung ─▶ Bloom-Vorfilter (Datum · Zeit · Personen)
        │                  └▶ reserve.dish.co/343512  ◀─ „Reserve with Google"
        │                     └▶ DISH Backoffice (vorhanden)
        │
        └─ /dashboard ─▶ Supabase (Postgres + Auth + Storage)
                       └▶ Resend / Twilio / Telegram (Mails · SMS · Mitarbeiter)
                       └▶ PostHog (cookielose Analytics, EU)
```

---

## 4. Reservierungen — wie es jetzt läuft

| Was | Wo |
|---|---|
| Online-Buchung durch Gäste | **DISH** (bestehende Lösung, unverändert) |
| „Reserve with Google" | **DISH** (bereits aktiv) |
| Telefonbuchung / Walk-in | **DISH-Backoffice** (Personal) |
| Bestätigungsmail an Gast | **DISH** sendet automatisch |
| Webseiten-Vorfilter (UX) | Bloom-Design führt zu DISH mit vor-ausgefüllten Werten |
| Internes Dashboard | Bloom OS zeigt DISH-Hinweis + Deeplink ins DISH-Backoffice |

**Wichtig:** Wir legen DISH **nicht** ab. Wir hängen einen schöneren Eingang
davor und lassen alles, was schon funktioniert, im DISH-System.

---

## 5. Was wir behalten · was neu ist

| Komponente | Status |
|---|---|
| Domain `bodega-buehlot.de` | **Bleibt** (DNS wird umgezogen) |
| Google Business Profile + 4,9★ Reviews | **Bleibt** (an Profil gebunden, nicht an Domain) |
| DISH Reservierungssystem | **Bleibt** (vertraglich) |
| Reserve with Google | **Bleibt** (über DISH) |
| Bisherige Webseite (Inhalt) | Wird durch neue ersetzt |
| Bisheriges Hosting / Webspace | Wird abgelöst (Vercel statt aktuell) |
| Cookie-Banner | **Entfällt** (cookielose Analytics) |
| Reservierungs-Widget der alten Seite | **Bleibt funktional** über neuen Bloom-Vorfilter |

---

## 6. Domain-Übergang (kritisch)

| Schritt | Verantwortlich |
|---|---|
| 1. DNS-Snapshot beim aktuellen Registrar (TTL auf 300 Sek senken, ~1 h vorher) | Alte IT |
| 2. `bodega-buehlot.de` als Custom Domain im neuen Host (Vercel) anlegen | Neue Entwicklung |
| 3. A-/CNAME-Records umbiegen | Alte IT (DNS-Inhaberin) |
| 4. SSL-Zertifikat (Let's Encrypt, automatisch) abwarten | Vercel |
| 5. Live-Smoke-Test (alle Seiten + Reservierung) | Beide |
| 6. Google Business Profile: Website-URL bestätigen (bleibt gleich) | Owner |
| 7. Altes Hosting nach 7 Tagen kündigen | Alte IT |

**Reviews / SEO bleiben unangetastet** — Google hängt sie ans Business
Profile, nicht an Domain oder Hosting.

---

## 7. Datenschutz & Datenhaltung (DSGVO)

| Datenart | Wo gespeichert | EU-Region |
|---|---|---|
| Reservierungs-Daten | DISH (bisheriger Anbieter) | Ja |
| Gäste-CRM, Events, Inhalte | Supabase (Frankfurt) | Ja |
| Bilder (Galerie, Hero) | Supabase Storage / Vercel CDN | Ja |
| Analytics | PostHog EU (`eu.i.posthog.com`) | Ja |

- **Keine Cookies** für Analytics (`persistence: "memory"`).
- **Magic-Link-Login**, keine Passwörter im System.
- **Row-Level-Security** in Supabase: jede Tabelle ist nach Rolle abgesichert.

---

## 8. Was die alte IT übernehmen muss

Sehr wenig — primär nur DNS und Übergabe der vorhandenen Konten/Rechte.

1. **DNS-Verwaltung** — Zugang zur Domain-Registrierung von
   `bodega-buehlot.de` (oder Kooperation für die A-/CNAME-Umstellung).
2. **DISH** — Bestätigung der Restaurant-ID (`343512`) und ggf. Zugang
   zum DISH-Backoffice für Owner.
3. **Google Business Profile** — Bestätigung, dass Website-URL
   `https://bodega-buehlot.de` eingetragen bleibt.
4. **E-Mail-Einrichtung** — DKIM/SPF-Records für `bodega-buehlot.de`,
   damit Resend versenden darf (`hola@bodega-buehlot.de`).
5. **Altes Hosting** — Kündigungstermin nach erfolgter Umstellung
   (frühestens 7 Tage Übergangs-Puffer).

---

## 9. Geschätzte laufende Kosten (monatlich, netto)

| Posten | Kosten |
|---|---|
| Vercel Pro (Hosting) | ~20 € |
| Supabase Pro (Datenbank + Auth + Storage) | ~25 € |
| Resend (E-Mails) | 0–20 € |
| PostHog Cloud | 0–20 € (Free Tier reicht klein, deckt Analytics komplett ab) |
| Twilio (optional, SMS) | nutzungsabhängig |
| DISH | **bereits bezahlt (unverändert)** |
| Domain | ~1 €/Monat (anteilig) |
| **Summe (typisch)** | **~60–80 € / Monat** |

Im Vergleich: Aleno als Reservierungs-Engine (ursprünglich geplant) hätte
zusätzliche **80–200 €/Monat** gekostet — durch DISH-Beibehaltung gespart.

---

## 10. Status & Nächste Schritte

| Phase | Status |
|---|---|
| Phase 0 — Foundations (Design-System, Layout) | Fertig |
| Phase 1 — Public Site (alle 10 Routen) | Fertig |
| Phase 2 — Reservierung (Bloom-Vorfilter → DISH) | Fertig |
| Phase 3 — Backend (Supabase Migrationen, Auth, Roles) | Fertig (DB live) |
| Phase 4 — Bloom OS Dashboard (8 Module) | Fertig |
| Phase 5 — Hardening (Lint, A11y, Performance) | Fertig |
| Phase B — Konten (Supabase, Resend, PostHog) | Fertig (Resend wartet auf DKIM) |
| Phase C — Live-Integrationen verdrahten | Fertig |
| Phase D — Vercel-Deployment + Preview | Fertig |
| Phase F1 — Reservierungs-Liste + Quick-Add | Fertig |
| Phase F2 — PostHog autocapture + KPI-API | Fertig |
| Phase F3 — Schichtplanung (Migration, UI, Tausch) | Fertig |
| Phase F4 — Telegram-Bot Basis | Fertig |
| Phase F6 — Smoke-Test + Härtung | Fertig |
| Phase E — Domain-Cutover bodega-buehlot.de | **Bereit, wartet auf DNS-Termin** |
| Phase F5 — Gehaltsabrechnungen | Zurückgestellt (nice to have) |

---

## 11. Wer macht was

| Rolle | Aufgabe |
|---|---|
| **Owner** (Leandra) | Inhalte freigeben (Texte, Fotos), Konten anlegen (Supabase, Resend, PostHog), Google Business Profile |
| **Entwicklung** | Code, Dashboard, Integration, Deployment, Übergabe-Doku |
| **Alte IT** | DNS-Übergabe, Mail-Records (DKIM/SPF), Konten-Übergabe |
| **DISH** | Bleibt Reservierungs-Engine — kein Wechsel, keine Migration |

---

*Dokumentiert in [`docs/DECISIONS.md`](./DECISIONS.md) (Architektur-Entscheidungen)
und [`docs/GO_LIVE.md`](./GO_LIVE.md) (Detail-Checkliste für den Cutover).*
