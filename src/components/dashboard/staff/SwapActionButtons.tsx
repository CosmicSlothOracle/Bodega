"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * "Tauschen" / "Übernehmen" launcher for a single shift assignment.
 *
 * - Renders one button per allowed `kind`.
 * - Click opens a modal with target-teammate picker.
 * - For `kind = "exchange"` the modal then loads the teammate's published
 *   shifts (filtered to the same role) and the user picks one.
 * - For `kind = "takeover"` no target shift is needed.
 * - Submit POSTs to `/api/shifts/swap`, which dispatches notifications via
 *   Telegram inline-buttons + Email magic-link.
 */

type Kind = "exchange" | "takeover";

interface ShiftSummary {
  date: string;
  start_time: string;
  end_time: string;
  role: string;
}

interface SwapActionButtonsProps {
  assignmentId: string;
  shift: ShiftSummary;
  kinds: Kind[];
  variant?: "primary" | "compact";
}

interface TeamMember {
  user_id: string;
  display_name: string | null;
  role: string;
}

interface TargetShift {
  assignment_id: string;
  date: string;
  start_time: string;
  end_time: string;
  role: string;
}

export function SwapActionButtons({
  assignmentId,
  shift,
  kinds,
  variant = "primary",
}: SwapActionButtonsProps) {
  const [openKind, setOpenKind] = useState<Kind | null>(null);

  const primaryBtn =
    "text-xs uppercase tracking-[0.22em] text-bloom-ochre hover:text-bloom-cream px-3 py-2 rounded-[var(--radius-input)] border border-border-soft hover:bg-surface-hover transition";
  const compactBtn =
    "text-xs uppercase tracking-[0.22em] text-text-muted hover:text-bloom-ochre transition";
  const btnClass = variant === "primary" ? primaryBtn : compactBtn;

  return (
    <>
      <div className="flex gap-2">
        {kinds.includes("exchange") && (
          <button
            type="button"
            onClick={() => setOpenKind("exchange")}
            className={btnClass}
          >
            Tauschen
          </button>
        )}
        {kinds.includes("takeover") && (
          <button
            type="button"
            onClick={() => setOpenKind("takeover")}
            className={btnClass}
          >
            Übernehmen
          </button>
        )}
      </div>
      {openKind && (
        <SwapWizard
          kind={openKind}
          assignmentId={assignmentId}
          shift={shift}
          onClose={() => setOpenKind(null)}
        />
      )}
    </>
  );
}

interface WizardProps {
  kind: Kind;
  assignmentId: string;
  shift: ShiftSummary;
  onClose: () => void;
}

