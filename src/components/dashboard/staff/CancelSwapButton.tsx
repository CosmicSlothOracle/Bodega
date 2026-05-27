"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Cancels a swap request the current user initiated. Only allowed while the
 * swap is still `pending` (the API also enforces requester-only).
 */
export function CancelSwapButton({ swapId }: { swapId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    if (busy) return;
    if (
      !window.confirm("Diese Tauschanfrage wirklich abbrechen?")
    )
      return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/shifts/swap", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: swapId, action: "cancel" }),
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
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={cancel}
      disabled={busy}
      title={error ?? undefined}
      className="text-xs uppercase tracking-[0.22em] text-text-muted hover:text-status-late disabled:opacity-50 transition"
    >
      {busy ? "Brich ab …" : "Abbrechen"}
    </button>
  );
}
