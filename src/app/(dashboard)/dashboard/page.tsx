import type { Metadata } from "next";
import { Topbar } from "@/components/dashboard/Topbar";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { MockBanner } from "@/components/dashboard/MockBanner";
import { AiTrafficWidget } from "@/components/dashboard/AiTrafficWidget";
import { Button } from "@/components/ui/Button";
import { dishBackofficeUrl } from "@/lib/reservation/dish";
import {
  getKpis,
  getNotifications,
} from "@/server/dashboard/queries";
import { getCurrentUserRole } from "@/server/dashboard/team";
import {
  getMyShifts,
  getMyOpenSwaps,
  getSwapsAddressedToMe,
  getOpenShifts,
} from "@/server/shifts/forUser";
import { StaffHome } from "@/components/dashboard/staff/StaffHome";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Bloom OS · Heute",
  robots: { index: false, follow: false },
};

export default async function DashboardHome() {
  const role = await getCurrentUserRole();

  // Staff dashboard
  if (role === "staff") {
    const [shifts, mySwaps, swapsToMe, openShifts, { reservationCount, guestCount }] =
      await Promise.all([
        getMyShifts(),
        getMyOpenSwaps(),
        getSwapsAddressedToMe(),
        getOpenShifts(),
        getTodayOccupancy(),
      ]);

    return (
      <>
        <MockBanner />
        <Topbar
          eyebrow="Meine Schichten"
          title="Heute im Team."
        />
        <StaffHome
          shifts={shifts}
          mySwaps={mySwaps}
          swapsToMe={swapsToMe}
          openShifts={openShifts}
          reservationCount={reservationCount}
          guestCount={guestCount}
        />
      </>
    );
  }

  // Manager/Owner dashboard
  const [kpis, notifications] = await Promise.all([
    getKpis(),
    getNotifications(5),
  ]);

  return (
    <>
      <MockBanner />
      <Topbar
        eyebrow="Heute"
        title={greeting()}
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          label="Auslastung"
          value={`${kpis.occupancyPct}%`}
          trend="up"
          trendLabel="+8% vs. letzte Woche"
        />
        <KpiCard
          label="Conversion Rate"
          value={`${kpis.conversionPct}%`}
          hint="Web → Reservierung"
        />
        <KpiCard
          label="Beliebteste Uhrzeit"
          value={kpis.peakTime}
          hint="diese Woche"
        />
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* DISH CTA replaces timeline */}
        <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface-card p-8 flex flex-col justify-center text-center">
          <div className="h-12 w-12 rounded-full bg-bloom-ochre/10 flex items-center justify-center mx-auto mb-5">
            <span className="text-xl text-bloom-ochre">🍽️</span>
          </div>
          <h2 className="font-display text-2xl text-bloom-cream mb-3">
            Reservierungen & Tische
          </h2>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            Alle Reservierungen — von der Website, Google, Telefon oder Walk-ins —
            werden zentral in DISH verwaltet, um Doppelbuchungen auszuschließen.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild variant="primary">
              <a
                href={dishBackofficeUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
                DISH Backoffice öffnen ↗
              </a>
            </Button>
          </div>
        </div>

        {/* AI traffic + sources */}
        <div className="space-y-6">
          <AiTrafficWidget />

          <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface-card p-6">
            <h3 className="font-display text-xl text-bloom-cream mb-4">Quellen</h3>
            <ul className="space-y-3">
              {kpis.sources.map((s) => (
                <li key={s.label} className="flex items-center gap-3">
                  <span className="w-32 text-sm text-text-secondary">{s.label}</span>
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
          </div>
        </div>
      </section>

      <section className="mt-10">
        <header className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl text-bloom-cream">Aktuelle Hinweise</h2>
          <a
            href="/dashboard/benachrichtigungen"
            className="text-xs uppercase tracking-[0.22em] text-bloom-ochre hover:text-bloom-cream"
          >
            Alle Hinweise →
          </a>
        </header>
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li
              key={n.id}
              className="rounded-[var(--radius-input)] border border-border-soft bg-surface-card px-4 py-3"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-bloom-cream">{n.title}</span>
                <span className="text-xs text-text-muted">{relativeTime(n.created_at)}</span>
              </div>
              {n.body ? (
                <p className="text-sm text-text-secondary mt-1">{n.body}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Guten Morgen.";
  if (h < 17) return "Buenos días.";
  if (h < 22) return "Buenas tardes.";
  return "Buenas noches.";
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "gerade eben";
  if (mins < 60) return `vor ${mins} Min.`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `vor ${hrs} Std.`;
  return `vor ${Math.round(hrs / 24)} Tagen`;
}

async function getTodayOccupancy(): Promise<{
  reservationCount: number;
  guestCount: number;
}> {
  const sb = await supabaseServer();
  if (!sb) return { reservationCount: 0, guestCount: 0 };

  const today = new Date().toISOString().slice(0, 10);

  const { data } = await sb
    .from("reservations")
    .select("party_size")
    .eq("date", today);

  const reservations = data ?? [];
  return {
    reservationCount: reservations.length,
    guestCount: reservations.reduce((sum, r) => sum + (r.party_size ?? 0), 0),
  };
}
