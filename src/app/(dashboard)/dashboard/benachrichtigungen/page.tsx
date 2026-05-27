import type { Metadata } from "next";
import { Topbar } from "@/components/dashboard/Topbar";
import { MockBanner } from "@/components/dashboard/MockBanner";
import { getNotifications } from "@/server/dashboard/queries";

export const metadata: Metadata = {
  title: "Bloom OS · Benachrichtigungen",
  robots: { index: false, follow: false },
};

export default async function NotificationsPage() {
  const items = await getNotifications(50);

  return (
    <>
      <MockBanner />
      <Topbar
        eyebrow="Benachrichtigungen"
        title="Was passiert gerade?"
      />

      <ol className="space-y-3">
        {items.map((n) => (
          <li
            key={n.id}
            className="rounded-[var(--radius-card)] border border-border-soft bg-surface-card px-5 py-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex items-center gap-3">
                {!n.read_at ? (
                  <span className="h-2 w-2 rounded-full bg-bloom-ochre" aria-label="ungelesen" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-border-soft" aria-hidden />
                )}
                <span className="text-bloom-cream">{n.title}</span>
                {n.recipient_role ? (
                  <span className="text-[0.6rem] uppercase tracking-[0.22em] text-text-muted border border-border-soft px-2 py-0.5 rounded-full">
                    {n.recipient_role}
                  </span>
                ) : null}
              </div>
              <span className="text-xs text-text-muted">
                {relativeTime(n.created_at)}
              </span>
            </div>
            {n.body ? (
              <p className="text-sm text-text-secondary mt-2 ml-5">{n.body}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </>
  );
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
