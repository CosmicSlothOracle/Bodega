import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  trend?: "up" | "down" | "flat";
  trendLabel?: string;
  className?: string;
}

export function KpiCard({ label, value, hint, trend, trendLabel, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] bg-surface-card border border-border-soft p-6",
        className,
      )}
    >
      <div className="text-[0.65rem] uppercase tracking-[0.28em] text-text-muted">
        {label}
      </div>
      <div className="mt-3 font-display text-4xl text-bloom-cream tabular-nums">
        {value}
      </div>
      {hint ? <div className="mt-2 text-sm text-text-secondary">{hint}</div> : null}
      {trend ? (
        <div
          className={cn(
            "mt-3 inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em]",
            trend === "up" && "text-status-confirmed",
            trend === "down" && "text-status-issue",
            trend === "flat" && "text-text-muted",
          )}
        >
          <span>
            {trend === "up" ? "▲" : trend === "down" ? "▼" : "·"}
          </span>
          <span>{trendLabel}</span>
        </div>
      ) : null}
    </div>
  );
}
