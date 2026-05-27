import { env } from "@/lib/env";

interface TopPagesWidgetProps {
  pages: { path: string; views: number }[];
  live: boolean;
}

/**
 * Reichweite (PostHog) — top pages over the last 7 days.
 *
 * This is the primary "site reach" widget. It replaces the previous Plausible
 * iframe embed (Plausible removed in ADR-006). The widget is intentionally
 * extension-friendly: the underlying `getKpis()` already returns server-side
 * aggregates (visits, sources, top pages) from PostHog's HogQL Query API and
 * can be expanded with additional charts (sessions, bounce, country, geo,
 * funnel completion, etc.) without changing this surface.
 */
export function TopPagesWidget({ pages, live }: TopPagesWidgetProps) {
  const max = Math.max(1, ...pages.map((p) => p.views));
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const phHost = env.public.posthogHost.includes("eu")
    ? "https://eu.posthog.com"
    : "https://us.posthog.com";
  const phLink = projectId
    ? `${phHost}/project/${projectId}/web`
    : "https://posthog.com";

  return (
    <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border-soft flex items-center justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.28em] text-text-muted">
            Reichweite
          </p>
          <h3 className="font-display text-xl text-bloom-cream mt-1">
            Meistbesuchte Seiten · 7 Tage
          </h3>
        </div>
        <a
          href={phLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs uppercase tracking-[0.22em] text-bloom-ochre"
        >
          Vollansicht ↗
        </a>
      </div>

      <div className="p-6">
        {pages.length === 0 ? (
          <p className="text-sm text-text-muted">
            Noch keine Seitenaufrufe aufgezeichnet.
          </p>
        ) : (
          <ul className="space-y-3">
            {pages.map((p) => (
              <li key={p.path} className="flex items-center gap-3">
                <span className="w-44 truncate text-sm text-text-secondary">
                  {p.path}
                </span>
                <span className="flex-1 h-1.5 rounded-full bg-bloom-ink overflow-hidden">
                  <span
                    className="block h-full bg-bloom-ochre"
                    style={{ width: `${(p.views / max) * 100}%` }}
                  />
                </span>
                <span className="w-14 text-right text-xs text-text-muted tabular-nums">
                  {p.views.toLocaleString("de-DE")}
                </span>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 text-[0.7rem] uppercase tracking-[0.22em] text-text-muted">
          {live ? "Live · PostHog" : "Demo-Daten"}
        </p>
      </div>
    </div>
  );
}
