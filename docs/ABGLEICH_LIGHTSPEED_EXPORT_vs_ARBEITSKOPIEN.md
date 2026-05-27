# Abgleich: Lightspeed `export.csv` ↔ Arbeitskopien Speise- & Getränkekarte

**Stand der Auswertung:** Auszug aus Lightspeed (SKU; Name; Standardpreis u. a.).  
**Referenzdateien:**

- [`export.csv`](../export.csv) — Artikelstamm / Kassenlogik  
- [`src/content/speisekarte-arbeitskopie.txt`](../src/content/speisekarte-arbeitskopie.txt) — Zieltext Speisen  
- [`src/content/getraenkekarte-arbeitskopie.txt`](../src/content/getraenkekarte-arbeitskopie.txt) — Zieltext Getränke  

**Hinweis:** Preise in der CSV nutzen Punkt als Dezimaltrenner (`6.9` = 6,90 €). Die Arbeitskopien nutzen Komma (`6,90 €`). Im Dokument sind **numerische Abweichungen** immer als €-Betrag gemeint.

---

## 1. Methodik

- Verglichen wurden **inhaltlich zusammengehörige Positionen** (nicht zwingend identische Schreibweise).  
- **„Nur in CSV“** = Artikel mit Preis bzw. verkaufsrelevante Zeilen, die **nicht** als eigene Speisen-/Getränkeposition in den Arbeitskopien vorkommen (oder nur unter anderem Konzept).  
- **„Nur in Arbeitskopie“** = Positionen der Karte, für die **kein** eindeutiges Pendant in der CSV gefunden wurde.  
- **Technische / operative CSV-Zeilen** (ohne Speisen-/Getränkekartenbezug oder Preis 0): z. B. Notizen, „Divers“, „VIP“, Textfelder — gesondert aufgeführt, nicht als „fehlende Speise“ gewertet.

---

## 2. Speisekarte (`speisekarte-arbeitskopie.txt`) ↔ `export.csv`

### 2.1 Positionsweiser Abgleich (inhaltliche Zuordnung)

