import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/ui/Section";
import { menu } from "@/content/menu";
import { formatPrice } from "@/lib/utils";
import { DietarySymbol } from "@/components/site/DietarySymbol";

export const metadata: Metadata = {
  title: "Speisekarte",
  description: "Tapas, Salate, Platten und Desserts der Bodega Bühlot.",
};

export default function SpeisekartePage() {
  return (
    <>
      <PageHero
        eyebrow="Speisekarte"
        title="Tapas, Salate, Desserts."
        intro="Direkt aus Spanien oder mit regionalen Akzenten – mit Bedacht ausgewählt. Zu Weinen und Getränken siehe die Getränkekarte; nach Tagesempfehlungen fragst du uns gern direkt am Tisch."
      />

      <Section spacing="lg">
        <div className="space-y-20">
          {menu.map((sec) => (
            <article key={sec.id} id={sec.id} className="scroll-mt-32">
              <header className="mb-8 max-w-2xl">
                <h2>{sec.title}</h2>
                {sec.intro ? (
                  <p className="mt-4 text-lg">{sec.intro}</p>
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
                        {item.vegan ? <DietarySymbol type="vegan" /> : null}
                        {item.vegetarian && !item.vegan ? (
                          <DietarySymbol type="vegetarian" />
                        ) : null}
                        {item.spicy ? <DietarySymbol type="spicy" /> : null}
                      </div>
                      {item.desc ? (
                        <p className="mt-2 text-text-secondary text-sm leading-relaxed max-w-2xl">
                          {item.desc}
                        </p>
                      ) : null}
                    </div>
                    <div className="font-display text-xl text-bloom-ochre tabular-nums">
                      {formatPrice(item.price)}
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-12 flex gap-6 text-[0.65rem] uppercase tracking-widest opacity-60 border-t border-border-soft pt-8">
          <DietarySymbol type="vegan" />
          <DietarySymbol type="vegetarian" />
          <DietarySymbol type="spicy" />
        </div>
      </Section>
    </>
  );
}