function SwapWizard({ kind, assignmentId, shift, onClose }: WizardProps) {
  const router = useRouter();

  const [members, setMembers] = useState<TeamMember[] | null>(null);
  const [membersError, setMembersError] = useState<string | null>(null);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [targetShifts, setTargetShifts] = useState<TargetShift[] | null>(null);
  const [targetError, setTargetError] = useState<string | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load team members on mount.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/team")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as { members: TeamMember[] };
      })
      .then((data) => {
        if (!cancelled) setMembers(data.members);
      })
      .catch((err) => {
        if (!cancelled)
          setMembersError(err instanceof Error ? err.message : "Fehler");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // For exchange: when teammate is picked, fetch their shifts (same role).
  useEffect(() => {
    if (kind !== "exchange" || !selectedUserId) {
      setTargetShifts(null);
      setSelectedTargetId(null);
      return;
    }
    let cancelled = false;
    setTargetShifts(null);
    setTargetError(null);
    setSelectedTargetId(null);
    const url = `/api/team/${selectedUserId}/shifts?role=${encodeURIComponent(shift.role)}`;
    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as { shifts: TargetShift[] };
      })
      .then((data) => {
        if (!cancelled) setTargetShifts(data.shifts);
      })
      .catch((err) => {
        if (!cancelled)
          setTargetError(err instanceof Error ? err.message : "Fehler");
      });
    return () => {
      cancelled = true;
    };
  }, [kind, selectedUserId, shift.role]);

  const canSubmit =
    !submitting &&
    selectedUserId !== null &&
    (kind === "takeover" || selectedTargetId !== null);

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/shifts/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          requesterAssignmentId: assignmentId,
          targetUserId: selectedUserId,
          targetAssignmentId: selectedTargetId ?? undefined,
          reason: reason.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      router.refresh();
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unbekannter Fehler");
      setSubmitting(false);
    }
  }

  const title = kind === "exchange" ? "Schicht tauschen" : "Schicht abgeben";
  const cta =
    kind === "exchange" ? "Tausch-Anfrage senden" : "Übernahme anfragen";

  return (
    <div
      className="fixed inset-0 bg-bloom-ink/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="rounded-[var(--radius-card)] border border-border-soft bg-surface-card p-6 max-w-lg w-full my-8"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="swap-wizard-title"
      >
        <header className="mb-5">
          <div className="text-xs uppercase tracking-[0.22em] text-text-muted">
            {labelRole(shift.role)} · {formatShort(shift.date)} ·{" "}
            {shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)}
          </div>
          <h2
            id="swap-wizard-title"
            className="font-display text-2xl text-bloom-cream mt-1"
          >
            {title}
          </h2>
        </header>

        {/* Step 1: pick teammate */}
        <fieldset className="mb-5">
          <legend className="text-xs uppercase tracking-[0.22em] text-text-secondary mb-2">
            {kind === "exchange"
              ? "Mit wem möchtest du tauschen?"
              : "Wer soll deine Schicht übernehmen?"}
          </legend>
          {membersError ? (
            <p className="text-sm text-status-issue">
              Team konnte nicht geladen werden: {membersError}
            </p>
          ) : members === null ? (
            <p className="text-sm text-text-muted">Lade Team …</p>
          ) : members.length === 0 ? (
            <p className="text-sm text-text-muted">Keine Kolleg:innen verfügbar.</p>
          ) : (
            <select
              value={selectedUserId ?? ""}
              onChange={(e) => setSelectedUserId(e.target.value || null)}
              className="w-full rounded-[var(--radius-input)] bg-bloom-ink border border-border-soft px-3 py-2.5 text-sm text-bloom-cream focus:outline-none focus:border-bloom-ochre"
            >
              <option value="">— Kolleg:in auswählen —</option>
              {members.map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {m.display_name ?? "Unbekannt"} · {labelRole(m.role)}
                </option>
              ))}
            </select>
          )}
        </fieldset>

        {/* Step 2 (exchange only): pick their shift */}
        {kind === "exchange" && selectedUserId && (
          <fieldset className="mb-5">
            <legend className="text-xs uppercase tracking-[0.22em] text-text-secondary mb-2">
              Welche {labelRole(shift.role)}-Schicht möchtest du dafür übernehmen?
            </legend>
            {targetError ? (
              <p className="text-sm text-status-issue">{targetError}</p>
            ) : targetShifts === null ? (
              <p className="text-sm text-text-muted">Lade Schichten …</p>
            ) : targetShifts.length === 0 ? (
              <p className="text-sm text-text-muted">
                Diese Kolleg:in hat keine {labelRole(shift.role)}-Schichten in
                der Zukunft.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {targetShifts.map((s) => {
                  const checked = selectedTargetId === s.assignment_id;
                  return (
                    <label
                      key={s.assignment_id}
                      className={`flex items-center gap-3 rounded-[var(--radius-input)] border px-3 py-2.5 cursor-pointer transition ${
                        checked
                          ? "border-bloom-ochre bg-bloom-ochre/10"
                          : "border-border-soft hover:bg-surface-hover"
                      }`}
                    >
                      <input
                        type="radio"
                        name="target-shift"
                        value={s.assignment_id}
                        checked={checked}
                        onChange={() => setSelectedTargetId(s.assignment_id)}
                        className="accent-bloom-ochre"
                      />
                      <span className="text-sm text-bloom-cream">
                        {formatShort(s.date)} ·{" "}
                        {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </fieldset>
        )}

        {/* Optional reason */}
        <fieldset className="mb-6">
          <label
            htmlFor="swap-reason"
            className="block text-xs uppercase tracking-[0.22em] text-text-secondary mb-2"
          >
            Grund (optional)
          </label>
          <textarea
            id="swap-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="z. B. Familientermin, kurzfristig krank …"
            className="w-full rounded-[var(--radius-input)] bg-bloom-ink border border-border-soft px-3 py-2.5 text-sm text-bloom-cream placeholder:text-text-muted focus:outline-none focus:border-bloom-ochre"
          />
        </fieldset>

        {submitError && (
          <p className="text-sm text-status-issue mb-4">{submitError}</p>
        )}

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-xs uppercase tracking-[0.22em] text-text-secondary hover:text-bloom-cream px-4 py-2.5 rounded-[var(--radius-input)] border border-border-soft hover:bg-surface-hover transition"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="bg-bloom-ochre text-bloom-ink font-semibold px-5 py-2.5 rounded-[var(--radius-input)] hover:bg-bloom-ochre/90 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
          >
            {submitting ? "Wird gesendet …" : cta}
          </button>
        </div>
      </div>
    </div>
  );
}

function labelRole(role: string) {
  return (
    {
      service: "Service",
      kitchen: "Küche",
      bar: "Bar",
      host: "Empfang",
      manager_on_duty: "Schichtleitung",
      owner: "Owner",
      manager: "Manager",
      staff: "Service",
      marketing: "Marketing",
    }[role] ?? role
  );
}

function formatShort(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short",
  }).format(new Date(y, m - 1, d));
}
