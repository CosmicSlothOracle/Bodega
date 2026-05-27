import type { Metadata } from "next";
import { Topbar } from "@/components/dashboard/Topbar";
import { MockBanner } from "@/components/dashboard/MockBanner";
import { Button } from "@/components/ui/Button";
import { dishBackofficeUrl } from "@/lib/reservation/dish";

export const metadata: Metadata = {
  title: "Bloom OS · Reservierungen",
  robots: { index: false, follow: false },
};

export default function ReservierungenPage() {
  return (
    <>
      <MockBanner />
      <Topbar
        eyebrow="Reservierungen"
        title="Reservierungen & Tische"
      />

      <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-2xl mx-auto space-y-8">
        <div className="h-16 w-16 rounded-full bg-bloom-ochre/10 flex items-center justify-center mb-4">
          <span className="text-2xl text-bloom-ochre">🍽️</span>
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-3xl text-bloom-cream">
            Alle Reservierungen leben in DISH
          </h2>
          <p className="text-text-secondary text-lg leading-relaxed">
            Um Doppelbuchungen zu vermeiden, ist DISH die einzige Quelle der Wahrheit.
            Auch telefonische Buchungen oder Walk-ins müssen direkt im DISH-System eingetragen werden.
          </p>
        </div>

        <div className="pt-4 space-y-4 w-full sm:w-auto">
          <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
            <a
              href={dishBackofficeUrl()}
              target="_blank"
              rel="noopener noreferrer"
            >
              DISH Backoffice öffnen ↗
            </a>
          </Button>
          <p className="text-sm text-text-muted">
            Öffnet sich in einem neuen Tab. Logge dich mit deinen DISH-Zugangsdaten ein.
          </p>
        </div>

        <div className="mt-12 rounded-[var(--radius-card)] border border-border-soft bg-surface-card p-6 w-full text-left">
          <h3 className="text-sm uppercase tracking-[0.22em] text-text-muted mb-4">Warum ist das so?</h3>
          <ul className="space-y-3 text-sm text-text-secondary">
            <li className="flex gap-3">
              <span className="text-bloom-ochre">✓</span>
              Online-Buchungen der Webseite landen direkt in DISH.
            </li>
            <li className="flex gap-3">
              <span className="text-bloom-ochre">✓</span>
              &ldquo;Reserve with Google&rdquo; Buchungen landen direkt in DISH.
            </li>
            <li className="flex gap-3">
              <span className="text-bloom-ochre">✓</span>
              Nur wenn auch Telefonbuchungen in DISH liegen, stimmt die Kapazitätsberechnung und es kommt nie zu Doppelbuchungen.
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