| Arbeitskopie (Name · Preis) | CSV (SKU · Name · Standardpreis) | Abweichung |
|-----------------------------|-----------------------------------|------------|
| Pan con Alioli · 4,50 € | I4 · Pan con Alioli · 4,5 | Keine (Name/Preis passend). |
| Pan con Tomate · 5,50 € | I5 · Pan con Tomate · 5,5 | Keine. |
| Almendras Fritas · 5,50 € | I6 · **Mandeln** · 5,5 | **Name:** Karte ausführlich, Kasse verkürzt („Mandeln“). Preis gleich. |
| Aceitunas Aliñadas · 4,50 € | I7 · **Oliven** · **3,9** | **Name** verkürzt; **Preis:** Karte 4,50 € vs Kasse **3,90 €** (−0,60 €). |
| Alcachofas · 6,50 € | I8 · Artischocken · 6,5 | Name verkürzt; Preis gleich. |
| Jamón Serrano · 7,90 € | I9 · Jamón Serrano · 7,9 | Keine. |
| Jamón Ibérico Bellota · 8,90 € | I10 · Jamón **Iberico** Bellota · 8,9 | **Schreibweise:** Ibérico (Karte) vs Iberico (CSV). Preis gleich. |
| Chorizo Ibérico Bellota · 8,90 € | I11 · Chorizo Iberico Bellota · 8,9 | Dito Akzent. Preis gleich. |
| Queso Manchego · 7,50 € | I12 · Queso Manchego · 7,5 | Keine. |
| OLMEDA Tres Leches Semicurado · 6,90 € | I13 · **3 Käse** · 6,9 | **Name:** völlig unterschiedlich (Hersteller/Produktname auf Karte vs generischer Button in CSV). Preis gleich. |
| Patatas Bravas · 7,90 € | I15 · Bravas · 7,9 | Name verkürzt; Preis gleich. |
| Papas Arrugadas · 6,90 € | I16 · **Papas** · 6,9 | Name verkürzt; Preis gleich. |
| Tortilla · 6,50 € | I17 · Tortilla · 6,5 | Keine. |
| Champiñones al Ajillo · 6,90 € | I18 · Champiñones · 6,9 | „al Ajillo“ fehlt in CSV; Preis gleich. |
| Pimientos de Padrón · 5,90 € | I19 · Pimientos · 5,9 | „de Padrón“ fehlt in CSV; Preis gleich. |
| Verduras Mediterráneas · 6,90 € | I20 · **Gemüse** · 6,9 | Name stark verkürzt; Preis gleich. |
| Dátiles · 5,90 € | I21 · Dátiles · 5,9 | Keine. |
| Gambas al Ajillo · 7,90 € | I23 · Gambas al ajillo · 7,9 | Groß-/Kleinschreibung; Preis gleich. |
| Gambas en Nido de Patata · 7,90 € | I22 · **Gambas Kartoffelmantel** · **8,9** | **Name** abweichend; **Preis:** Karte **7,90 €** vs Kasse **8,90 €** (+1,00 €). |
| Boquerones Fritos · 7,90 € | I24 · Boquerones fritos · 7,9 | Keine wesentliche Abweichung. |
| Rabas de Calamar · 7,90 € | I25 · **Rabas** · 7,9 | Name verkürzt; Preis gleich. |
| Chipirones · 7,90 € | I26 · Chipirones · 7,9 | Keine. |
| Croquetas de Espinaca · 6,50 € | I27 · **K.-Spinat** · 6,5 | Name stark verkürzt; Preis gleich. |
| Croquetas de Pollo · 6,50 € | I28 · **K.- Pollo** · 6,5 | Dito; Preis gleich. |
| Croquetas de Sobrasada · 6,50 € | I29 · **K.-Sobresada** · 6,5 | **Tippfehler in CSV:** Sobresada vs **Sobrasada**; Preis gleich. |
| Albóndigas · 7,50 € | I30 · Albóndigas · 7,5 | Keine. |
| Pinchos Morunos de Pollo · 7,50 € | I31 · **Pinchos** · 7,5 | Name stark verkürzt; Preis gleich. |
| Chorizo al Jerez · 7,90 € | I32 · Chorizo al Jerez · 7,9 | Keine. |
| Carne en Salsa · 7,90 € | I33 · **Carne** · 7,9 | Name verkürzt; Preis gleich. |
| Queso de Cabra con Miel · 7,90 € | I34 · **Ziegenkäse-Honig** · 7,9 | Name deutsch/kurz vs spanisch auf Karte; Preis gleich. |
| Ensalada de Acompañamiento · 7,50 € | I35 · **Salat klein** · 7,5 | Name unterschiedlich; Preis gleich. |
| Ensalada Ibérico · 16,50 € | I36 · Salat Ibérico · **16,9** | **Preis:** Karte **16,50 €** vs Kasse **16,90 €** (+0,40 €). |
| Ensalada La Gomera · 15,90 € | I37 · Ensalada La Gomera · 15,9 | Keine. |
| Plato Ibérico · 15,90 € | I184 · Plato Iberico · 15,9 | Akzent „Ibérico“; Preis gleich. |
| Plato de Queso · 15,90 € | I185 · **Plato Queso** · 15,9 | „de“ fehlt im CSV-Namen; Preis gleich. |
| Crema Catalana · 6,50 € | I1 · **Crema** · 6,5 | Name verkürzt; Preis gleich. |
| Tarta Santiago · 6,90 € | I2 · Tarta Santiago · **6,5** | **Preis:** Karte **6,90 €** vs Kasse **6,50 €** (+0,40 € auf der Karte). |
| Tarta Santiago con Helado · 7,90 € | I3 · Tarta Santiago con helado / Button „Tarta con Helado“ · 7,9 | Preis gleich; Button-Bezeichnung verkürzt. |
| Schokotörtchen · 7,90 € | I189 · **Schokotarte** · 7,9 | Name (Torte vs Törtchen); Preis gleich. |

