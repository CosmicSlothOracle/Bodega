import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Topbar } from "@/components/dashboard/Topbar";
import { MockBanner } from "@/components/dashboard/MockBanner";
import { ShiftEditor } from "@/components/dashboard/ShiftEditor";
import { WeekGridContainer } from "@/components/dashboard/WeekGridContainer";
import { currentUserHasRole } from "@/server/dashboard/team";
import {
  getDefaultWeekTemplate,
  getShiftsForRange,
  listAssignableUsers,
} from "@/server/dashboard/shifts";

// Note: the manager-approval flow was removed with ADR-007 — staff-to-staff
// swaps now auto-finalize when the target accepts (no manager veto). The
// Tauschanfragen sub-page is gone with it.

export const metadata: Metadata = {
  title: "Bloom OS · Schichten",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ from?: string }>;
}

export default async function SchichtenPage({ searchParams }: Props) {
  const allowed = await currentUserHasRole(["owner", "manager"]);
  if (!allowed) redirect("/dashboard");

  const params = await searchParams;
  const from = params.from ?? mondayOf(new Date()).toISOString().slice(0, 10);
  const to = addDaysIso(from, 6);

  const [shifts, users, template] = await Promise.all([
    getShiftsForRange(from, to),
    listAssignableUsers(),
    getDefaultWeekTemplate(),
  ]);

  const days = Array.from({ length: 7 }, (_, i) => addDaysIso(from, i));

  return (
    <>
      <MockBanner />
      <Topbar
        eyebrow="Schichten"
        title={`Woche ab ${formatHumanDate(from)}`}
        actions={
          <div className="flex items-center gap-3">
            <WeekPicker from={from} />
          </div>
        }
      />

      <div className="mb-6 rounded-[var(--radius-card)] border border-border-soft bg-surface-card p-5">
        <h2 className="font-display text-xl text-bloom-cream mb-2">Neue Schicht</h2>
        <p className="text-sm text-text-secondary mb-4">
          Beim Veröffentlichen erhalten alle zugewiesenen Mitarbeiter:innen
          automatisch eine Telegram-Benachrichtigung.
        </p>
        <ShiftEditor users={users} defaultDate={from} />
      </div>

      <WeekGridContainer
        shifts={shifts.map((s) => ({
          id: s.id,
          date: s.date,
          start_time: s.start_time,
          end_time: s.end_time,
          role: s.role,
          notes: s.notes,
          published: s.published,
          assignments: s.assignments.map((a) => ({
            id: a.id,
            user_id: a.user_id,
            display_name: a.display_name ?? null,
          })),
        }))}
        users={users.map((u) => ({
          user_id: u.user_id,
          display_name: u.display_name,
        }))}
        weekDays={days}
        templateExists={Boolean(template)}
        weekStart={from}
      />
    </>
  );
}

function WeekPicker({ from }: { from: string }) {
  const prev = addDaysIso(from, -7);
  const next = addDaysIso(from, 7);
  const today = mondayOf(new Date()).toISOString().slice(0, 10);
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border-soft p-1">
      <Link
        href={`/dashboard/schichten?from=${prev}`}
        className="h-8 w-8 inline-flex items-center justify-center rounded-full text-bloom-cream hover:bg-surface-hover"
      >
        ‹
      </Link>
      <Link
        href={`/dashboard/schichten?from=${today}`}
        className="px-3 h-8 inline-flex items-center text-xs uppercase tracking-[0.22em] text-text-secondary hover:text-bloom-cream"
      >
        Diese Woche
      </Link>
      <Link
        href={`/dashboard/schichten?from=${next}`}
        className="h-8 w-8 inline-flex items-center justify-center rounded-full text-bloom-cream hover:bg-surface-hover"
      >
        ›
      </Link>
    </div>
  );
}

function mondayOf(date: Date) {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const m = new Date(date);
  m.setDate(date.getDate() + diff);
  m.setHours(0, 0, 0, 0);
  return m;
}

function addDaysIso(iso: string, delta: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

function formatHumanDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
  }).format(new Date(y, m - 1, d));
}
