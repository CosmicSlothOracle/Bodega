import { Section, Eyebrow } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  className?: string;
}

export function PageHero({ eyebrow, title, intro, className }: PageHeroProps) {
  return (
    <Section
      spacing="lg"
      className={cn(
        "pt-36 sm:pt-44",
        "border-b border-border-soft",
        className,
      )}
    >
      <div className="max-w-3xl">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1 className="mt-6 text-balance">{title}</h1>
        {intro ? <p className="mt-8 text-lg">{intro}</p> : null}
      </div>
    </Section>
  );
}
