import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/ui/Section";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum der Bodega Bühlot.",
};

export default function ImpressumPage() {
  return (
    <>
      <PageHero eyebrow="Rechtliches" title="Impressum" />

      <Section spacing="lg">
        <div className="prose-bloom space-y-8 max-w-2xl">
          <div>
            <h2 className="text-2xl mb-4">Anbieterin</h2>
            <p className="text-lg leading-relaxed">
              {site.name}
              <br />
              Inhaberin: {site.owner}
              <br />
              {site.contact.address.street}
              <br />
              {site.contact.address.zip} {site.contact.address.city}
              <br />
              {site.contact.address.country}
            </p>
          </div>

          <div>
            <h2 className="text-2xl mb-4">Kontakt</h2>
            <p className="text-lg leading-relaxed">
              Telefon: <a href={`tel:${site.contact.phone}`}>{site.contact.phoneDisplay}</a>
              <br />
              E-Mail: <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
            </p>
          </div>

          <div>
            <h2 className="text-2xl mb-4">Verantwortlich für den Inhalt</h2>
            <p className="text-lg leading-relaxed">
              {site.owner}, Anschrift wie oben.
            </p>
          </div>

          <div>
            <h2 className="text-2xl mb-4">Streitbeilegung</h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
              bereit:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
              >
                ec.europa.eu/consumers/odr
              </a>
              . Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
