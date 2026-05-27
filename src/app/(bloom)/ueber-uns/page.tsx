import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/site/PageHero";
import { Section, Eyebrow } from "@/components/ui/Section";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Über uns",
  description:
    "Die Geschichte hinter der Bodega Bühlot - mediterrane Küche, mit Liebe und langem Atem geführt.",
};

export default function UeberUnsPage() {
  return (
    <>
      <PageHero
        eyebrow="Über uns"
        title="Eine kleine mediterrane Insel an der Bühlot."
        intro={`Geführt von ${site.owner}. Seit 2009 ein fester Anker für alle, die Tapas, Wein und lange Abende ernst nehmen.`}
      />

      <Section spacing="lg">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)]">
            <Image
              src="/gallery/IMG_4614.webp"
              alt="Atmosphäre der Bodega Bühlot"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="space-y-6">
            <Eyebrow>Die Idee</Eyebrow>
            <h2 className="text-balance">Die Liebe zum Süden – serviert in kleinen Tellern.</h2>
            <p className="text-lg">
              Wir wollten einen Ort, an dem das Essen ein Vorwand ist, um zu bleiben. An dem Wein in
              Karaffen kommt, an dem Brot warm ist, an dem Gespräche länger werden, als geplant.
            </p>
            <p>
              Vieles direkt aus Spanien importiert. Vieles aus der Region. Wir kochen klassisch, ohne
              Show, mit Respekt für die Zutaten. Und wir reservieren Plätze – keine Slots.
            </p>
          </div>
        </div>

        <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-center mt-24">
          <div className="space-y-6 order-2 lg:order-1">
            <Eyebrow>Die Tradition</Eyebrow>
            <h2 className="text-balance">Von Deckeln, Fliegen und guten Weinen.</h2>
            <p className="text-lg">
              Das spanische Wort „tapa“ bedeutet eigentlich Deckel. Der Legende nach legte man früher eine Scheibe Brot, ein Stück Schinken oder eine Olive auf sein Glas, um den Wein vor Staub und Fliegen zu schützen.
            </p>
            <p>
              Wo auch immer dieser Brauch seine Wurzeln hat – heute sind Tapas ein Lebensgefühl. Ein Streifzug durch die facettenreichen Regionen Spaniens, der sich in unserer Karte widerspiegelt. Wir legen großen Wert auf Natürlichkeit und Qualität: Unsere Gerichte bestechen durch Einfachheit, ohne Kompromisse im Geschmack.
            </p>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] order-1 lg:order-2">
            <Image
              src="/gallery/img_4981-ts1587294720.webp"
              alt="Tapas Tradition"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      <Section spacing="lg" tone="ink">
        <div className="grid gap-12 sm:grid-cols-3">
          {[
            {
              title: "Die Bodega",
              body: "Das Herz. Warme Erdtöne, spanische Fliesen, rustikales Holz.",
            },
            {
              title: "Die Terrasse",
              body: "Die Seele. Direkt an der Bühlot. Sangria am Sommerabend.",
            },
            {
              title: "Events",
              body: "Live-Musik, Themenabende, kuratierte Wein-Tastings.",
            },
          ].map((b) => (
            <div key={b.title} className="space-y-3">
              <h3 className="text-2xl">{b.title}</h3>
              <p>{b.body}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
