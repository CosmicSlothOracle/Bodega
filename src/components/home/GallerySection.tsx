import Image from "next/image";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { gallery } from "@/content/home";
import { cn } from "@/lib/utils";

const spanClass: Record<(typeof gallery)[number]["span"], string> = {
  small: "row-span-1 sm:col-span-1 aspect-square",
  tall: "row-span-2 sm:col-span-1 aspect-[3/4] sm:aspect-auto sm:min-h-[520px]",
  wide: "row-span-1 sm:col-span-2 aspect-[16/9]",
};

export function GallerySection() {
  return (
    <Section spacing="xl" tone="ink">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
        <div className="max-w-2xl">
          <Eyebrow>Galerie</Eyebrow>
          <h2 className="mt-6 text-balance">
            Eine Sammlung von Augenblicken, gesammelt zwischen Küche und Terrasse.
          </h2>
        </div>
        <Button asChild variant="secondary">
          <Link href="/galerie">Alle Bilder</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 auto-rows-[minmax(180px,auto)]">
        {gallery.slice(0, 8).map((g, i) => (
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
              loading={i === 0 ? "eager" : "lazy"}
              className="object-cover transition-transform duration-[900ms] ease-[var(--ease-bloom)] group-hover:scale-[1.04]"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-bloom-ink/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </figure>
        ))}
      </div>
    </Section>
  );
}
