"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const inputClass =
  "rounded-[var(--radius-input)] bg-bloom-ink border border-border-soft px-3 py-2 text-bloom-cream placeholder:text-text-muted focus:outline-none focus:border-bloom-ochre text-sm";

const ROLE_OPTIONS = [
  { value: "owner",     label: "Owner" },
  { value: "manager",   label: "Manager" },
  { value: "staff",     label: "Staff" },
  { value: "marketing", label: "Marketing" },
] as const;

export function InviteMemberForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    displayName: "",
    role: "staff" as (typeof ROLE_OPTIONS)[number]["value"],
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(null);
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      invited?: boolean;
      error?: string;
    };
    if (!res.ok || !data.ok) {
      setError(data.error || `Fehler ${res.status}`);
      return;
    }
    setSuccess(
      data.invited
        ? `Magic-Link an ${form.email} verschickt. Sobald sie sich einloggen, ist die Rolle aktiv.`
        : `${form.email} hatte bereits ein Konto — Rolle und Name sind aktualisiert.`,
    );
    setForm({ email: "", displayName: "", role: "staff" });
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="E-Mail">
          <input
            required
            type="email"
            className={inputClass}
            placeholder="vorname@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Anzeigename">
          <input
            required
            type="text"
            className={inputClass}
            placeholder="Anna Schmidt"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          />
        </Field>
        <Field label="Rolle">
          <select
            className={inputClass}
            value={form.role}
            onChange={(e) =>
              setForm({
                ...form,
                role: e.target.value as typeof form.role,
              })
            }
          >
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {error ? <p className="text-sm text-status-issue">{error}</p> : null}
      {success ? (
        <p className="text-sm text-status-confirmed">{success}</p>
      ) : null}

      <Button type="submit" variant="primary" size="sm" disabled={busy}>
        {busy ? "Lade ein …" : "Einladung senden"}
      </Button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[0.65rem] uppercase tracking-[0.22em] text-text-secondary">
        {label}
      </span>
      {children}
    </label>
  );
}
