import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Section, Eyebrow } from "@/components/ui/Section";
import { PageHero } from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Bloom OS · Login",
  description: "Anmeldung für Mitarbeitende der Bodega Bühlot.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <>
      <PageHero
        eyebrow="Bloom OS"
        title="Anmeldung."
        intro="Internes Hospitality-Dashboard. Anmeldung per Magic-Link."
      />
      <Section spacing="lg">
        <div className="max-w-md mx-auto">
          <Eyebrow>Login</Eyebrow>
          <div className="mt-6">
            <Suspense
              fallback={
                <p className="text-sm text-text-secondary">Formular wird geladen …</p>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </Section>
    </>
  );
}
