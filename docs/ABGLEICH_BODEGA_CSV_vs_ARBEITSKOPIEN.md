# Abgleich: `Bodega.csv` (Lightspeed Bildschirmzuordnung) ↔ Arbeitskopien Speise- & Getränkekarte

**Erzeugt für:** Datei `c:\Users\skank\Downloads\Bodega.csv` (nur Spalten **SKU** und **Bildschirm**).

**Referenz „Preis & Artikelname“:** [`export.csv`](../export.csv) — gleicher Betrieb; dort sind **Standardpreis** und **Name** pro SKU gepflegt. Die Arbeitskopien enthalten **Kommapreise** (z. B. `6,90 €`); im CSV stehen Dezimalpunkte (`6.9`).

**Textuelle Referenz der Karten:**

- [`src/content/speisekarte-arbeitskopie.txt`](../src/content/speisekarte-arbeitskopie.txt)
- [`src/content/getraenkekarte-arbeitskopie.txt`](../src/content/getraenkekarte-arbeitskopie.txt)

---

## 1. Was `Bodega.csv` leistet — und was nicht

| Aspekt | `Bodega.csv` | `export.csv` |
|--------|----------------|--------------|
| SKU | Ja | Ja |
| Zuordnung zu Kassen-/Tablet-**Bildschirm** | Ja (vereinfachte Namen: „Tapas Frias“, „Wein##Rotwein“, …) | Detaillierter Menüpfad (`Bodega Bühlot/…`) |
| Artikelbezeichnung | **Nein** | Ja (`Name`) |
| Standardpreis | **Nein** | Ja (`Standardpreis`) |

**Folge:** „Abweichung Preise“ ist immer **export.csv ↔ Arbeitskopie**, nicht `Bodega.csv` direkt. `Bodega.csv` wird hier für **Vollständigkeit der SKU auf den Bildschirmen** und für **Screen-Logik** ausgewertet.

---

## 2. SKU-Inventar: Was liegt auf welchem Bildschirm (`Bodega.csv`)

Die Datei gruppiert **172 SKU-Zeilen** (ohne Kopfzeile) auf u. a. folgende Bildschirme:

| Bildschirm (`Bodega.csv`) | Inhalt (Auszug SKUs) |
|---------------------------|----------------------|
| Süsse Nachspeisen | I1, I2, I3, 45, 189 |
| Tapas Frias | I7, I8, I6, I11, 199, I10, I9, I13, 194, I4, I5, 184, 185, I12 |
| Tapas Calientes | I30, I24, I33, I18, I26, I32, I27, I29, I28, I21, I22, I23, 188, I16, I15, I19, I31, I34, I25, 192, 197, I17, 187, I20, 193 |
| Ensaladas | I35, I36, I37 |
| AFG | 179, 48, 116, 47, 46, 117, 119–124, 210, 221, 178, 176–177, 118, 225–233 |
| Heißgetränke | 166–170, 173–174, 172, 175 (**ohne** SKU `171` — existiert im Export nicht) |
| Sekt | 135, 212, 61, 62, 136, 133, 138, 63, 64 |
| Wein##Rotwein | 113, 105, 107, 95, 183, 223 |
| Wein##Weißein | 79, 81, 83, 191, 100, 220, 234, 235 |
| Wein##Rosewein | 102, 209, 236–239 |
| Wein##Flaschen | 207, 97, 85, 88–94, 222, 224 |
| Bier | 139, 66, 140, 67, 211, 213, 68, 142, 216, 214–215, 69, 219, 217–218, 143, 72, 144, 240–241 |
| Longdrinks&Cocktails | 160–163, 165, 203–206 |
| Schnaps | 146–159, 201–202 |
| Notizen | 200, FT1, 44 |

**Hinweis Bildschirmnamen:** `Wein##Rotwein` ist die Unterteilung in Lightspeed (nicht identisch mit Abschnittstiteln der gedruckten Karte).

---

## 3. Vollständigkeit: SKU im Export vs. SKU in `Bodega.csv`

### 3.1 Artikel-SKUs aus `export.csv`, die **nicht** in `Bodega.csv` vorkommen

Im Export sind zusätzliche **System-/Funktionszeilen** vorhanden, die **keinen** eigenen Platz auf den Gast-Bildschirmen haben:

| SKU | Name (`export.csv`) | Typische Rolle |
|-----|---------------------|----------------|
| OI1 | Divers | Shared |
| FT2 | Text Konto | Shared |
| MSG0 | Schneller | Shared |
| MSG1 | Warten | Shared |
| MSG2 | VIP Gast | Shared |

**Alle übrigen verkaufsrelevanten LOCAL-Artikel aus dem vorliegenden `export.csv`-Auszug** sind in `Bodega.csv` auf einem Bildschirm abgebildet — damit ist die **POS-Oberfläche** für den täglichen Verkauf gegenüber dem Export-Stamm **vollständig abgedeckt**, abgesehen von den genannten Shared-Einträgen.

### 3.2 Umgekehrt

Jede SKU in `Bodega.csv` hat eine Entsprechung in `export.csv` (gleicher Datenstand). Es gibt **keine „Phantom-SKUs“** nur in `Bodega.csv`.

---

## 4. Speisekarte ↔ SKU (`export.csv`) ↔ Preise

Die gedruckte/Redaktions-Speisekarte listet **weniger Positionen** als die Kasse: mehrere CSV-Artikel sind **Zusatzangebote** oder **Operatives**.

### 4.1 Jede Positionszeile der Arbeitskopie — zugehörige SKU, Bildschirm (`Bodega.csv`), Preisabgleich

Preise: **Arbeitskopie (AK)** vs **export / Kasse (EXP)**.

| AK Position | SKU | Bildschirm `Bodega.csv` | AK € | EXP € | Abweichung |
|-------------|-----|-------------------------|------|-------|------------|
| Pan con Alioli | I4 | Tapas Frias | 4,50 | 4,5 | Keine |
| Pan con Tomate | I5 | Tapas Frias | 5,50 | 5,5 | Keine |
| Almendras Fritas | I6 | Tapas Frias | 5,50 | 5,5 | Name EXP: „Mandeln“ |
| Aceitunas Aliñadas | I7 | Tapas Frias | **4,50** | **3,9** | **−0,60 €** (Name EXP: „Oliven“) |
| Alcachofas | I8 | Tapas Frias | 6,50 | 6,5 | Name EXP: „Artischocken“ |
| Jamón Serrano | I9 | Tapas Frias | 7,90 | 7,9 | Keine |
| Jamón Ibérico Bellota | I10 | Tapas Frias | 8,90 | 8,9 | Schreibweise Iberico |
| Chorizo Ibérico Bellota | I11 | Tapas Frias | 8,90 | 8,9 | Dito |
| Queso Manchego | I12 | Tapas Frias | 7,50 | 7,5 | Keine |
| OLMEDA Tres Leches Semicurado | I13 | Tapas Frias | 6,90 | 6,9 | Name EXP: „3 Käse“ |
| Patatas Bravas | I15 | Tapas Calientes | 7,90 | 7,9 | Name EXP: „Bravas“ |
| Papas Arrugadas | I16 | Tapas Calientes | 6,90 | 6,9 | Name EXP: „Papas“ |
| Tortilla | I17 | Tapas Calientes | 6,50 | 6,5 | Keine |
| Champiñones al Ajillo | I18 | Tapas Calientes | 6,90 | 6,9 | Name EXP: „Champiñones“ |
| Pimientos de Padrón | I19 | Tapas Calientes | 5,90 | 5,9 | Name EXP: „Pimientos“ |
| Verduras Mediterráneas | I20 | Tapas Calientes | 6,90 | 6,9 | Name EXP: „Gemüse“ |
| Dátiles | I21 | Tapas Calientes | 5,90 | 5,9 | Keine |
| Gambas al Ajillo | I23 | Tapas Calientes | 7,90 | 7,9 | Keine |
| Gambas en Nido de Patata | I22 | Tapas Calientes | **7,90** | **8,9** | **+1,00 €** in Kasse |
| Boquerones Fritos | I24 | Tapas Calientes | 7,90 | 7,9 | Keine |
| Rabas de Calamar | I25 | Tapas Calientes | 7,90 | 7,9 | Name EXP: „Rabas“ |
| Chipirones | I26 | Tapas Calientes | 7,90 | 7,9 | Keine |
| Croquetas de Espinaca | I27 | Tapas Calientes | 6,50 | 6,5 | Name EXP: „K.-Spinat“ |
| Croquetas de Pollo | I28 | Tapas Calientes | 6,50 | 6,5 | Name EXP: „K.- Pollo“ |
| Croquetas de Sobrasada | I29 | Tapas Calientes | 6,50 | 6,5 | Name EXP: „K.-Sobresada“ (Schreibweise) |
| Albóndigas | I30 | Tapas Calientes | 7,50 | 7,5 | Keine |
| Pinchos Morunos de Pollo | I31 | Tapas Calientes | 7,50 | 7,5 | Name EXP: „Pinchos“ |
| Chorizo al Jerez | I32 | Tapas Calientes | 7,90 | 7,9 | Keine |
| Carne en Salsa | I33 | Tapas Calientes | 7,90 | 7,9 | Name EXP: „Carne“ |
| Queso de Cabra con Miel | I34 | Tapas Calientes | 7,90 | 7,9 | Name EXP: „Ziegenkäse-Honig“ |
| Ensalada de Acompañamiento | I35 | Ensaladas | 7,50 | 7,5 | Name EXP: „Salat klein“ |
| Ensalada Ibérico | I36 | Ensaladas | **16,50** | **16,9** | **+0,40 €** Kasse |
| Ensalada La Gomera | I37 | Ensaladas | 15,90 | 15,9 | Keine |
| Plato Ibérico | 184 | Tapas Frias | 15,90 | 15,9 | Keine |
| Plato de Queso | 185 | Tapas Frias | 15,90 | 15,9 | Name EXP: „Plato Queso“ |
| Crema Catalana | I1 | Süsse Nachspeisen | **6,50** | **6,5** | Gleicher EXP-Preis wie „Crema“ |
| Tarta Santiago | I2 | Süsse Nachspeisen | **6,90** | **6,5** | **−0,40 €** auf Kasse vs AK |
| Tarta Santiago con Helado | I3 | Süsse Nachspeisen | 7,90 | 7,9 | Keine |
| Schokotörtchen | 189 | Süsse Nachspeisen | 7,90 | 7,9 | Name EXP: „Schokotarte“ |

### 4.2 Nur Kasse / `Bodega.csv`, **nicht** auf der Text-Speisekarte

| SKU | Bildschirm | Name (`export.csv`) | Standardpreis |
|-----|------------|---------------------|---------------|
| 45 | Süsse Nachspeisen | Churros | 5,9 |
| 199 | Tapas Frias | Gaspacio | 5,9 |
| 194 | Tapas Frias | Pan Solo | 1,5 |
| 187 | Tapas Calientes | Trüffelkroketten. | 5,9 |
| 188 | Tapas Calientes | Gutschein | — |
| 192 | Tapas Calientes | Tapas Divers | — |
| 193 | Tapas Calientes | extra Soße | 1,5 |
| 197 | Tapas Calientes | Tapas der Woche | 5,9 |

### 4.3 Auf der Speisekarte (AK), aber **ohne** eigene SKU für „Café Bombón“

**Café Bombón** steht in der **Getränkekarte** (`getraenkekarte-arbeitskopie.txt`), nicht in der Speise-Arbeitskopie — für Hot Drinks siehe Abschnitt 5.2.

---

## 5. Getränkekarte ↔ SKU ↔ Preise

### 5.1 Hochprozentiges — alle auf Bildschirm „Schnaps“ (`Bodega.csv`)

| AK / Karte | SKU | EXP-Preis € | AK € | Abweichung |
|------------|-----|-------------|------|------------|
| Brandy Cardenal Mendoza 2 cl · 5,00 | 146 | 5,0 | 5,00 | Keine |
| Absolut Vodka | 149 | 3,5 | 3,50 | Keine |
| Gordons Dry Gin | 150 „Gin 2cl“ | 3,5 | 3,50 | Name |
| Ramazotti **4 cl** | 151 „Ramazotti **2cl**“ | 4,5 | 4,50 | **Portion:** AK 4 cl / EXP 2 cl |
| Túnel Hierbas dulces | 152 | 3,0 | 3,00 | Keine |
| Túnel Hierbas secas | 153 | **3,0** | **3,30** | **+0,30 €** auf Karte |
| Havana Club Añejo 3 | 155 | 3,5 | 3,50 | Keine |
| Licor 43 | 157 | 3,5 | 3,50 | Keine |
| Sandemann Sherry | 158 | 3,5 | 3,50 | Keine |

**Nur Kasse (auf Schnaps-Bildschirm), nicht auf AK-Getränkekarte:** 147 Carlos Primero, 148 Veterano Osborne, 154 Ron Miel, 156 Havana Especial, 159 Hausbrand, 202 Orujo, 201 Grey Goose.

### 5.2 Longdrinks, Aperitif, warme Getränke

**Longdrinks&Cocktails** (`Bodega.csv`): 160–163, 165, 203–206.

| Thema | AK | EXP | Abweichung |
|-------|-----|-----|------------|
| Cuba libre 0,2 l | 8,00 | 160 · **8,5** | +0,50 € Kasse |
| Gin Tonic | 8,00 | 161 · **8,5** | +0,50 € |
| Campari Orange | 7,50 | 162 · **8,0** | +0,50 € |
| Crodino Orange 0,25 l · 6,50 | 165 · 6,5 | OK | EXP ohne „Orange“ im Namen |
| **Bodega Fizz** | 8,00 | — | **Keine SKU** |
| Caipirinha · 8,00 | 203 · **0,0** | **Preis 0 in Kasse** |
| Campari / Limoncello / Hugo / French Hugo / Bodega Spritz | 6,90 | — | **Keine eigenen SKUs** in Export (nur Aperol 62 unter Sekt-Bildschirm) |
| Café Bombón · 3,80 | — | **Keine SKU** im Export |

Warmgetränke (`Bodega.csv` **Heißgetränke**): 166–175 ohne Lücke für 171 — stimmt mit Export überein (kein Café-Bombón-Artikel).

### 5.3 AFG / Mineral / Soft / Limo

Die AK bündelt Teinacher und Genuss-Limonade; `Bodega.csv` **AFG** listet **Einzel-SKUs** (Classic/Medium/Naturell je Größe, Cola/Fanta einzeln, Limo Mango/Orange/Johannisbeere, Jo-/O-/A-/Ra-Schorle, Paulaner Spezi/Cola, …).

**Preisliche Konflikte** (wie im Export): Cola/Fanta **0,2 l** AK **3,20 €** vs EXP **3,50 €** (119, 123); Weinschorle generisch AK **4,00 €** vs mehrere EXP-Varianten 4,0–4,5 €.

**Nicht als eigene SKU:** Schweppes Tonic/Ginger/Bitter; „Hausgemachte Holunder-/Ingwerlimo“; gebündelte „Paulaner Limo“ — stattdessen u. a. **221 Paulaner Cola**, **176–178 Limo**-Varianten.

### 5.4 Sekt / Mischgetränke (`Bodega.csv` **Sekt**)

| AK | SKU | EXP € | AK € | Abweichung |
|----|-----|-------|------|------------|
| Sommer-Schorle | 61 | 6,9 | 6,90 | Keine |
| Tinto 0,25 l | 135 | **6,9** | **6,20** | **+0,70 €** Kasse |
| Tinto 0,5 l | 212 | 8,0 | 8,00 | Keine |
| Weinschorle 0,2 | — | 63/88/138 je Variante | 4,00 | siehe Varianten |
| Cava 0,1 | 64 „Cava“ | **6,9** | **6,00** | **+0,90 €** Kasse |
| Affentaler Riesling Sekt 0,1 | — | — | 6,50 | **Keine SKU** |

### 5.5 Bier (`Bodega.csv` **Bier**)

Standard-Pils/Hefe/Kräusen/Chiemseer/San Miguel etc. stimmen mit AK überein (siehe vorherige Abgleichslogik); zusätzlich auf dem Bildschirm: Radler- und Cola-Varianten (**211–219**), nicht alle auf der Textkarte als Einzelzeilen.

### 5.6 Wein — Weiß / Rosé / Rot / Flaschen

Die **Wein-Bildschirme** in `Bodega.csv` (`Wein##Weißein`, `##Rosewein`, `##Rotwein`, `##Flaschen`) decken die Export-SKUs ab; die **Preise** weichen häufig von der AK ab (Beispiele):

- Santa Cruz weiß 0,2: AK **5,50 €**, EXP **79 · 6,9 €**
- Monkey Mountain (Affentaler): **keine** SKU unter diesem Namen — stattdessen **100 Rivaner**, **191 Lugana**, **234/235 Ramirez**, …
- Ramirez weiß 0,2: AK **6,00 €**, EXP **235 · 7,9 €**
- Palacio/Nivarius 0,75: AK **28,00 €**, EXP **85 · 30,0 €**
- LEZA GARCIA / Leza Garcia 0,75: AK **28,00 €**, EXP **88 · 30,0 €**
- Flaschen-Rotweine / Ribera / Pago / Morca: durchgängig **höhere** EXP-Preise als AK (gleiches Muster wie in [`ABGLEICH_LIGHTSPEED_EXPORT_vs_ARBEITSKOPIEN.md`](./ABGLEICH_LIGHTSPEED_EXPORT_vs_ARBEITSKOPIEN.md))

**Zusätzlich in Kasse, nicht auf AK:** u. a. **81 Ostatu weiß 0,2**, **83 Pandora**, **95 Spätburgunder 0,2**, **183 Rotwein 0,1**, **209 Roséwein 0,1**, **222 Santa Cruz Rose Flasche**, **224 Hacienda Flasche**, **207 Lugana 0,75**, …

---

## 6. Kurzfassung

| Frage | Antwort |
|-------|---------|
| Sind **alle** Kassen-Artikel (`export.csv`) auf **`Bodega.csv`**-Bildschirmen? | Ja, bis auf Shared/System (**OI1, FT2, MSG0–MSG2**). |
| Sind **alle** Speisen der AK als SKU abbildbar? | Ja; plus zusätzliche Speisen-SKUs nur Kasse. |
| Sind **alle** Getränke der AK als SKU abbildbar? | **Nein:** u. a. Bodega Fizz, mehrere Spritz, Affentaler Riesling Sekt, Café Bombón, Schweppes, Hauslimos fehlen oder sind zerlegt/anders benannt. |
| **Preise** Kasse vs AK | Zahlreiche Abweichungen — besonders **Weine**, **Longdrinks**, **Oliven**, **Gambas Kartoffelmantel**, **Ensalada Ibérico**, **Tarta Santiago**, **Tinto/Cava**; Detail siehe Tabellen oben und [`ABGLEICH_LIGHTSPEED_EXPORT_vs_ARBEITSKOPIEN.md`](./ABGLEICH_LIGHTSPEED_EXPORT_vs_ARBEITSKOPIEN.md). |

---

## 7. Nächster Schritt (noch nicht ausgeführt)

Einheitliche **Referenz** festlegen (AK oder Lightspeed), dann **Preise/Namen** in Export, **Bodega.csv**-Screens und **Web/Print** (`menu.ts` / `drinks.ts`) zusammenführen.

---

*Keine Stammdaten wurden geändert — nur Auswertung.*
