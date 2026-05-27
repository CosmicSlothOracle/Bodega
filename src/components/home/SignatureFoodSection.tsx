import Link from "next/link";
import { Section, Eyebrow } from "@/components/ui/Section";
import { Card, CardBody, CardEyebrow, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { signatureFood } from "@/content/home";

export function SignatureFoodSection() {
  return (
    <Section spacing="lg">
      <div className="max-w-3xl">
        <Eyebrow>{signatureFood.eyebrow}</Eyebrow>
        <h2 className="mt-6 text-balance">{signatureFood.headline}</h2>
        <p className="mt-8 text-lg">{signatureFood.intro}</p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {signatureFood.dishes.map((d) => (
          <Card key={d.name} className="h-full">
            <CardBody>
              <CardEyebrow>{d.tag}</CardEyebrow>
              <CardTitle>{d.name}</CardTitle>
              <p className="mt-4 text-sm leading-relaxed">{d.desc}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="mt-14">
        <Button asChild variant="secondary">
          <Link href="/speisekarte">Vollständige Speisekarte</Link>
        </Button>
      </div>
    </Section>
  );
}
