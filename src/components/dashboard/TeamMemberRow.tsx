"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { TeamMember } from "@/server/dashboard/team";

interface Props {
  member: TeamMember;
  isSelf: boolean;
}

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  manager: "Manager",
  staff: "Staff",
  marketing: "Marketing",
};

export function TeamMemberRow({ member, isSelf }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/team/${member.user_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error || `Fehler ${res.status}`);
      return false;
    }
    router.refresh();
    return true;
  }

  async function generateTelegram() {
    setBusy(true);
    setError(null);
    setLink(null);
    setCopied(false);
    const res = await fetch("/api/telegram/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: member.user_id }),
    });
    setBusy(false);
    const data = (await res.json().catch(() => ({}))) as {
      link?: string;
      code?: string;
      error?: string;
    };
    if (!res.ok || !data.link) {
      setError(data.error || `Fehler ${res.status} (TELEGRAM_BOT_USERNAME gesetzt?)`);
      return;
    }
    setLink(data.link);
    router.refresh();
  }

  async function unlinkTelegram() {
    if (!confirm(`Telegram-Verknüpfung von ${member.display_name ?? member.email} wirklich trennen?`)) return;
    await patch({ unlinkTelegram: true });
  }

  async function changeRole(role: string) {
    if (role === member.role) return;
    await patch({ role });
  }

  async function rename() {
    const next = prompt("Neuer Anzeigename", member.display_name ?? "");
    if (!next || next.trim() === member.display_name) return;
    await patch({ displayName: next.trim() });
  }

  async function remove() {
    if (
      !confirm(
        `${member.display_name ?? member.email} wirklich aus dem Team entfernen?\n\nDas auth.users-Konto bleibt bestehen — kann jederzeit erneut eingeladen werden.`,
      )
    )
      return;
    setBusy(true);
    const res = await fetch(`/api/team/${member.user_id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error || `Fehler ${res.status}`);
      return;
    }
    router.refresh();
  }

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Kopieren nicht möglich.");
    }
  }

  const tgState: "linked" | "pending" | "none" = member.telegram_chat_id
    ? "linked"
    : member.telegram_invite_code
      ? "pending"
      : "none";

  return (
    <li className="px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-bloom-cream font-medium">
            {member.display_name ?? "(ohne Namen)"}
          </span>
          {isSelf ? (
            <span className="text-[0.55rem] uppercase tracking-[0.2em] text-bloom-ochre border border-bloom-ochre/40 px-2 py-0.5 rounded-full">
              du
            </span>
          ) : null}
          <TelegramBadge state={tgState} />
        </div>
        <div className="text-xs text-text-muted mt-0.5 truncate">
          {member.email ?? "(kein E-Mail-Konto)"}
        </div>

        {link ? (
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-bloom-ochre underline break-all"
            >
              {link}
            </a>
            <button
              type="button"
              onClick={() => copy(link)}
              className="text-[0.55rem] uppercase tracking-[0.2em] text-text-secondary hover:text-bloom-cream"
            >
              {copied ? "Kopiert" : "Kopieren"}
            </button>
          </div>
        ) : null}

        {error ? <p className="text-xs text-status-issue mt-2">{error}</p> : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap shrink-0">
        <select
          className="rounded-[var(--radius-input)] bg-bloom-ink border border-border-soft px-2 py-1.5 text-xs text-bloom-cream focus:outline-none focus:border-bloom-ochre disabled:opacity-50"
          value={member.role}
          onChange={(e) => changeRole(e.target.value)}
          disabled={busy || (isSelf && member.role === "owner")}
          aria-label="Rolle ändern"
        >
          {Object.entries(ROLE_LABEL).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>

        <Button variant="ghost" size="sm" onClick={rename} disabled={busy}>
          Umbenennen
        </Button>

        {tgState === "linked" ? (
          <Button variant="ghost" size="sm" onClick={unlinkTelegram} disabled={busy}>
            Telegram trennen
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={generateTelegram} disabled={busy}>
            {tgState === "pending" ? "Code neu" : "Telegram-Code"}
          </Button>
        )}

        {!isSelf ? (
          <Button variant="ghost" size="sm" onClick={remove} disabled={busy}>
            Entfernen
          </Button>
        ) : null}
      </div>
    </li>
  );
}

function TelegramBadge({ state }: { state: "linked" | "pending" | "none" }) {
  const map = {
    linked: { label: "Telegram verknüpft", cls: "text-status-confirmed border-status-confirmed/30 bg-status-confirmed/10" },
    pending: { label: "Code wartet", cls: "text-bloom-ochre border-bloom-ochre/40 bg-bloom-ochre/10" },
    none: { label: "Kein Telegram", cls: "text-text-muted border-border-soft bg-transparent" },
  } as const;
  const m = map[state];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.55rem] uppercase tracking-[0.2em] border ${m.cls}`}
    >
      {m.label}
    </span>
  );
}
