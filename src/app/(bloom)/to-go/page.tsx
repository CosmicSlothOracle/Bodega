import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "To Go",
  description: "Tapas zum Mitnehmen aus der Bodega Bühlot.",
};

export default function ToGoPage() {
  return (
    <>
      <PageHero
        eyebrow="To Go"
        title="Die Bodega für zuhause."
        intro="Hol dir ein Stück Süden an den eigenen Esstisch. Einfach anrufen, wir bereiten alles frisch für dich vor."
      />

      <Section spacing="lg">
        <div className="max-w-2xl space-y-6">
          <p className="text-lg">
            Wir nehmen deine Bestellung gerne ab 16:00 Uhr entgegen. Alles wird so warm
            und ressourcenschonend wie möglich verpackt. Bezahlen kannst du ganz
            entspannt bei der Abholung.
          </p>

          <div className="rounded-[var(--radius-card)] bg-surface-card border border-border-soft p-8 space-y-4">
            <p className="text-xs uppercase tracking-[0.24em] text-bloom-ochre">Bestellung</p>
            <a
              href={`tel:${site.contact.phone}`}
              className="block font-display text-3xl text-bloom-cream"
            >
              {site.contact.phoneDisplay}
            </a>
            <a
              href={`mailto:${site.contact.email}`}
              className="block text-text-secondary"
            >
              {site.contact.email}
            </a>
          </div>

          <Button asChild variant="secondary">
            <a href="/speisekarte">Zur Speisekarte</a>
          </Button>
        </div>
      </Section>
    </>
  );
}
