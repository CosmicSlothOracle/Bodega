"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface User {
  user_id: string;
  display_name: string;
  role: string;
  chat_id: string | null;
}

interface Props {
  users: User[];
  defaultDate: string;
}

const inputClass =
  "rounded-[var(--radius-input)] bg-bloom-ink border border-border-soft px-3 py-2 text-bloom-cream placeholder:text-text-muted focus:outline-none focus:border-bloom-ochre text-sm";

export function ShiftEditor({ users, defaultDate }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    date: defaultDate,
    startTime: "17:00",
    endTime: "23:30",
    role: "service" as
      | "service"
      | "kitchen"
      | "bar"
      | "host"
      | "manager_on_duty",
    notes: "",
    assignedUserIds: [] as string[],
    published: false,
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function toggleUser(id: string) {
    setForm((p) => ({
      ...p,
      assignedUserIds: p.assignedUserIds.includes(id)
        ? p.assignedUserIds.filter((u) => u !== id)
        : [...p.assignedUserIds, id],
    }));
  }

  async function submit(publish: boolean) {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, published: publish }),
    });
    setBusy(false);
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error || `Fehler ${res.status}`);
      return;
    }
    router.refresh();
    setForm((p) => ({ ...p, notes: "", assignedUserIds: [] }));
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <Field label="Datum">
          <input
            type="date"
            className={inputClass}
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
          />
        </Field>
        <Field label="Beginn">
          <input
            type="time"
            className={inputClass}
            value={form.startTime}
            onChange={(e) => update("startTime", e.target.value)}
          />
        </Field>
        <Field label="Ende">
          <input
            type="time"
            className={inputClass}
            value={form.endTime}
            onChange={(e) => update("endTime", e.target.value)}
          />
        </Field>
        <Field label="Rolle">
          <select
            className={inputClass}
            value={form.role}
            onChange={(e) =>
              update("role", e.target.value as typeof form.role)
            }
          >
            <option value="service">Service</option>
            <option value="kitchen">Küche</option>
            <option value="bar">Bar</option>
            <option value="host">Empfang</option>
            <option value="manager_on_duty">Schichtleitung</option>
          </select>
        </Field>
      </div>

      <Field label="Notiz (optional)">
        <input
          className={inputClass}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="z. B. Großgruppe, Event-Setup"
        />
      </Field>

      <div>
        <span className="block text-[0.65rem] uppercase tracking-[0.22em] text-text-secondary mb-2">
          Zuweisen
        </span>
        {users.length === 0 ? (
          <p className="text-xs text-text-muted">
            Noch keine Bloom-User mit Rolle. Lade Mitarbeiter unter „Einstellungen → Team&ldquo; ein.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {users.map((u) => {
              const active = form.assignedUserIds.includes(u.user_id);
              return (
                <li key={u.user_id}>
                  <button
                    type="button"
                    onClick={() => toggleUser(u.user_id)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition ${
                      active
                        ? "bg-bloom-ochre/20 border-bloom-ochre text-bloom-ochre"
                        : "border-border-soft text-text-secondary hover:text-bloom-cream"
                    }`}
                    title={u.chat_id ? "Telegram verknüpft" : "Kein Telegram — keine Benachrichtigung"}
                  >
                    {u.display_name}
                    {!u.chat_id ? <span className="ml-1 text-text-muted">·</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {error ? <p className="text-sm text-status-issue">{error}</p> : null}

      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => submit(false)}
          disabled={busy}
        >
          Als Entwurf speichern
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={() => submit(true)}
          disabled={busy || form.assignedUserIds.length === 0}
        >
          Speichern &amp; veröffentlichen
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[0.65rem] uppercase tracking-[0.22em] text-text-secondary">
        {label}
      </span>
      {children}
    </label>
  );
}