### 2.2 Nur in der Arbeitskopie (kein entsprechender Speise-Artikel in der CSV)

Alle Positionen der Arbeitskopie haben eine **inhaltliche Entsprechung** in der CSV (ggf. unter anderem Namen). **Ausnahme:** Es gibt **keinen** separaten CSV-Artikel „Crema Catalana“ als voller Name — nur **„Crema“** (I1).

---

### 2.3 Nur in `export.csv` (Speisen-Bereich, nicht auf der Arbeitskopie-Karte)

Diese Artikel sind in Lightspeed als Speisen geführt, fehlen aber **nicht** als eigene Zeile in `speisekarte-arbeitskopie.txt`:

| SKU | Name (CSV) | Standardpreis | Anmerkung |
|-----|------------|---------------|-----------|
| I45 | Churros | 5,9 | Zusatzangebot, nicht auf gedruckter Karte. |
| I187 | Trüffelkroketten. | 5,9 | Nicht auf Arbeitskopie. |
| I188 | Gutschein | (leer) | Verwaltung, keine Speise. |
| I192 | Tapas Divers | (leer) | Sammel-/Flex-Artikel. |
| I193 | extra Soße | 1,5 | Zusatz. |
| I194 | Pan Solo | 1,5 | Zusatz / Einzelprodukt. |
| I197 | Tapas der Woche | 5,9 | Wochenaktion. |
| I199 | Gaspacio | 5,9 | Nicht auf Arbeitskopie (Schreibung „Gaspacho“ üblich). |

---

## 3. Getränkekarte (`getraenkekarte-arbeitskopie.txt`) ↔ `export.csv`

### 3.1 Hochprozentiges / Schnaps

| Arbeitskopie | CSV-Äquivalent (falls vorhanden) | Abweichung |
|--------------|-------------------------------------|------------|
| Brandy Cardenal Mendoza 2 cl · 5,00 € | 146 · Brandy Cardenal Mendoza 2cl · 5,0 | Passend. |
| Absolut Vodka 2 cl · 3,50 € | 149 · Absolut Vodka 2cl · 3,5 | Passend. |
| Gordons Dry Gin 2 cl · 3,50 € | 150 · **Gin 2cl** · 3,5 | **Name:** Marke/Produkt auf Karte, generisch in CSV. |
| Ramazotti **4 cl** · 4,50 € | 151 · Ramazotti **2cl** · 4,5 | **Menge/Portion:** Karte **4 cl**, Kasse **2 cl** — Preis gleich, Einheit widerspricht. |
| Túnel Hierbas dulces (20%) 2 cl · 3,00 € | 152 · Tunel Hierbas Dulces (20%) 2cl · 3,0 | Schreibung (Túnel/Tunel); Preis gleich. |
| Túnel Hierbas secas (40%) 2 cl · **3,30 €** | 153 · Tunel Hierbas Secas (40%) 2cl · **3,0** | **Preis:** Karte **3,30 €** vs Kasse **3,00 €** (+0,30 € auf Karte). |
| Havana Club Añejo 3 · 3,50 € | 155 · Havana Club Añejo 3 2cl · 3,5 | Passend. |
| Licor 43² · 3,50 € | 157 · Licor 43 2cl · 3,5 | Fußnote ² nur auf Karte. |
| Sandemann Sherry · 3,50 € | 158 · Sandemann Sherry 2cl · 3,5 | Passend. |

**Nur in CSV (nicht in Arbeitskopie):**  
147 Brandy Carlos Primero, 148 Brandy Veterano Osborne, 154 Ron Miel, 156 Havana Club Añejo Especial, 159 Hausbrand, 140 Orujo, 201 Grey Goose 2cl — Karte wurde bewusst gestrafft; Kasse enthält **zusätzliche** Spirituosen.

---

### 3.2 Longdrinks & ähnlich

