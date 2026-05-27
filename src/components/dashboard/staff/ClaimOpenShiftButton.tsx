"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ClaimOpenShiftButton({ shiftId }: { shiftId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function claim() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/shifts/open-claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shiftId }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? `Fehler ${res.status}`);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={claim}
        disabled={busy}
        className="rounded-full border border-bloom-ochre/50 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-bloom-ochre transition hover:bg-bloom-ochre/10 disabled:opacity-50"
      >
        {busy ? "Übernimmt ..." : "Übernehmen"}
      </button>
      {error ? <span className="max-w-48 text-right text-xs text-status-issue">{error}</span> : null}
    </div>
  );
}
