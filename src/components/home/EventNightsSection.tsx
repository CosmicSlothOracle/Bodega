import Link from "next/link";
import { Section, Eyebrow } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { eventNights } from "@/content/home";

export function EventNightsSection() {
  return (
    <Section spacing="lg">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-end">
        <div>
          <Eyebrow>{eventNights.eyebrow}</Eyebrow>
          <h2 className="mt-6 text-balance">{eventNights.headline}</h2>
          <p className="mt-8 text-lg">{eventNights.body}</p>
          <div className="mt-8">
            <Button asChild variant="secondary">
              <Link href="/events">Alle Events</Link>
            </Button>
          </div>
        </div>

        <ol className="space-y-3">
          {eventNights.events.map((e) => (
            <li
              key={e.title}
              className="group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 px-6 sm:px-8 py-6 rounded-[var(--radius-card)] bg-surface-card border border-border-soft hover:bg-surface-hover hover:border-border-strong transition"
            >
              <span className="font-mono text-xs uppercase tracking-[0.24em] text-bloom-ochre min-w-[110px]">
                {e.date}
              </span>
              <div className="flex-1">
                <h3 className="text-2xl text-bloom-cream">{e.title}</h3>
                <p className="mt-1 text-sm text-text-secondary">{e.desc}</p>
              </div>
              <Link
                href="/reservierung"
                className="self-start sm:self-auto text-xs uppercase tracking-[0.22em] text-bloom-ochre group-hover:text-bloom-cream"
              >
                Plätze sichern →
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
