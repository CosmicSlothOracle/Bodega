import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";
import { AmbienceAside } from "@/components/reservation/AmbienceAside";
import { env } from "@/lib/env";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Reservierung",
  description:
    "Reserviere deinen Tisch in der Bodega Bühlot. Buchung läuft sicher über DISH (Reserve with Google).",
};

export default function ReservierungPage() {
  const widgetId = `hors-hydra-${ env.public.dishRestaurantId }`;

  return (
    <>
      <PageHero
        eyebrow="Reservierung"
        title="Wann dürfen wir den Tisch decken?"
        intro="Wähle deine Zeit, den Rest erledigt ihr direkt im Buchungsfenster — atmosphärisch eingerahmt."
      />

      <Section spacing="lg">
        <div className="max-w-6xl mx-auto grid gap-8 lg:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:items-start">
          <div className="relative min-w-0">
            {/* Pulsing background glow */}
            <div
              aria-hidden
              className="absolute -inset-4 bg-bloom-red/15 blur-3xl rounded-[var(--radius-card)] animate-pulse pointer-events-none"
            />

            <Card className="relative border-bloom-red/40 shadow-[0_0_30px_-5px_color-mix(in_srgb,var(--bloom-red)_30%,transparent)] hover:border-bloom-red/60 transition-colors duration-500">
              <CardBody className="p-0">
                <div
                  id={widgetId}
                  className="w-full min-h-[620px] rounded-[calc(var(--radius-card)-8px)] overflow-hidden leading-[0]"
                />
                <Script id="dish-widget" strategy="lazyOnload">
                  {`
                    var _hors=[
                      ['eid','hydra-${ env.public.dishRestaurantId }'],
                      ['tagid','${ widgetId }'],
                      ['width','100%'],
                      ['height','620px'],
                      ['language', 'de'],
                      ['primaryColor', '#8b7a3d'],
                      ['foregroundColor', '#f3eee6'],
                      ['backgroundColor', '#211515']
                    ];
                    (function(d, t) {
                      var e=d.createElement(t),s=d.getElementsByTagName(t)[0];
                      e.src = "https://reservation.dish.co/widget.js";
                      s.parentNode.insertBefore(e,s);
                    }(document, 'script'));
                  `}
                </Script>
              </CardBody>
            </Card>
          </div>

          <AmbienceAside />
        </div>
      </Section>
    </>
  );
}
