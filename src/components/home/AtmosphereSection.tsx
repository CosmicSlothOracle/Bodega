import Image from "next/image";
import { Section, Eyebrow } from "@/components/ui/Section";
import { atmosphere } from "@/content/home";

export function AtmosphereSection() {
  return (
    <Section spacing="xl" tone="ink">
      <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div className="order-2 lg:order-1">
          <Eyebrow>{atmosphere.eyebrow}</Eyebrow>
          <h2 className="mt-6 text-balance">{atmosphere.headline}</h2>
          <div className="mt-8 space-y-5">
            {atmosphere.body.map((p, i) => (
              <p key={i} className="text-lg">
                {p}
              </p>
            ))}
          </div>
        </div>

        <div className="order-1 lg:order-2 relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)]">
          <Image
            src={atmosphere.image}
            alt={atmosphere.imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-bloom-ink/40 via-transparent to-transparent"
          />
        </div>
      </div>
    </Section>
  );
}
