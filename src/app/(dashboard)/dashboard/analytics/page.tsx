import type { Metadata } from "next";
import { Topbar } from "@/components/dashboard/Topbar";
import { MockBanner } from "@/components/dashboard/MockBanner";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { AiTrafficWidget } from "@/components/dashboard/AiTrafficWidget";
import { TopPagesWidget } from "@/components/dashboard/TopPagesWidget";
import { getKpis } from "@/server/dashboard/queries";
import { postHogConfigured } from "@/server/analytics/posthog";

export const metadata: Metadata = {
  title: "Bloom OS · Analytics",
  robots: { index: false, follow: false },
};

export default async function AnalyticsPage() {
  const kpis = await getKpis();
  const isLive = postHogConfigured();

  return (
    <>
      <MockBanner />
      <Topbar
        eyebrow="Analytics"
        title="Wie reden Menschen über euch?"
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Besucher heute"
          value={kpis.visitsToday.toLocaleString("de-DE")}
          trend={kpis.visitsTrendPct >= 0 ? "up" : "down"}
          trendLabel={`${kpis.visitsTrendPct >= 0 ? "+" : ""}${kpis.visitsTrendPct}% vs. gestern`}
        />
        <KpiCard
          label="Conversion Rate"
          value={`${kpis.conversionPct}%`}
          hint="Web → Reservierung"
        />
        <KpiCard
          label="Auslastung"
          value={`${kpis.occupancyPct}%`}
          hint="laufende Woche"
        />
        <KpiCard
          label="No-Shows"
          value={kpis.noShowsThisWeek}
          hint="laufende Woche"
        />
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <TopPagesWidget pages={kpis.topPages} live={isLive} />
        <AiTrafficWidget />
      </section>

      <section className="mt-10 rounded-[var(--radius-card)] border border-border-soft bg-surface-card p-6">
        <h3 className="font-display text-xl text-bloom-cream mb-4">Quellen</h3>
        <ul className="space-y-3">
          {kpis.sources.map((s) => (
            <li key={s.label} className="flex items-center gap-3">
              <span className="w-44 text-sm text-text-secondary">{s.label}</span>
              <span className="flex-1 h-1.5 rounded-full bg-bloom-ink overflow-hidden">
                <span
                  className="block h-full bg-bloom-ochre"
                  style={{ width: `${s.share}%` }}
                />
              </span>
              <span className="w-10 text-right text-xs text-text-muted tabular-nums">
                {s.share}%
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
