import Image from "next/image";
import { Section, Eyebrow } from "@/components/ui/Section";
import { wineCocktails } from "@/content/home";

export function WineCocktailsSection() {
  return (
    <Section spacing="xl" tone="ink">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:items-center">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)]">
          <Image
            src={wineCocktails.image}
            alt={wineCocktails.imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-tr from-bloom-wine/40 via-transparent to-transparent"
          />
        </div>

        <div>
          <Eyebrow>{wineCocktails.eyebrow}</Eyebrow>
          <h2 className="mt-6 text-balance">{wineCocktails.headline}</h2>
          <p className="mt-8 text-lg">{wineCocktails.body}</p>

          <ul className="mt-10 divide-y divide-border-soft border-y border-border-soft">
            {wineCocktails.picks.map((p) => (
              <li
                key={p.label}
                className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 py-5"
              >
                <span className="font-display text-bloom-cream text-xl min-w-[180px]">
                  {p.label}
                </span>
                <span className="text-text-secondary">{p.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