| Arbeitskopie | CSV | Abweichung |
|--------------|-----|------------|
| Cuba libre 0,2 l · **8,00 €** | 160 · Cuba Libre 0,2l · **8,5** | **Preis** +0,50 € in Kasse. |
| Gin Tonic 0,2 l · **8,00 €** | 161 · Gin Tonic 0,2l · **8,5** | **Preis** +0,50 € in Kasse. |
| Campari Orange 0,2 l · **7,50 €** | 162 · Campari Orange 0,2l · **8,0** | **Preis** +0,50 € in Kasse. |
| Crodino Orange 0,25 l · 6,50 € | 165 · Crodino · 6,5 | Kein Volumen im CSV-Namen; Preis gleich. |
| **Bodega Fizz** 0,2 l · 8,00 € | — | **Fehlt in CSV** als eigener Artikel. |
| Caipirinha 0,2 l · **8,00 €** | 203 · Caipirinha · **0,0** | **Preis in Kasse 0,00 €** — vermutlich Platzhalter/Fehler; Karte 8,00 €. |

**Nur in CSV (nicht auf Arbeitskopie):**  
163 Licor 43 mit Milch 0,2l · 7,5  
204 Mojito · 9,5  
205 Sangria 0,2l · 5,9  
206 Sangria 0,5l · 12,5  

---

### 3.3 Aperitif / Spritz / Schorlen / Sekt (Überblick)

| Arbeitskopie | CSV | Abweichung |
|--------------|-----|------------|
| Bodega Sommerschorle 0,25 l · 6,90 € | 61 · Sommer-Schorle · 6,9 | Name leicht anders; Preis gleich. |
| Aperol Spritz · 6,90 € | 62 · Aperol Spritz · 6,9 | Passend. |
| Campari Spritz · 6,90 € | — | **Nicht in CSV** gefunden. |
| Limoncello Spritz · 6,90 € | — | **Nicht in CSV** gefunden. |
| Hugo · 6,90 € | — | **Nicht in CSV** gefunden. |
| French Hugo · 6,90 € | — | **Nicht in CSV** gefunden. |
| Bodega Spritz · 6,90 € | — | **Nicht in CSV** gefunden. |
| Tinto de Verano 0,25 l · **6,20 €** / 0,5 l · **8,00 €** | 135 · Tinto de Verano 0,25L · **6,9**; 212 · Tinto de Verano 0,5L · **8,0** | **0,25 l:** Karte 6,20 € vs Kasse **6,90 €**. **0,5 l:** übereinstimmend 8,00 €. |
| Weinschorle 0,2 l · **4,00 €** | 63 Weinschorle süß · 4,5; 88 Weinschorle rot · 4,5; 133 Weinschorle rot süß · 4,5; 138 Weinschorle sauer · **4,0** | Karte **eine** generische Weinschorle 4,00 € (wie „sauer“); andere Varianten in CSV **4,50 €**. |
| Cava REXACH BAQUÉS 0,1 l · **6,00 €** | 64 · **Cava** · **6,9** | **Name** stark gekürzt; **Preis** Karte 6,00 € vs **6,90 €** in CSV. |
| Affentaler Riesling Sekt 0,1 l · **6,50 €** | — | **Nicht in CSV** gefunden. |

**Zusätzliche schorlen-/Sekt-Artikel nur in CSV:**  
Weinschorle-Varianten (süß/rot/sauer), Jo-Schorle, O-Schorle, A-Schorle, Ra-Schorle (jeweils 0,2 und 0,4). Diese **Struktur** gibt es auf der Text-Arbeitskopie nicht (dort nur gebündelte Saftschorle unter „Fruchtsaftschorle“).

---

### 3.4 Warme Getränke

| Arbeitskopie | CSV | Abweichung |
|--------------|-----|------------|
| Kaffee · 2,90 € | 166 · Kaffee · 2,9 | Passend. |
| Espresso · 2,60 € | 167 · Espresso · 2,6 | Passend. |
| Espresso doble · 3,50 € | 168 · Espresso Doble · 3,5 | Schreibweise. |
| Cortado — Espresso mit Milch · 3,30 € | 169 · Cortado (Espresso mit Milch) · 3,3 | Passend. |
| Carajillo · 5,50 € | 170 · Carajillo (Espresso mit Brandy) · 5,5 | Passend. |
| **Café Bombón** · **3,80 €** | — | **Fehlt in CSV** (keine eigene Zeile zwischen Carajillo und Milchkaffee). |
| Café con leche · 4,00 € | 172 · Milchkaffee · 4,0 | Gleicher Preis; **Name** unterschiedlich (spanisch vs deutsch). |
| Latte / Cappuccino / Tee | 173–175 · gleiche Preise | Passend. |

