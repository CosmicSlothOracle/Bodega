import { serverIntegrations } from "@/lib/env";

/**
 * Renders a small banner at the top of dashboard pages whenever the upstream
 * services aren't configured. Helps the operator understand they're seeing
 * mock data, not live data.
 */
export function MockBanner() {
  const i = serverIntegrations();
  const missing = [
    !i.supabase && "Supabase",
    !i.resend && "Resend",
    !i.telegram && "Telegram",
    !i.twilio && "Twilio (SMS)",
  ].filter(Boolean) as string[];

  if (missing.length === 0) return null;

  return (
    <div className="mb-6 rounded-[var(--radius-input)] border border-status-late/40 bg-status-late/8 px-4 py-3 text-xs uppercase tracking-[0.22em] text-status-late">
      Demo-Modus · folgende Integrationen sind nicht konfiguriert: {missing.join(" · ")}.
      Setze die zugehörigen ENV-Variablen aus <code>.env.example</code>, um auf Live-Daten zu wechseln.
    </div>
  );
}
