"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Annehmen/Ablehnen for a swap addressed to the current user. PATCHes
 * `/api/shifts/swap` which delegates to `swapService.acceptSwap/rejectSwap`
 * (same code path as Telegram inline-buttons and the Email magic-link).
 */
export function SwapResponseButtons({ swapId }: { swapId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"accept" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function respond(action: "accept" | "reject") {
    setBusy(action);
    setError(null);
    try {
      const res = await fetch("/api/shifts/swap", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: swapId, action }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => respond("accept")}
          disabled={busy !== null}
          className="flex-1 bg-bloom-ochre text-bloom-ink font-semibold px-4 py-2.5 rounded-[var(--radius-input)] hover:bg-bloom-ochre/90 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
        >
          {busy === "accept" ? "Wird angenommen …" : "✓ Annehmen"}
        </button>
        <button
          type="button"
          onClick={() => respond("reject")}
          disabled={busy !== null}
          className="flex-1 border border-border-soft text-text-secondary px-4 py-2.5 rounded-[var(--radius-input)] hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
        >
          {busy === "reject" ? "Wird abgelehnt …" : "✗ Ablehnen"}
        </button>
      </div>
      {error && (
        <p className="text-xs text-status-issue mt-2">{error}</p>
      )}
    </>
  );
}