---

### 3.5 Alkoholfreie Getränke / Limonaden / Softdrinks

Die Arbeitskopie bündelt Teinacher Mineralwasser und Teinacher Genuss-Limonaden; die CSV zerlegt in **viele Einzel-SKUs**.

**Mineralwasser Teinacher**

| Arbeitskopie | CSV-Zeilen (Auszug) | Abweichung |
|--------------|---------------------|------------|
| Classic/Medium/Naturell · 0,25 **3,20** / 0,5 **4,50** | 46 Classic 0,25 L · 3,2; 116 Medium 0,25 L · 3,2; 179 Naturell 0,25 L · 3,2; 47 Medium 0,5L · 4,5; 48 Naturell 0,5 L · 4,5; 117 Classic 0,5L · 4,5 | Preise **passen** zu den Einzel-SKUs; **Logik:** Karte „ein Feld“, Kasse **mehrere Artikel** nach Sorte/Volumen. |

**Paulaner Limo / Hausgemacht**

| Arbeitskopie | CSV |
|--------------|-----|
| Paulaner Limo 0,33 · **4,00 €** | **221 · Paulaner Cola · 3,9** — separate SKUs 176–178 Limo Mango/Orange/Johannisbeere je **4,0** |

**Abweichung:** Auf der Karte **eine** „Paulaner Limo“; in CSV **keine** identische Bezeichnung „Paulaner Limo“, stattdessen **Paulaner Cola** und **drei** Limo-Einzelgeschmacks-SKUs. **Hausgemachte Holunder-/Ingwerlimo** — **keine** direkten CSV-Namen gefunden.

**Teinacher Genuss Limonade** (ein Preis 0,33 l · 4,00 €): entspricht den Limo-Einzelpreisen **4,0** in CSV, aber **ohne** einen zusammengefassten Artikel wie auf der Karte.

**Cola / Cola Zero / Fanta**

| Arbeitskopie | CSV |
|--------------|-----|
| 0,2 **3,20** / 0,4 **4,50** | 119 Cola 0,2L · **3,5**; 120 Cola 0,41L · 4,5; 121 Cola Zero 0,2L · **3,2**; 122 Cola Zero 0,4L · 4,5; 123 Fanta 0,2L · **3,5**; 124 Fanta 0,41L · 4,5 |

**Preisabweichung:** Karte Cola/Fanta **0,2 l = 3,20 €** — CSV Cola/Fanta 0,2 l **3,50 €** (nur Cola Zero 0,2 entspricht **3,2**).

**Schweppes** (Tonic, Ginger Ale, Bitter Lemon): **Keine** Treffer im CSV für „Schweppes“ — **fehlen** als eigene Artikel.

**Fruchtsaft / Fruchtsaftschorle** (Karte 0,2/0,4 mit festen Preisen): CSV enthält **Jo-/O-/A-/Ra-Schorle** als eigene Artikel — **anderes Namensschema**, teils gleiche Preise (3,5 / 4,5).

**Weitere nur CSV:** 210 Paulaner Spezi · 3,9; 233 Limonade 0,5 · 6,5.

---

### 3.6 Bier

