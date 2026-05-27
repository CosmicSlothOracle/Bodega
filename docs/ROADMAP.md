# Bodega Bühlot · Roadmap

*Stand: Mai 2026 · Lebendige Übersicht aller Phasen mit Status und Aufwand.*

Phase A–D sind abgeschlossen. Die folgende Tabelle zeigt den aktuellen
Stand für die Cutover-Phasen E + F.

---

## Aktiv

| Phase | Modul | Aufwand | Status | Notiz |
|---|---|---|---|---|
| F1 | Reservierungs-Liste statt Tischplan + Telefonbuchung-Quick-Add | 0.5 T | Fertig | List-View ersetzt `TablePlan` (siehe ADR-004) |
| F2 | PostHog autocapture + Custom Events + Server-KPIs | 1 T | Fertig | KPI-Reader fällt graceful auf Mock zurück (ADR-005) |
| F6 | Smoke-Test-Script + `/api/test-mail` absichern | 0.5 T | Fertig | `npm run smoke -- <URL>` liefert Markdown-Report |
| F4 | Telegram-Bot Basis (sendMessage, Onboarding, RLS-Spalten) | 1 T | Fertig | siehe ADR-003 + GO_LIVE 6a |
| F3 | Schichtplanung (Migration `0003`, Admin/Staff-UI, Swap-Workflow) | 3 T | Fertig | Telegram-Trigger an Publish + Swap-Decision |
| E  | Domain-Cutover `bodega-buehlot.de` | 0.5 T | **Bereit** | Wartet auf DNS-Termin der alten IT |

---

## Geplant / zurückgestellt

| Phase | Modul | Aufwand | Status | Begründung |
|---|---|---|---|---|
| F5 | Telegram-OTP Step-up für sensible Routen | 0.5 T | Vorarbeit | Voraussetzung für Gehaltsabrechnungen (siehe ADR-008) |
| F5 | Gehaltsabrechnungen (Storage-Bucket, Upload, Compliance) | 2 T | Zurückgestellt | „Nice to have" – kein Cutover-Blocker |
| G1 | Sitzplan-UI als Drawer (auf Basis echter Tischplanung) | 1.5 T | Idee | nur sinnvoll wenn DISH-Daten doch sichtbar werden |
| G2 | DISH Partner-API Integration | ? | Idee | wenn DISH die API freigibt — nicht aktiv geplant |
| G3 | Heatmap-Inline-Embed + Funnel-Auswertung | 1 T | Geplant | nach 4 Wochen PostHog-Daten gezielt vertiefen |
| G4 | WhatsApp Business API (statt SMS für Gäste) | 5 T | Idee | erst bei deutlich höherem Reservierungsvolumen |

---

## Vor Cutover (vorausgesetzt fertig)

- [x] Supabase Migrationen 0001 + 0002 + 0004 + 0005 angewendet
- [x] Owner-Rolle eingetragen (`user_roles`)
- [x] Magic-Link-Login produktiv
- [x] Resend-API-Key gesetzt (`RESEND_FROM` zeigt aktuell auf `onboarding@resend.dev`)
- [ ] DKIM/SPF/DMARC für `bodega-buehlot.de` durch alte IT eingetragen
      → danach `RESEND_FROM` zurück auf `Bodega Bühlot <hola@bodega-buehlot.de>`
- [ ] PostHog Personal API Key gesetzt (Live-KPIs aktivieren)
- [ ] Telegram-Bot-Token (`TELEGRAM_BOT_TOKEN`) + `TELEGRAM_WEBHOOK_SECRET` gesetzt
- [ ] Smoke-Test gegen Vercel-Preview grün

---

## Nach Cutover (laufender Betrieb)

- [ ] Erstes echtes Schichtplan-Wochen-Setup mit Owner durchspielen
- [ ] 8–15 Mitarbeiter via Telegram-Onboarding-Link verknüpfen
- [ ] PostHog-Funnel `pageview /reservierung → dish_redirect` einrichten
      (Conversion-Rate ins Bloom-OS Dashboard übernehmen)
- [ ] Bloom-OS-Schulung (1 h) mit dem Owner
- [ ] Quartals-Review: F5 (Gehalt) und G-Phasen neu priorisieren
