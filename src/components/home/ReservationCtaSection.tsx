import Link from "next/link";
import { Section, Eyebrow } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { finalCta } from "@/content/home";

export function ReservationCtaSection() {
  return (
    <Section spacing="xl" tone="default">
      <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-[color-mix(in_srgb,var(--bloom-wine)_30%,var(--bloom-ink))] border border-border-soft px-8 sm:px-16 py-20 sm:py-28">
        <div
          aria-hidden
          className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-bloom-ochre/15 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-bloom-red/20 blur-3xl"
        />

        <div className="relative max-w-2xl">
          <Eyebrow>{finalCta.eyebrow}</Eyebrow>
          <h2 className="mt-6 text-balance">{finalCta.headline}</h2>
          <p className="mt-8 text-lg">{finalCta.body}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button asChild variant="primary" size="lg">
              <Link href={finalCta.primary.href}>{finalCta.primary.label}</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href={finalCta.secondary.href}>{finalCta.secondary.label}</Link>
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