| Arbeitskopie | CSV | Abweichung |
|--------------|-----|------------|
| Fürstenberg Pils 0,3/0,5 · 3,80 / 4,90 | 139 Pils 0,3L · 3,8; 66 Pils 0,5L · 4,9 | Passend. |
| Paulaner Hefe 0,3/0,5 · 3,80 / 4,90 | 140 Hefeweizen 0,3L · 3,8; 67 Hefeweizen 0.5L · 4,9 | Namensvariante; Preise gleich. |
| Hoepfner Kräusen | 68 Kräusen 0.5L · 4,9 | Karte enthält **zwei** Größen; CSV nur **0,5 l** explizit mit Preis — **0,3 l** für Kräusen in CSV nicht einzeln gelistet (ggf. anderweitig). |
| Radler süß oder sauer 0,3/0,5 · 3,60 / 4,70 | 142 Radler süß 0,3L · 3,6; 214–219 diverse Radler inkl. alkfrei · versch. Preise | Karte **ein** kombinierter Artikel; CSV **viele** Varianten (süß/sauer, alk./alkfrei, Volumen). |
| Chiemseer Hell 0,3/0,5 · 3,80 / 4,90 | 240 Chiemseer 0,3 · 3,8; 241 Chiemseer 0,5 · 4,9 | Passend. |
| San Miguel 0,33 · 4,50 € | 143 · 4,5 | Passend. |
| Fürstenberg alkoholfrei 0,33 · 3,70 € | 144 · 3,7 | Passend. |
| Paulaner Hefe alkoholfrei 0,5 · 4,70 € | 72 · 4,7 | Passend. |

**Nur CSV:** 211 Hefeweizen Cola 0,3L · 3,6; 213 Hefeweizen Cola 0,5L · 4,7; 212 Tinto 0,5 (bereits unter Sekt); diverse Radler-Zusatz-SKUs.

---

### 3.7 Wein — Weiß / Rosé / Rot (Kernaussagen)

Die Arbeitskopie listet **Weine mit Herkunft und Namen** (z. B. D.O., Winzer); die CSV nutzt **Kurznamen und teils andere Preise**.

**Ausgewählte harte Abweichungen (Preis)**

| Thema | Arbeitskopie | CSV | Δ |
|-------|--------------|-----|---|
| Santa Cruz Verdejo 0,2 | **5,50 €** | 79 Santa Cruz weiß 0.2l · **6,9** | +1,40 € in Kasse |
| Affentaler Monkey Mountain weiß 0,2 | **5,00 €** | — | **Kein CSV-Eintrag** unter diesem Namen |
| Affentaler Rivaner 0,2 | **5,50 €** | 100 Rivaner 0.2l · **6,5** | +1,00 € in Kasse |
| Ramirez Weißwein 0,2 | **6,00 €** | 235 Ramirez weiß 0,2 · **7,9** | +1,90 € in Kasse |
| Palacio/Nivarius Flasche 0,75 | **28,00 €** | 85 Palacio weiß 0,75 · **30,0** | +2,00 € in Kasse |
| LEZA GARCIA Reserva 0,75 | **28,00 €** | 88 Leza Garcia rot 0,75 · **30,0** | +2,00 € in Kasse |
| OSTATU Escobal 0,75 | **30,00 €** | 89 Ostatu Escobal 0,75 · **32,0** | +2,00 € in Kasse |
| OSTATU Gloria 0,75 | **65,00 €** | 90 Ostatu Gloria 0,75 · **69,0** | +4,00 € in Kasse |
| RAÍZ DE GUZMÁN Crianza 0,75 | **36,00 €** | 91 Raiz 0,75 · **39,0** | +3,00 € in Kasse |
| PAGO DE INA Selección 2018 | **40,00 €** | 92 Pago 2018 0,75 · **44,0** | +4,00 € in Kasse |
| PAGO DE INA Vendimia 2012 | **59,00 €** | 93 · gleich 59,0 | Passend. |
| BODEGAS MORCA Godina | **45,00 €** | 94 Morca 0,75 · **47,0** | +2,00 € in Kasse |
| Santa Cruz Garnacha 0,2 rot | **5,50 €** | 113 Santa Cruz rot 0,2 · **5,9** | +0,40 € in Kasse |
| COVILA Crianza 0,2 | **6,90 €** | 105 Covila 0,2 · **7,5** | +0,60 € in Kasse |
| Hacienda Arínzano 0,2 | **7,50 €** | 223 Hacienda · **7,9** | +0,40 € in Kasse |
| RAÍZ Roble 0,2 (auf Karte historisch; aktuelle AK listet Rot-Glas u. a.) | — | 107 Raiz 0,2 · **8,5** | Karte vs Kasse nur über Einzelabgleich; **Spätburgunder** in CSV 95 · **6,5** |

