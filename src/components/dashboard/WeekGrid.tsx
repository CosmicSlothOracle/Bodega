"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

interface Shift {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  role: string;
  notes: string | null;
  published: boolean;
  assignments: Array<{
    id: string;
    display_name: string | null;
    user_id: string;
  }>;
}

interface User {
  user_id: string;
  display_name: string | null;
}

interface WeekGridProps {
  shifts: Shift[];
  users: User[];
  weekDays: string[]; // Array of ISO date strings (7 days)
  onUpdate: (shiftId: string, updates: Partial<Shift>) => Promise<void>;
  onAssign: (shiftId: string, userId: string) => Promise<void>;
  onUnassign: (assignmentId: string) => Promise<void>;
  onDelete: (shiftId: string) => Promise<void>;
  onDuplicate: (shiftId: string, dayDelta: number) => Promise<void>;
}

const drawerInputClass =
  "w-full rounded-[var(--radius-input)] border border-border-soft bg-bloom-ink px-3 py-2 text-sm text-bloom-cream focus:border-bloom-ochre focus:outline-none";

export function WeekGrid({
  shifts,
  users,
  weekDays,
  onUpdate,
  onAssign,
  onUnassign,
  onDelete,
  onDuplicate,
}: WeekGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingShift, setEditingShift] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const hours = Array.from({ length: 17 }, (_, i) => i + 10); // 10:00-02:00 (next day)

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const userId = active.id as string;
    const shiftId = over.id as string;

    // Check for conflicts
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) return;

    const userShiftsOnDate = shifts.filter(
      (s) =>
        s.date === shift.date &&
        s.assignments.some((a) => a.user_id === userId),
    );

    const hasConflict = userShiftsOnDate.some((existing) => {
      const existingStart = timeToMinutes(existing.start_time);
      const existingEnd = timeToMinutes(existing.end_time);
      const newStart = timeToMinutes(shift.start_time);
      const newEnd = timeToMinutes(shift.end_time);

      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });

    if (hasConflict) {
      const userName =
        users.find((u) => u.user_id === userId)?.display_name ?? "Mitarbeiter";
      setConflictWarning(
        `⚠️ ${userName} hat bereits eine überschneidende Schicht an diesem Tag.`,
      );
      setTimeout(() => setConflictWarning(null), 5000);
      return;
    }

    await onAssign(shiftId, userId);
  }

  const activeUser = activeId ? users.find((u) => u.user_id === activeId) : null;
  const editing = editingShift
    ? shifts.find((shift) => shift.id === editingShift) ?? null
    : null;

  return (
    <div className="space-y-6">
      {conflictWarning && (
        <div className="rounded-[var(--radius-card)] border border-status-late bg-status-late/10 p-4 text-status-late">
          {conflictWarning}
        </div>
      )}

      {/* Staff pool */}
      <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface-card p-5">
        <h3 className="font-display text-lg text-bloom-cream mb-4">
          Mitarbeiter
        </h3>
        <div className="flex flex-wrap gap-2">
          {users.map((user) => (
            <DraggableUser key={user.user_id} user={user} />
          ))}
        </div>
      </div>

      {/* Week grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface-card p-5 overflow-x-auto">
          <div className="grid grid-cols-8 gap-4 min-w-[1200px]">
            {/* Header row */}
            <div className="text-xs uppercase tracking-[0.22em] text-text-muted">
              Zeit
            </div>
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-xs uppercase tracking-[0.22em] text-text-muted text-center"
              >
                {formatDayHeader(day)}
              </div>
            ))}

            {/* Hour rows */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="contents"
              >
                <div className="text-sm text-text-secondary py-2">
                  {formatHour(hour)}
                </div>
                {weekDays.map((day) => (
                  <div
                    key={`${day}-${hour}`}
                    className="border border-border-soft/40 rounded-[var(--radius-input)] p-2 min-h-[80px]"
                  >
                    {shifts
                      .filter(
                        (s) =>
                          s.date === day &&
                          timeToHour(s.start_time) === hour,
                      )
                      .map((shift) => (
                        <DroppableShiftCard
                          key={shift.id}
                          shift={shift}
                          onEdit={() => setEditingShift(shift.id)}
                          onUnassign={onUnassign}
                          onTogglePublish={() =>
                            onUpdate(shift.id, { published: !shift.published })
                          }
                        />
                      ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeUser ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bloom-ochre text-bloom-ink text-sm font-medium shadow-lg">
              {activeUser.display_name ?? "Mitarbeiter"}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {editing ? (
        <EditShiftDrawer
          shift={editing}
          users={users}
          onClose={() => setEditingShift(null)}
          onDelete={async () => {
            await onDelete(editing.id);
            setEditingShift(null);
          }}
          onDuplicate={async (dayDelta) => {
            await onDuplicate(editing.id, dayDelta);
            setEditingShift(null);
          }}
          onSave={async (updates) => {
            await onUpdate(editing.id, updates);
            setEditingShift(null);
          }}
        />
      ) : null}
    </div>
  );
}

function DraggableUser({ user }: { user: User }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: user.user_id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-hover border border-border-soft text-bloom-cream text-sm cursor-grab active:cursor-grabbing hover:bg-bloom-ochre/10 transition"
    >
      {user.display_name ?? "Mitarbeiter"}
    </div>
  );
}

function DroppableShiftCard({
  shift,
  onEdit,
  onUnassign,
  onTogglePublish,
}: {
  shift: Shift;
  onEdit: () => void;
  onUnassign: (assignmentId: string) => Promise<void>;
  onTogglePublish: () => Promise<void>;
}) {
  const { setNodeRef } = useSortable({ id: shift.id });
  const duration = Math.max(
    45,
    ((timeToMinutes(shift.end_time) - timeToMinutes(shift.start_time) + 1440) %
      1440 || 60) * 0.75,
  );

  return (
    <div
      ref={setNodeRef}
      style={{ minHeight: `${duration}px` }}
      className="rounded-[var(--radius-input)] border border-border-soft bg-bloom-ink/60 p-2 mb-2 cursor-pointer hover:bg-bloom-ink/80 transition"
      onClick={onEdit}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="text-xs font-mono text-bloom-ochre">
          {shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePublish();
          }}
          className={`text-[0.5rem] uppercase tracking-[0.2em] ${
            shift.published ? "text-status-confirmed" : "text-text-muted"
          }`}
        >
          {shift.published ? "live" : "entwurf"}
        </button>
      </div>
      <div className="text-xs text-text-secondary mb-1">{labelRole(shift.role)}</div>
      {shift.assignments.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {shift.assignments.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-hover text-[0.65rem] text-bloom-cream"
              onClick={(e) => e.stopPropagation()}
            >
              {a.display_name}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUnassign(a.id);
                }}
                className="hover:text-status-late"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function EditShiftDrawer({
  shift,
  users,
  onClose,
  onDelete,
  onDuplicate,
  onSave,
}: {
  shift: Shift;
  users: User[];
  onClose: () => void;
  onDelete: () => Promise<void>;
  onDuplicate: (dayDelta: number) => Promise<void>;
  onSave: (updates: Partial<Shift>) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    date: shift.date,
    start_time: shift.start_time.slice(0, 5),
    end_time: shift.end_time.slice(0, 5),
    role: shift.role,
    notes: shift.notes ?? "",
    published: shift.published,
    assignedUserIds: shift.assignments.map((a) => a.user_id),
  });

  function toggleUser(userId: string) {
    setForm((current) => ({
      ...current,
      assignedUserIds: current.assignedUserIds.includes(userId)
        ? current.assignedUserIds.filter((id) => id !== userId)
        : [...current.assignedUserIds, userId],
    }));
  }

  async function submit() {
    setBusy(true);
    await onSave({
      date: form.date,
      start_time: form.start_time,
      end_time: form.end_time,
      role: form.role,
      notes: form.notes.trim() || null,
      published: form.published,
      assignments: form.assignedUserIds.map((userId) => {
        const existing = shift.assignments.find((a) => a.user_id === userId);
        return {
          id: existing?.id ?? `pending-${userId}`,
          user_id: userId,
          display_name:
            users.find((user) => user.user_id === userId)?.display_name ?? null,
        };
      }),
    });
    setBusy(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-bloom-ink/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="shift-edit-title"
        className="ml-auto flex h-full w-full max-w-xl flex-col border-l border-border-soft bg-surface-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.22em] text-text-secondary">
              Inline bearbeiten
            </p>
            <h3 id="shift-edit-title" className="font-display text-2xl text-bloom-cream">
              {labelRole(shift.role)}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border-soft px-3 py-1 text-sm text-text-secondary hover:text-bloom-cream"
          >
            Schließen
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <DrawerField label="Datum">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className={drawerInputClass}
            />
          </DrawerField>
          <DrawerField label="Rolle">
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className={drawerInputClass}
            >
              <option value="service">Service</option>
              <option value="kitchen">Küche</option>
              <option value="bar">Bar</option>
              <option value="host">Empfang</option>
              <option value="manager_on_duty">Schichtleitung</option>
            </select>
          </DrawerField>
          <DrawerField label="Beginn">
            <input
              type="time"
              value={form.start_time}
              onChange={(e) =>
                setForm((f) => ({ ...f, start_time: e.target.value }))
              }
              className={drawerInputClass}
            />
          </DrawerField>
          <DrawerField label="Ende">
            <input
              type="time"
              value={form.end_time}
              onChange={(e) =>
                setForm((f) => ({ ...f, end_time: e.target.value }))
              }
              className={drawerInputClass}
            />
          </DrawerField>
        </div>

        <DrawerField label="Notiz">
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={3}
            className={`${drawerInputClass} resize-none`}
            placeholder="z. B. Großgruppe, Event, Setup-Hinweis"
          />
        </DrawerField>

        <div className="mt-4">
          <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.22em] text-text-secondary">
            Team
          </span>
          <div className="flex flex-wrap gap-2">
            {users.map((user) => {
              const selected = form.assignedUserIds.includes(user.user_id);
              return (
                <button
                  key={user.user_id}
                  type="button"
                  onClick={() => toggleUser(user.user_id)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    selected
                      ? "border-bloom-ochre bg-bloom-ochre/20 text-bloom-ochre"
                      : "border-border-soft text-text-secondary hover:text-bloom-cream"
                  }`}
                >
                  {user.display_name ?? "Mitarbeiter"}
                </button>
              );
            })}
          </div>
        </div>

        <label className="mt-5 flex items-center gap-3 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) =>
              setForm((f) => ({ ...f, published: e.target.checked }))
            }
            className="h-4 w-4 accent-bloom-ochre"
          />
          Veröffentlicht
        </label>

        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="rounded-full bg-bloom-ochre px-5 py-2.5 text-sm font-semibold text-bloom-ink disabled:opacity-50"
          >
            {busy ? "Speichert ..." : "Änderungen speichern"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border-soft px-5 py-2.5 text-sm text-bloom-cream"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(0)}
            className="rounded-full border border-border-soft px-5 py-2.5 text-sm text-bloom-cream"
          >
            Duplizieren
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(1)}
            className="rounded-full border border-border-soft px-5 py-2.5 text-sm text-bloom-cream"
          >
            Auf nächsten Tag kopieren
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full border border-status-issue/40 px-5 py-2.5 text-sm text-status-issue"
          >
            Löschen
          </button>
        </div>
      </aside>
    </div>
  );
}

function DrawerField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mt-4 flex flex-col gap-1">
      <span className="text-[0.65rem] uppercase tracking-[0.22em] text-text-secondary">
        {label}
      </span>
      {children}
    </label>
  );
}

function formatDayHeader(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = new Intl.DateTimeFormat("de-DE", { weekday: "short" }).format(date);
  return `${day} ${d}.${m}.`;
}

function formatHour(hour: number) {
  if (hour < 24) return `${String(hour).padStart(2, "0")}:00`;
  return `${String(hour - 24).padStart(2, "0")}:00`;
}

function timeToHour(time: string): number {
  const [h] = time.split(":").map(Number);
  return h;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function labelRole(role: string) {
  return (
    {
      service: "Service",
      kitchen: "Küche",
      bar: "Bar",
      host: "Empfang",
      manager_on_duty: "Schichtleitung",
    }[role] ?? role
  );
}
