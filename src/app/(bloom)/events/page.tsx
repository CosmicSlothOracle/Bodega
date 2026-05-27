import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { eventNights } from "@/content/home";

export const metadata: Metadata = {
  title: "Events",
  description: "Live-Musik, Wine Tastings und mediterrane Themenabende in der Bodega Bühlot.",
};

export default function EventsPage() {
  return (
    <>
      <PageHero
        eyebrow="Event Nights"
        title="Live-Musik, Wein-Tastings, lange Abende."
        intro="Einmal im Monat wird die Bodega zur kleinen Bühne. Plätze sind begrenzt – Reservierung empfohlen."
      />

      <Section spacing="lg">
        <ol className="space-y-4">
          {eventNights.events.map((e) => (
            <li
              key={e.title}
              className="rounded-[var(--radius-card)] bg-surface-card border border-border-soft hover:bg-surface-hover hover:border-border-strong transition px-6 sm:px-10 py-8 sm:py-10"
            >
              <div className="grid gap-6 sm:grid-cols-[140px_1fr_auto] sm:items-center">
                <span className="font-mono text-xs uppercase tracking-[0.24em] text-bloom-ochre">
                  {e.date}
                </span>
                <div>
                  <h2 className="text-3xl">{e.title}</h2>
                  <p className="mt-2">{e.desc}</p>
                </div>
                <Button asChild variant="primary" size="md">
                  <Link href="/reservierung">Plätze sichern</Link>
                </Button>
              </div>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}