**Rosé**

| Arbeitskopie | CSV |
|--------------|-----|
| Santa Cruz Syrah Rosado 0,2 · 5,50 € | 102 Santa Cruz rose 0,2 · **6,9** |
| Affentaler Monkey Mountain Rosé 0,2 · 5,00 € | — **fehlt** als „Monkey Mountain“ |
| Ramirez Rosé 0,2 · 5,50 € | 237 Ramirez rosé 0,2 · **7,9** |

**Nur CSV (Wein, nicht auf Text-Arbeitskopie):**  
81 Ostatu weiß 0,2l · 7,5 — **83 Pandora Pandra** 0,2l · 7,5 (auf aktueller Getränkekarten-Arbeitskopie **nicht** mehr geführt),  
91 Lugana · 7,5 und 207 Lugana 0,75 · 35,  
97 Ostatu weiß 0,75 · 32,  
191 Lugana,  
209 Roséwein 0,1 · 4,9,  
220 Weißwein 0,1l · 4,5,  
183 Rotwein 0,1 · 3,9,  
222 Santa Cruz Rose Flasche · 35,  
224 Hacienda Flasche · 55,  
234–239 Ramirez/Caré **0,1** und **0,2** mit anderen Preisen als die pauschalen Kartenzeilen.

---

## 4. Zusammenfassung

### 4.1 Wo stimmen Namen & Preise überwiegend?

- Viele **Tapas-Basispreise** und **Bier-Standardgrößen** sind zwischen Karte und CSV **deckungsgleich** oder nur **benannt verkürzt**.  
- **Harte Preis-Konflikte** treten gehäuft bei **Weinen** (CSV oft **teurer** als Text-Arbeitskopie), bei **Longdrinks** (Kasse höher als Karte), bei **Cola/Fanta 0,2 l**, bei **Tinto 0,25 l**, bei **Cava-Kurzname**, und bei einzelnen **Speisen** (Aceitunas, Gambas Kartoffelmantel, Ensalada Ibérico, Tarta Santiago).

### 4.2 Wo hat die CSV mehr Artikel?

- **Spirituosen:** mehr Sorten als auf der Karte.  
- **Longdrinks/Cocktails:** Mojito, Sangrías, Licor 43 mit Milch, Grey Goose …  
- **AFG:** sehr fein aufgeschlüsselte Schorlen, Limos, Cola-Varianten.  
- **Bier:** Radler-/Cola-Varianten zusätzlich.  
- **Speisen:** Churros, Trüffelkroketten, Gaspacio, Tapas der Woche, Zuschläge (Soße, Pan Solo, …).

### 4.3 Wo hat die Arbeitskopie mehr / andere Konzepte?

- **Spritz-/Karten-Abschnitt:** Campari Spritz, Limoncello Spritz, Hugo, French Hugo, Bodega Spritz — **nicht** als eigene CSV-Zeilen gefunden.  
- **Bodega Fizz**, **Affentaler Riesling Sekt**, **Schweppes**-Linie, **Hauslimos**, **Café Bombón** — **fehlen** oder sind nur fragmentiert in CSV abgebildet.  
- **Weinkarte:** ausführliche Namen (D.O., Jahrgänge); CSV stark **abgekürzt**.

---

## 5. Nächster Schritt (noch nicht ausgeführt)

Geplante **Kongruenz**: eine gemeinsame Liste definieren (Referenz = Arbeitskopien **oder** Lightspeed — politisch zu klären), dann **Namen angleichen**, **Preise vereinheitlichen**, **SKUs/Kassenbuttons** anpassen und **Web/Print** (`menu.ts`, `drinks.ts`) aktualisieren.

---

*Dieses Dokument beschreibt ausschließlich Abweichungen; es wurden keine Stammdaten geändert.*
