import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/ui/Section";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Datenschutzerklärung der Bodega Bühlot.",
};

export default function DatenschutzPage() {
  return (
    <>
      <PageHero eyebrow="Rechtliches" title="Datenschutz" />

      <Section spacing="lg">
        <div className="space-y-10 max-w-2xl">
          <p className="text-lg">
            Wir nehmen den Schutz deiner persönlichen Daten ernst. Die folgende Erklärung gibt einen
            Überblick darüber, welche Daten wir verarbeiten, zu welchem Zweck, und welche Rechte du
            hast.
          </p>

          <div>
            <h2 className="text-2xl mb-4">Verantwortliche Stelle</h2>
            <p>
              {site.name}, Inhaberin {site.owner}, {site.contact.address.street},{" "}
              {site.contact.address.zip} {site.contact.address.city}.
            </p>
          </div>

          <div>
            <h2 className="text-2xl mb-4">Reservierungen</h2>
            <p>
              Bei einer Reservierung verarbeiten wir Name, Kontaktdaten, Datum, Uhrzeit und
              Personenzahl auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung). Die
              Daten werden nach 24 Monaten gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten
              entgegenstehen.
            </p>
          </div>

          <div>
            <h2 className="text-2xl mb-4">Reichweitenmessung</h2>
            <p>
              Zur statistischen Auswertung der Website-Nutzung setzen wir PostHog (gehostet in der
              EU, eu.i.posthog.com) in einer cookielosen Konfiguration ein: Es werden keine Cookies
              gesetzt und keine geräteübergreifende Wiedererkennung gespeichert. IP-Adressen werden
              vor der Speicherung gekürzt; pseudonyme Sitzungs-IDs verbleiben ausschließlich im
              Arbeitsspeicher des Browsers (Art. 6 Abs. 1 lit. f DSGVO).
            </p>
          </div>

          <div>
            <h2 className="text-2xl mb-4">Deine Rechte</h2>
            <p>
              Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung,
              Widerspruch und Datenübertragbarkeit. Anfragen genügen formlos per E-Mail an{" "}
              <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
