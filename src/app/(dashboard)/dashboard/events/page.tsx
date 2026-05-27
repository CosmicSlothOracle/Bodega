import type { Metadata } from "next";
import { Topbar } from "@/components/dashboard/Topbar";
import { MockBanner } from "@/components/dashboard/MockBanner";
import { Button } from "@/components/ui/Button";
import { getEvents } from "@/server/dashboard/queries";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Bloom OS · Events",
  robots: { index: false, follow: false },
};

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <>
      <MockBanner />
      <Topbar
        eyebrow="Events"
        title="Bevorstehende Abende."
        actions={
          <Button variant="primary" size="sm">
            + Neues Event
          </Button>
        }
      />

      <ul className="space-y-3">
        {events.map((e) => {
          return (
            <li
              key={e.id}
              className="rounded-[var(--radius-card)] border border-border-soft bg-surface-card hover:bg-surface-hover transition px-6 py-5"
            >
              <div className="grid gap-4 sm:grid-cols-[120px_1fr_auto] items-center">
                <div>
                  <div className="font-mono text-xs uppercase tracking-[0.22em] text-bloom-ochre">
                    {formatDate(e.date, { day: "2-digit", month: "long" })}
                  </div>
                  {e.start_time ? (
                    <div className="text-xs text-text-muted mt-0.5">
                      {e.start_time.slice(0, 5)} Uhr
                    </div>
                  ) : null}
                </div>
                <div>
                  <h3 className="font-display text-2xl text-bloom-cream">
                    {e.title}
                  </h3>
                  {e.description ? (
                    <p className="text-sm text-text-secondary mt-1">
                      {e.description}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                    {e.dj ? <span>DJ: {e.dj}</span> : null}
                    {e.capacity ? <span>Kapazität: {e.capacity}</span> : null}
                    {e.ticket_price ? (
                      <span>Ticket: {e.ticket_price.toFixed(2)} €</span>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={
                      e.published
                        ? "inline-flex items-center px-2.5 py-1 rounded-full text-[0.6rem] uppercase tracking-[0.22em] bg-status-confirmed/15 text-status-confirmed border border-status-confirmed/30"
                        : "inline-flex items-center px-2.5 py-1 rounded-full text-[0.6rem] uppercase tracking-[0.22em] bg-text-muted/10 text-text-muted border border-border-soft"
                    }
                  >
                    {e.published ? "Veröffentlicht" : "Entwurf"}
                  </span>
                  <Button variant="ghost" size="sm">
                    Bearbeiten
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
