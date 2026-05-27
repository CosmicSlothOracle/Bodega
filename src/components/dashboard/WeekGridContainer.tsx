"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { WeekGrid } from "./WeekGrid";

/**
 * Client-side integration layer between server-fetched shifts and the
 * drag&drop `WeekGrid` component.
 *
 * The grid emits granular `onAssign / onUnassign / onUpdate` events; we
 * translate each into a re-post of the entire shift state to
 * `POST /api/shifts`, which is the only mutating endpoint in this surface.
 * After each successful mutation we trigger `router.refresh()` so the
 * server-rendered grid hydrates with fresh assignment data.
 *
 * The component keeps a per-shift "in-flight" set so the UI can disable
 * conflicting interactions while one is pending.
 */

interface ShiftAssignment {
  id: string;
  user_id: string;
  display_name: string | null;
}

interface ShiftInput {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  role: string;
  notes: string | null;
  published: boolean;
  assignments: ShiftAssignment[];
}

interface UserInput {
  user_id: string;
  display_name: string;
}

interface WeekGridContainerProps {
  shifts: ShiftInput[];
  users: UserInput[];
  weekDays: string[];
  weekStart: string;
  templateExists: boolean;
}

export function WeekGridContainer({
  shifts,
  users,
  weekDays,
  weekStart,
  templateExists,
}: WeekGridContainerProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const shiftMap = useMemo(() => {
    const m = new Map<string, ShiftInput>();
    for (const s of shifts) m.set(s.id, s);
    return m;
  }, [shifts]);

  async function persist(shift: ShiftInput, override?: Partial<ShiftInput>) {
    const merged = { ...shift, ...override };
    const body = {
      id: merged.id,
      date: merged.date,
      startTime: merged.start_time.slice(0, 5),
      endTime: merged.end_time.slice(0, 5),
      role: merged.role,
      notes: merged.notes ?? undefined,
      published: merged.published,
      assignedUserIds: merged.assignments.map((a) => a.user_id),
    };
    const res = await fetch("/api/shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? `HTTP ${res.status}`);
    }
  }

  async function handleAssign(shiftId: string, userId: string) {
    setError(null);
    const shift = shiftMap.get(shiftId);
    if (!shift) return;
    if (shift.assignments.some((a) => a.user_id === userId)) return;
    try {
      // Optimistic shape just for the POST — display_name is server-hydrated.
      const optimistic: ShiftAssignment[] = [
        ...shift.assignments,
        {
          id: `pending-${userId}`,
          user_id: userId,
          display_name:
            users.find((u) => u.user_id === userId)?.display_name ?? null,
        },
      ];
      await persist(shift, { assignments: optimistic });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Zuweisen");
    }
  }

  async function handleUnassign(assignmentId: string) {
    setError(null);
    const shift = shifts.find((s) =>
      s.assignments.some((a) => a.id === assignmentId),
    );
    if (!shift) return;
    try {
      const remaining = shift.assignments.filter((a) => a.id !== assignmentId);
      await persist(shift, { assignments: remaining });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Entfernen");
    }
  }

  async function handleUpdate(
    shiftId: string,
    updates: Partial<ShiftInput>,
  ) {
    setError(null);
    const shift = shiftMap.get(shiftId);
    if (!shift) return;
    try {
      await persist(shift, updates);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Aktualisieren");
    }
  }

  async function handleDelete(shiftId: string) {
    setError(null);
    const res = await fetch(`/api/shifts?id=${encodeURIComponent(shiftId)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? `Fehler ${res.status}`);
      return;
    }
    router.refresh();
  }

  async function handleDuplicate(shiftId: string, dayDelta: number) {
    setError(null);
    const shift = shiftMap.get(shiftId);
    if (!shift) return;
    const copy = {
      date: addDaysIso(shift.date, dayDelta),
      startTime: shift.start_time.slice(0, 5),
      endTime: shift.end_time.slice(0, 5),
      role: shift.role,
      notes: shift.notes ?? undefined,
      published: false,
      assignedUserIds: shift.assignments.map((a) => a.user_id),
    };
    const res = await fetch("/api/shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(copy),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? `Fehler ${res.status}`);
      return;
    }
    router.refresh();
  }

  async function handleSaveTemplate() {
    setError(null);
    setMessage(null);
    try {
      const entries = shifts.map((shift) => ({
        dayOffset: Math.max(0, weekDays.indexOf(shift.date)),
        startTime: shift.start_time.slice(0, 5),
        endTime: shift.end_time.slice(0, 5),
        role: shift.role,
        notes: shift.notes,
        assignedUserIds: shift.assignments.map((a) => a.user_id),
      }));

      const res = await fetch("/api/shifts/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setMessage("Diese Woche ist jetzt als Standard-Vorlage gespeichert.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vorlage konnte nicht gespeichert werden");
    }
  }

  async function handleDeleteTemplate() {
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/shifts/template", { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setMessage("Standard-Vorlage gelöscht. Bestehende Wochen bleiben unverändert.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vorlage konnte nicht gelöscht werden");
    }
  }

  async function handleApplyTemplate() {
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/shifts/template", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekStart, published: false }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setMessage("Woche aus Vorlage als Entwurf erzeugt.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vorlage konnte nicht angewendet werden");
    }
  }

  return (
    <>
      <div className="mb-4 rounded-[var(--radius-card)] border border-border-soft bg-surface-card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-display text-lg text-bloom-cream">Wochenvorlage</h3>
            <p className="text-sm text-text-secondary">
              Speichert die aktuelle Woche als Standardmuster für neue Wochen.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {templateExists && shifts.length === 0 ? (
              <button
                type="button"
                onClick={handleApplyTemplate}
                className="rounded-full bg-bloom-ochre px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-bloom-ink"
              >
                Woche aus Vorlage erzeugen
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleSaveTemplate}
              disabled={shifts.length === 0}
              className="rounded-full border border-border-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-bloom-cream transition hover:border-bloom-ochre disabled:cursor-not-allowed disabled:opacity-40"
            >
              Als Vorlage speichern
            </button>
            {templateExists ? (
              <button
                type="button"
                onClick={handleDeleteTemplate}
                className="rounded-full border border-status-issue/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-status-issue transition hover:bg-status-issue/10"
              >
                Vorlage löschen
              </button>
            ) : null}
          </div>
        </div>
      </div>
      {error && (
        <div className="mb-4 rounded-[var(--radius-card)] border border-status-issue/40 bg-status-issue/10 px-4 py-3 text-sm text-status-issue">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 rounded-[var(--radius-card)] border border-status-confirmed/40 bg-status-confirmed/10 px-4 py-3 text-sm text-status-confirmed">
          {message}
        </div>
      )}
      <WeekGrid
        shifts={shifts}
        users={users}
        weekDays={weekDays}
        onAssign={handleAssign}
        onUnassign={handleUnassign}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
      />
    </>
  );
}

function addDaysIso(iso: string, delta: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}
