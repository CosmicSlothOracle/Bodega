# Bar Book Styleguide — V2 Artisan Sketch

Dieser Styleguide definiert die Gestaltungsregeln und visuellen Standards für das Bodega Bar-Buch im "Artisan Sketch" / Hand-drawn Look. Er dient als Grundlage, um zukünftige Rezepte konsistent und in der gleichen hochwertigen Ästhetik zu gestalten.

## 1. Grundästhetik & Farben
Das Design soll an ein hochwertiges, klassisches Notizbuch oder Skizzenbuch erinnern. 

- **Hintergrund (`--bg`)**: `#f4efe8` – Ein warmer Papier-Ton (Pergament/Off-White).
- **Tinte (`--ink`)**: `#2b221d` – Ein dunkles Sepia/Kohle-Schwarz, nicht rein schwarz, um den Vintage-Charakter zu unterstreichen.
- **Akzent / Hilfslinien**: Leicht transparente Versionen der Tintenfarbe (z.B. `rgba(43, 34, 29, 0.2)`).

## 2. Typografie
Wir verwenden elegante, klassische Schriften, die Handwerkskunst ausstrahlen:
- **Fließtext & Icons**: `'Playfair Display', Georgia, serif`
- **Titel**: Groß, `font-style: italic`, weiter Laufweite (`letter-spacing: 0.05em`).
- **Preise/Zahlen**: Festbreitenschrift oder strukturierte Darstellung (z.B. `monospace`) zur Absetzung vom verschnörkelten Titel.
- **Unterüberschriften**: Großbuchstaben (`uppercase`), stark gesperrt (`letter-spacing: 0.2em`), sehr klein (`0.9rem`).

## 3. Symbolik & Illustrationen (SVGs)
Alle Symbole müssen aussehen, als wären sie mit einem feinen Fineliner oder Tuschefüller gezeichnet worden.

**Regeln für SVGs:**
1.  **Keine Füllungen**: `fill: none` für alle Pfade.
2.  **Dünne Strichstärke**: `stroke-width: 0.8`.
3.  **Weiche Kanten**: `stroke-linecap: round; stroke-linejoin: round;`.
4.  **Schraffuren (Hatching)**: Um Volumen und Schatten anzudeuten, nutzen wir eine eigene Klasse `.hatch`.
    -   `.hatch` hat `stroke-width: 0.3` und `opacity: 0.7`.
    -   Beispiel: Ein paar parallele, schräge Linien (`l4 -4`) am Rand eines Eiswürfels oder Glases.
5.  **Unperfektion**: Linien dürfen leicht überlappen oder nicht mathematisch perfekt abschließen (z.B. der Flüssigkeitsspiegel im Glas).

## 4. Layout & Aufbau eines Rezepts
Jedes Rezept folgt diesem strukturierten Ablauf, um dem Barkeeper alle Infos auf einen Blick zu geben:

1.  **Header**: 
    -   Zentrierter Name des Drinks (kursiv, riesig).
    -   Darunter Preis und ggf. kleine Zusatzinfo.
2.  **Equipment & Zutaten ("Mise en Place")**:
    -   Horizontale Auflistung aller benötigten Elemente (Glas, Eisart, Spirituosen, Deko).
    -   Jedes Element hat ein Sketch-Icon und eine kurze, kursive Beschriftung.
3.  **Zubereitung (Ablauf / Flow)**:
    -   Chronologischer Aufbau von links nach rechts (durch eine Tilde `~` als Pfeilersatz verbunden).
    -   Jeder Schritt kombiniert ein Icon mit dicker Mengenangabe (`strong`) und kleinen Zusätzen (`em`).
4.  **Deko & Finish**:
    -   Klar verständliche Anweisung für das Garnish (z.B. "Zitronenzeste übers Glas knicken, Rand abfahren...").
    -   Dieser Teil muss zwingend im Flow oder direkt darunter prominent aufgeführt sein.

## 5. Vorlagen für häufige Symbole
-   **Weinglas / Spritz-Glas**: Runder Kelch, feine Schraffur am unteren Bauch. Flüssigkeitslinie mit leichter Wellenform.
-   **Eiswürfel**: Skizzierte Würfel (schräge Polygone), kleine Schraffuren an den Schattenseiten.
-   **Zitrone / Orange**: Runder Kreis mit kleinerem Innenkreis, gekreuzte Linien für die Segmente.
-   **Ingwer**: Unregelmäßige, knollige Form, kleine Punkte oder Striche für die Wurzelstruktur.
-   **Zeste / Deko**: Spiralförmige Linie, die aus dem Glas ragt.
-   **Sekt / Filler**: Hohe Flasche oder stilisierter "Splash" (Flüssigkeit, die eingegossen wird).