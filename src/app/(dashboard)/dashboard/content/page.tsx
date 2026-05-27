import type { Metadata } from "next";
import Link from "next/link";
import { Topbar } from "@/components/dashboard/Topbar";
import { MockBanner } from "@/components/dashboard/MockBanner";
import { serverIntegrations } from "@/lib/env";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Bloom OS · Inhalte",
  robots: { index: false, follow: false },
};

type Collection = {
  title: string;
  desc: string;
  href: string;
  items: number;
  needsPayload: boolean;
};

const collections: Collection[] = [
  {
    title: "Hero-Slides",
    desc: "Cineastische Slideshow auf der Startseite. 3–6 Bilder ideal.",
    href: "/admin/collections/hero-slides",
    items: 5,
    needsPayload: true,
  },
  {
    title: "Speisekarte",
    desc: "Sektionen, Gerichte, Allergene, Verfügbarkeit.",
    href: "/admin/collections/menu-items",
    items: 23,
    needsPayload: true,
  },
  {
    title: "Events",
    desc: "Live-Musik, Wine Tastings, Themenabende.",
    href: "/dashboard/events",
    items: 3,
    needsPayload: false,
  },
  {
    title: "Galerie",
    desc: "Editorial Bilder mit Alt-Text und Fokuspunkt.",
    href: "/admin/collections/media",
    items: 12,
    needsPayload: true,
  },
  {
    title: "Seiten",
    desc: "Über-uns, Footer-Story, atmosphärische Texte.",
    href: "/admin/collections/pages",
    items: 4,
    needsPayload: true,
  },
];

export default function ContentPage() {
  const integrations = serverIntegrations();
  const payloadActive = integrations.payload;

  return (
    <>
      <MockBanner />
      <Topbar
        eyebrow="Inhalte"
        title="Was steht heute im Schaufenster?"
      />

      {!payloadActive ? (
        <div className="mb-6 rounded-[var(--radius-card)] border border-bloom-ochre/30 bg-bloom-ochre/10 p-4 text-sm text-bloom-cream">
          <strong className="font-medium">Payload CMS noch nicht aktiviert.</strong>{" "}
          Inhalte werden derzeit aus statischen Dateien gerendert
          (<code className="text-text-secondary">src/content/*.ts</code>). Um Hero,
          Speisekarte, Galerie und Seiten redaktionell zu pflegen: Payload v3
          installieren (siehe{" "}
          <code className="text-text-secondary">payload.config.ts</code>) und{" "}
          <code className="text-text-secondary">PAYLOAD_SECRET</code> +{" "}
          <code className="text-text-secondary">DATABASE_URL</code> setzen.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c) => {
          const locked = c.needsPayload && !payloadActive;
          const className =
            "group rounded-[var(--radius-card)] border border-border-soft bg-surface-card p-6 transition" +
            (locked
              ? " opacity-60 cursor-not-allowed"
              : " hover:bg-surface-hover");

          const inner = (
            <>
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="font-display text-2xl text-bloom-cream">
                  {c.title}
                </h3>
                <span className="text-xs uppercase tracking-[0.22em] text-text-muted">
                  {c.items} Einträge
                </span>
              </div>
              <p className="text-sm text-text-secondary">{c.desc}</p>
              <span className="mt-4 inline-block text-xs uppercase tracking-[0.22em] text-bloom-ochre group-hover:text-bloom-cream">
                {locked ? "Payload erforderlich" : "Öffnen →"}
              </span>
            </>
          );

          return locked ? (
            <div key={c.title} className={className} aria-disabled="true">
              {inner}
            </div>
          ) : (
            <Link key={c.title} href={c.href} className={className}>
              {inner}
            </Link>
          );
        })}
      </div>

      <div className="mt-8 pt-8 border-t border-border-soft flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl text-bloom-cream mb-1">Druckansicht (A5)</h3>
          <p className="text-sm text-text-secondary">Speise- und Getränkekarte für den stationären Einsatz drucken.</p>
        </div>
        <Button asChild variant="primary">
          <a href="/print-menu?autoprint=true" target="_blank" rel="noopener noreferrer">
            Karten drucken ↗
          </a>
        </Button>
      </div>

      <p className="mt-8 text-xs text-text-muted">
        Die Bearbeitung läuft über Payload CMS unter{" "}
        <code className="text-text-secondary">/admin</code>. Operative Daten
        (Reservierungen, Gäste, Tische) werden direkt im Bloom Dashboard
        verwaltet, nicht im CMS.
      </p>
    </>
  );
}
