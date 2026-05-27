import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/ui/Section";
import { drinksMenu } from "@/content/drinks";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Getränkekarte",
  description: "Ausgewählte Weine, Cocktails und Erfrischungen der Bodega Bühlot.",
};

export default function GetraenkekartePage() {
  return (
    <>
      <PageHero
        eyebrow="Getränkekarte"
        title="Weine, Cocktails, Erfrischungen."
        intro="Unsere Auswahl an feinen Weinen, erfrischenden Longdrinks und spanischen Klassikern."
      />

      <Section spacing="lg">
        <div className="space-y-20">
          {drinksMenu.map((sec) => (
            <article key={sec.id} id={sec.id} className="scroll-mt-32">
              <header className="mb-8 max-w-2xl">
                <h2>{sec.title}</h2>
                {sec.subtitle ? (
                  <p className="mt-4 text-lg text-text-secondary">{sec.subtitle}</p>
                ) : null}
              </header>

              <ul className="divide-y divide-border-soft border-y border-border-soft">
                {sec.items.map((item, itemIdx) => (
                  <li
                    key={`${sec.id}-${itemIdx}`}
                    className="grid grid-cols-[1fr_auto] gap-x-8 gap-y-2 py-6"
                  >
                    <div>
                      <div className="flex flex-wrap items-baseline gap-3">
                        <h3 className="font-display text-xl text-bloom-cream">
                          {item.name}
                        </h3>
                      </div>
                      {item.desc ? (
                        <p className="mt-2 text-text-secondary text-sm leading-relaxed max-w-2xl">
                          {item.desc}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-1 items-end justify-center">
                      {item.prices.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          {p.volume && (
                            <span className="text-sm text-text-secondary">
                              {p.volume}
                            </span>
                          )}
                          <span className="font-display text-xl text-bloom-ochre tabular-nums">
                            {formatPrice(p.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
