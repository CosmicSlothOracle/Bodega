"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AvailabilityRow {
  id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  note: string | null;
}

interface TimeOffRow {
  id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
}

export function ShiftPreferencesPanel() {
  const router = useRouter();
  const [availability, setAvailability] = useState<AvailabilityRow[]>([]);
  const [timeOff, setTimeOff] = useState<TimeOffRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [availabilityForm, setAvailabilityForm] = useState({
    weekday: 1,
    startTime: "17:00",
    endTime: "23:00",
  });
  const [timeOffForm, setTimeOffForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });

  const load = useCallback(async () => {
    const res = await fetch("/api/shifts/preferences");
    if (!res.ok) return;
    const data = (await res.json()) as {
      availability: AvailabilityRow[];
      timeOff: TimeOffRow[];
    };
    setAvailability(data.availability);
    setTimeOff(data.timeOff);
  }, []);

  useEffect(() => {
    // Initial server sync for this client-only self-service panel.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function addAvailability() {
    setError(null);
    const res = await fetch("/api/shifts/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "availability", ...availabilityForm }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Verfügbarkeit konnte nicht gespeichert werden");
      return;
    }
    await load();
    router.refresh();
  }

  async function addTimeOff() {
    setError(null);
    const res = await fetch("/api/shifts/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "time_off",
        startDate: timeOffForm.startDate,
        endDate: timeOffForm.endDate || timeOffForm.startDate,
        reason: timeOffForm.reason || undefined,
      }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Abwesenheit konnte nicht gespeichert werden");
      return;
    }
    setTimeOffForm({ startDate: "", endDate: "", reason: "" });
    await load();
    router.refresh();
  }

  async function remove(kind: "availability" | "time_off", id: string) {
    await fetch(`/api/shifts/preferences?kind=${kind}&id=${id}`, {
      method: "DELETE",
    });
    await load();
    router.refresh();
  }

  return (
    <section>
      <h3 className="font-display text-xl text-bloom-cream mb-4">
        Verfügbarkeit & Abwesenheit
      </h3>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface-card p-5">
          <p className="mb-3 text-sm text-text-secondary">
            Wann kannst du grundsätzlich eingeplant werden?
          </p>
          <div className="grid grid-cols-3 gap-2">
            <select
              value={availabilityForm.weekday}
              onChange={(e) =>
                setAvailabilityForm((f) => ({ ...f, weekday: Number(e.target.value) }))
              }
              className={inputClass}
            >
              {weekdayLabels.map((label, index) => (
                <option key={label} value={index + 1}>
                  {label}
                </option>
              ))}
            </select>
            <input
              type="time"
              value={availabilityForm.startTime}
              onChange={(e) =>
                setAvailabilityForm((f) => ({ ...f, startTime: e.target.value }))
              }
              className={inputClass}
            />
            <input
              type="time"
              value={availabilityForm.endTime}
              onChange={(e) =>
                setAvailabilityForm((f) => ({ ...f, endTime: e.target.value }))
              }
              className={inputClass}
            />
          </div>
          <button
            type="button"
            onClick={addAvailability}
            className="mt-3 rounded-full border border-border-soft px-4 py-2 text-xs uppercase tracking-[0.18em] text-bloom-cream hover:border-bloom-ochre"
          >
            Verfügbarkeit hinzufügen
          </button>
          <List>
            {availability.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-3">
                <span>
                  {weekdayLabels[row.weekday - 1]} · {row.start_time.slice(0, 5)}–
                  {row.end_time.slice(0, 5)}
                </span>
                <RemoveButton onClick={() => remove("availability", row.id)} />
              </li>
            ))}
          </List>
        </div>

        <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface-card p-5">
          <p className="mb-3 text-sm text-text-secondary">
            Blocke Urlaub, Krankheit oder private Termine.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              type="date"
              value={timeOffForm.startDate}
              onChange={(e) =>
                setTimeOffForm((f) => ({ ...f, startDate: e.target.value }))
              }
              className={inputClass}
            />
            <input
              type="date"
              value={timeOffForm.endDate}
              onChange={(e) =>
                setTimeOffForm((f) => ({ ...f, endDate: e.target.value }))
              }
              className={inputClass}
            />
          </div>
          <input
            value={timeOffForm.reason}
            onChange={(e) =>
              setTimeOffForm((f) => ({ ...f, reason: e.target.value }))
            }
            placeholder="Grund optional"
            className={`${inputClass} mt-2`}
          />
          <button
            type="button"
            onClick={addTimeOff}
            disabled={!timeOffForm.startDate}
            className="mt-3 rounded-full border border-border-soft px-4 py-2 text-xs uppercase tracking-[0.18em] text-bloom-cream hover:border-bloom-ochre disabled:opacity-40"
          >
            Abwesenheit hinzufügen
          </button>
          <List>
            {timeOff.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-3">
                <span>
                  {row.start_date} bis {row.end_date}
                  {row.reason ? ` · ${row.reason}` : ""}
                </span>
                <RemoveButton onClick={() => remove("time_off", row.id)} />
              </li>
            ))}
          </List>
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-status-issue">{error}</p> : null}
    </section>
  );
}

const inputClass =
  "rounded-[var(--radius-input)] border border-border-soft bg-bloom-ink px-3 py-2 text-sm text-bloom-cream focus:border-bloom-ochre focus:outline-none";

const weekdayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function List({ children }: { children: React.ReactNode }) {
  return <ul className="mt-4 space-y-2 text-sm text-text-secondary">{children}</ul>;
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs uppercase tracking-[0.18em] text-status-issue"
    >
      Entfernen
    </button>
  );
}
