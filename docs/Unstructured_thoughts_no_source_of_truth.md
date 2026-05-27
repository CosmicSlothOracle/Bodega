Wir warten noch.  Ist es möglich bevor wir die alte Webseite anfassen cutover vorbereiten.

Volle Funktionalität aller Anbindungen zu verifizieren und zu bestätigen.

Da du über die technische Übersicht verrfügst bitte folgendes einmal zum status quo des projekts einordnen.
Ich werde deskriptiv beschreiben was ich mir vorstelle und du musst einordnen vor dem Hintergrund des Projekts und dem aktuellen development.

- Dashboard Mitarbeiter Tagesgeschäft -
- Anzeigen von Schichtplänen welche vom admin eingepflegt werden über ui und dann live geschalten werden im mitarbeiter dashboard bereich.
- Automatisierte Anbindung an whatsapp um mitarbeiter über eintragungen mit link zum schichtplan zu informieren.
- Mitarbeiter sollen im Dashboard dann die Möglichkeit haben Tauschanfragen zu stellen welche wiederum via whatsapp benachrichtigung an admin gehen um nach bestätigung oder ablehnung zu fragen was widerum im adminbereich einzupflegen/zu bestätigen wäre.

- Reservierungen -
- Frontend Eingabe ist gut wie es ist.
"Deskreptives Szenario mit implikationen: Ein User bucht einen Tisch auf der Webseite. Paralell dazu ruft jemand im restaurant an und reserviert. Es könnte zu doppelbelegungen kommen. Wir brauchen eine quelle der wahrheit bzgl. reservierungen ggf. dish schon optimal. Wir brauchen einen einfachen Weg telefonsich getätigte Reservierungen zügig mit einuzpflegen von Mitarbeietern.
Szenario 2: Online reserviert Gast kommt nicht. Um zu vermeiden dass Gäste reservieren und nicht absagen eine möglichkeit beim reservieren whatsapp telenummer mit anzugeben damit wir automatisiert 15 min vor Reservierungsbeginn eine Nachfrage via whatsapp zu senden eg. "Wir freuen uns auf ihren Besuch. Falls wir noch etwas vorbeereiten sollen odg." um implikativ zu erfahren ob die Personen wirklich kommen. Ich denke Faulheit ist der Grund für nicht absagen und direkte whatsapp kommunikation könnte das überbrücken.
Der Tischplan im Dashboard mit den reservierungen würde ich erstmal rausnehmen und eine Liste anbieten. Natürlich eingebettet in die UI. Später mit easy export to pdf or print. Ggf. später auch mit Sitzplan aber der wird aktuell noch asugearbeitet.
- Dishanbindung muss unbedingt getestet werden ohne das aktuelle System zu stören welches über bodega-buehlot.de aktuell läuft dieses wird für den tagesbetrieb genutzt. Ich befürchte nur dass ggf. die vorgeschaltete UI um den Reservierungprozess visuell auf der Seite zu integrieren die Daten ggf nicht korrekt an Dish ausliefertt und den Reservierungprozess doppelt durchlaufen zu müssen  wäre ein no go dann  lieber direkt auf dish leiten. Präferiert bleibt eigne UI.

- Trafficmonitoring user monitoring -
- Muss mit echten Daten getestet werden. Mockdata und eine reale Anbindung können eine komplizierte Lücke sein.
- Klickverhalten Userinteraktionsmonitoring logging und automatisierte Auswertung.
- User movement muss nachvollziehbar sein.
- Woher kommen die User was wird am meisten geklickt etc. Vieles ist in der Mockdata Darstellung schon zu finden jedoch fehlen noch klare Anbindungsdefinitionen und algorithmische Auswertungen der Metriken.
- Ich kenne mich bei dem Thema bzgl der technischen Umsetzbarkeit wenig aus, daher ist hier eine kritische Stimme wichtig. Dies bleibt jedochj für mich einer der spannensten Aspekte welche auch vor dem Hintergrund meiner beruflichen Entwicklung ein Gewinn sein wird.

- Admin Dashboard -
- Freigabe von Gehaltsabrechnungen zum download möglich ?
- Alles was schon besprochen war + Implikationen aus vorausgegangener Beschreibungeg. Schichtplanung.

