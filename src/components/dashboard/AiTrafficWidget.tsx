import { getAiTraffic } from "@/server/dashboard/queries";

export function AiTrafficWidget() {
  const ai = getAiTraffic();
  return (
    <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.28em] text-text-muted">
            AI / LLM Traffic
          </p>
          <h3 className="font-display text-3xl text-bloom-cream mt-1">
            {ai.share}%
          </h3>
        </div>
        <span className="text-xs uppercase tracking-[0.22em] text-bloom-ochre border border-bloom-ochre/40 px-3 py-1 rounded-full">
          Top: {ai.top}
        </span>
      </div>

      <ul className="space-y-2 mb-5">
        {ai.llms.map((l) => (
          <li key={l.name} className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">{l.name}</span>
            <span className="text-bloom-cream tabular-nums">{l.sessions}</span>
          </li>
        ))}
      </ul>

      <div className="border-t border-border-soft pt-4">
        <p className="text-xs uppercase tracking-[0.22em] text-text-muted mb-2">
          Meistgenannte Seiten
        </p>
        <ul className="space-y-1.5 text-sm">
          {ai.pages.map((p) => (
            <li key={p.path} className="flex justify-between">
              <span className="text-text-secondary">{p.path}</span>
              <span className="text-text-muted tabular-nums">{p.share}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
