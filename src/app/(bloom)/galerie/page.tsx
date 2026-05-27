import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/ui/Section";
import { gallery } from "@/content/home";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Galerie",
  description: "Eindrücke aus der Bodega Bühlot — Tapas, Wein, Atmosphäre.",
};

const spanClass: Record<(typeof gallery)[number]["span"], string> = {
  small: "row-span-1 sm:col-span-1 aspect-square",
  tall: "row-span-2 sm:col-span-1 aspect-[3/4] sm:aspect-auto sm:min-h-[600px]",
  wide: "row-span-1 sm:col-span-2 aspect-[16/9]",
};

export default function GaleriePage() {
  return (
    <>
      <PageHero
        eyebrow="Galerie"
        title="Eine Sammlung von Augenblicken."
        intro="Zwischen Küche und Terrasse, zwischen erstem und letztem Glas."
      />

      <Section spacing="lg">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 auto-rows-[minmax(180px,auto)]">
          {gallery.map((g, i) => (
            <figure
              key={`${ g.src }-${ i }`}
              className={cn(
                "relative overflow-hidden rounded-[var(--radius-card)] group bg-surface-card",
                spanClass[g.span],
              )}
            >
              <Image
                src={g.src}
                alt={g.alt}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                priority={i < 4}
                className="object-cover transition-transform duration-[900ms] ease-[var(--ease-bloom)] group-hover:scale-[1.04]"
              />
              <figcaption
                className="absolute inset-x-0 bottom-0 p-4 text-xs uppercase tracking-[0.18em] text-bloom-cream bg-gradient-to-t from-bloom-ink/85 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {g.alt}
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>
    </>
  );
}
