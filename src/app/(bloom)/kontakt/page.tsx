import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/ui/Section";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Anschrift, Öffnungszeiten und Kontakt der Bodega Bühlot.",
};

export default function KontaktPage() {
  return (
    <>
      <PageHero
        eyebrow="Kontakt"
        title="Schön, von euch zu hören."
        intro="Für den normalen Abend nutzt du am besten unsere Online-Reservierung. Wenn ihr eine größere Gruppe ab 9 Personen seid oder besondere Wünsche habt, sprecht uns einfach direkt an."
      />

      <Section spacing="lg">
        <div className="grid gap-12 md:grid-cols-2">
          <div className="space-y-8">
            <div>
              <h3 className="text-xs uppercase tracking-[0.28em] text-bloom-ochre/90 mb-3">
                Adresse
              </h3>
              <address className="not-italic text-lg leading-relaxed">
                {site.name}
                <br />
                {site.contact.address.street}
                <br />
                {site.contact.address.zip} {site.contact.address.city}
              </address>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-[0.28em] text-bloom-ochre/90 mb-3">
                Direkter Draht
              </h3>
              <p className="text-lg">
                <a href={`tel:${site.contact.phone}`}>{site.contact.phoneDisplay}</a>
                <br />
                <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
              </p>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-[0.28em] text-bloom-ochre/90 mb-3">
                Öffnungszeiten
              </h3>
              <ul className="space-y-1">
                {site.hours.map((h) => (
                  <li key={h.label} className="text-lg">
                    <span className="text-bloom-cream">{h.label}</span>
                    {" — "}
                    <span className="text-text-secondary">{h.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="aspect-[4/3] rounded-[var(--radius-card)] overflow-hidden border border-border-soft">
            <iframe
              title="Karte zur Bodega Bühlot"
              src="https://www.openstreetmap.org/export/embed.html?bbox=8.1346%2C48.6915%2C8.1396%2C48.6955&amp;layer=mapnik"
              className="w-full h-full bg-bloom-ink"
              loading="lazy"
            />
          </div>
        </div>
      </Section>
    </>
  );
}
