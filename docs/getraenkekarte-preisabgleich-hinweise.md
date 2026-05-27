# Preisabgleich: Getränkekarte (Arbeitskopie) ↔ `export.csv`

Die Datei [`src/content/getraenkekarte-arbeitskopie.txt`](../src/content/getraenkekarte-arbeitskopie.txt) ist die **inhaltliche Referenz**. Dieses Dokument fasst **Widersprüche**, **Lücken** und **Vorschläge** zur weiteren Preislogik zusammen.

---

## 1. Vollständigkeit der Preiszeilen

- Alle relevanten Kartenabschnitte enthalten **sichtbare €-Preise** (inkl. Caipirinha **8,50 €**, Rosé-Zeile Affentaler Monkey Mountain **6,90 €**).
- **Offene Punkte** (keine oder nur teilweise Abbildung im Export) siehe Kopf der Arbeitskopie und die Abschnitte unten.

---

## 2. Harte Widersprüche zur Kasse (`export.csv`)

| Thema | Auf der Karte | Im Export (SKU / Standardpreis) | Bewertung |
|-------|----------------|-----------------------------------|-----------|
| **Caipirinha** | 8,50 € | 203 · **0,00 €** | Kasse muss auf Zielpreis angehoben werden, sonst jedes Mal manuelle Korrektur. |
| **Sangria** | **0,3 l · 5,90 €** \| **0,5 l · 7,90 €** | 205 Sangria 0,2 l · **5,90 €**; 206 Sangria 0,5 l · **12,50 €** | Zwei Konflikte: (1) **Portionsgröße** 0,3 l existiert als SKU nicht — nur 0,2 l und 0,5 l. (2) **Großglas 7,90 €** vs **12,50 €** im System stark auseinander. Empfehlung: entweder Kartenpreise ins ERP übernehmen **oder** Karte an ERP anpassen und andere Portionsbezeichnung (z. B. Krügel/Glas). |
| **Affentaler Monkey Mountain (Weiß/Rosé)** | jeweils **6,90 €** / **6,90 €** | Kein gleichlautender Artikel — Zuordnung nur über Einzelweine (79, 100, 102 …) | Für einen „Marketing-Namen“ ohne SKU bleibt die Abrechnung unscharf; klären ob Festbutton oder Aufschlag auf Hauswein. |

---

## 3. Weitere Ungemeinheiten (ohne sofortigen Konflikt)

- **Spritz-Block** (Campari, Limoncello, Hugo, French Hugo, Bodega Spritz): Einheitliche **6,90 €** auf der Karte; im Export nur **Aperol Spritz (62)** und **Crodino (165)** klar getrennt — Rest über **Divers / Sonder** oder Rezepturbuttons abwickeln.
- **Bodega Fizz** · **8,50 €**: keine eigene CSV-Zeile — gleiches Problem wie bei Spritz.
- **Café Bombón** · **3,90 €**: keine dedizierte SKU in der aktuellen Exportliste.
- **Schweppes** zu **3,50 €**: Preis gesetzt, aber **keine Schweppes-Namen** im Export — SKU für alkoholfreie Mischgetränke klären.
- **Hoepfner Kräusen**: nur **0,5 l** ausgewiesen — konsistent mit Export **68** (nur 0,5 l mit Preis).

---

## 4. Vorschläge für klareres Pricing

1. **Sangria:** Entscheidung treffen: **A)** Karte an ERP (**12,50 €** für 0,5 l, **5,90 €** für 0,2 l) **oder** **B)** ERP an Karte (neue Artikel / geänderte Standardpreise, ggf. dritte Variante 0,3 l als SKU anlegen). Ohne das bleibt die Abrechnung der Gast-Karte nicht reproduzierbar.
2. **Caipirinha:** Standardpreis in Lightspeed auf **8,50 €** setzen (SKU 203).
3. **Einheitliche Spritz-Logik:** Entweder eine **Sammel-SKU „Spritz Signature“** mit 6,90 € oder **Sub-SKUs** für die beliebtesten drei Varianten — reduziert Nachlass bei der Bedienung.
4. **Monkey Mountain:** Umbenennung in der Kasse auf die tatsächlich ausschenkenden SKUs (z. B. Santa Cruz + Aufschlag) oder **ein** Festpreis-Artikel „Affentaler MM Glas“ mit Warengruppe Wein.
5. **Ramirez / Vivino:** Namen und Beschreibungen in der Arbeitskopie sind mit **Ramirez de la Piscina** abgestimmt — CSV nutzt weiterhin Kurz **„Ramirez weiß/rosé“** (SKU 235/237); für Gäste kann die Karte den ausführlichen Namen führen, die Kasse die Kurzbezeichnung.

---

## 5. Weinbeschreibungen (Quelle)

- **Ramirez de la Piscina Blanco:** Trauben und englische Originalnotiz aus [Vivino](https://www.vivino.com/de/w/5049612) übernommen und für die Karte auf Deutsch verdichtet.
- **Ramirez de la Piscina Rosado:** Rebsorten und Profil nach Herstellerangaben / typischem Rioja-Roséprofil ergänzt (nicht dieselbe Vivino-URL wie beim Weißwein).

---

*Stand: Abgleich nach Festlegung „Arbeitskopie = Quelle der Wahrheit“ für Gasttext und Zielpreise.*
