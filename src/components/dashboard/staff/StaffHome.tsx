import type { OpenShift, UserShift, UserSwap } from "@/server/shifts/forUser";
import { SwapActionButtons } from "./SwapActionButtons";
import { SwapResponseButtons } from "./SwapResponseButtons";
import { CancelSwapButton } from "./CancelSwapButton";
import { ClaimOpenShiftButton } from "./ClaimOpenShiftButton";
import { ShiftPreferencesPanel } from "./ShiftPreferencesPanel";

interface StaffHomeProps {
  shifts: UserShift[];
  mySwaps: UserSwap[];
  swapsToMe: UserSwap[];
  openShifts: OpenShift[];
  reservationCount: number;
  guestCount: number;
}

export function StaffHome({
  shifts,
  mySwaps,
  swapsToMe,
  openShifts,
  reservationCount,
  guestCount,
}: StaffHomeProps) {
  const today = new Date().toISOString().slice(0, 10);
  const todayShift = shifts.find((s) => s.date === today);
  const upcomingShifts = shifts.filter((s) => s.date > today).slice(0, 7);

  return (
    <div className="space-y-8">
      {/* Today's shift above the fold */}
      <section>
        <h2 className="font-display text-3xl text-bloom-cream mb-6">
          {greeting()}
        </h2>

        {todayShift ? (
          <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-text-muted mb-2">
                  Deine Schicht heute
                </div>
                <div className="font-display text-2xl text-bloom-cream">
                  {todayShift.start_time.slice(0, 5)}–
                  {todayShift.end_time.slice(0, 5)} Uhr
                </div>
                <div className="text-text-secondary mt-1">
                  {labelRole(todayShift.role)}
                </div>
              </div>
              {canRequestSwap(todayShift.date, todayShift.start_time) && (
                <SwapActionButtons
                  assignmentId={todayShift.assignment_id}
                  shift={{
                    date: todayShift.date,
                    start_time: todayShift.start_time,
                    end_time: todayShift.end_time,
                    role: todayShift.role,
                  }}
                  kinds={["exchange", "takeover"]}
                />
              )}
            </div>
            {todayShift.notes && (
              <p className="text-sm text-text-secondary">{todayShift.notes}</p>
            )}
          </div>
        ) : (
          <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface-card p-6 text-center">
            <p className="text-text-secondary">
              Heute ist schichtfrei — genieß den Tag.
            </p>
          </div>
        )}
      </section>

      {openShifts.length > 0 ? (
        <section>
          <h3 className="font-display text-xl text-bloom-cream mb-4">
            Offene Schichten
          </h3>
          <div className="space-y-2">
            {openShifts.map((shift) => (
              <div
                key={shift.id}
                className="rounded-[var(--radius-input)] border border-bloom-ochre/30 bg-bloom-ochre/5 px-4 py-3 flex items-center justify-between gap-4"
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <div className="text-sm font-mono text-bloom-ochre tabular-nums">
                    {formatShort(shift.date)}
                  </div>
                  <div className="text-sm text-bloom-cream">
                    {shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)} Uhr
                  </div>
                  <div className="text-sm text-text-secondary">
                    {labelRole(shift.role)}
                  </div>
                  {shift.notes ? (
                    <div className="text-xs text-text-muted">{shift.notes}</div>
                  ) : null}
                </div>
                <ClaimOpenShiftButton shiftId={shift.id} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Swap requests addressed to me */}
      {swapsToMe.length > 0 && (
        <section>
          <h3 className="font-display text-xl text-bloom-cream mb-4 flex items-center gap-3">
            Tauschanfragen an dich
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-bloom-ochre/20 text-bloom-ochre text-xs font-mono">
              {swapsToMe.length}
            </span>
          </h3>
          <div className="space-y-3">
            {swapsToMe.map((swap) => (
              <div
                key={swap.id}
                className="rounded-[var(--radius-card)] border border-border-soft bg-surface-card p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm text-bloom-cream mb-1">
                      <strong>{swap.requester_name ?? "Kollege"}</strong>{" "}
                      {swap.kind === "exchange"
                        ? "möchte Schichten tauschen"
                        : "bittet um Übernahme"}
                    </div>
                    <div className="text-xs text-text-muted">
                      {formatRelativeTime(swap.created_at)} • Läuft ab{" "}
                      {formatRelativeTime(swap.expires_at)}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-text-muted mb-2">
                      {swap.kind === "exchange"
                        ? "Schicht von " + swap.requester_name
                        : "Zu übernehmende Schicht"}
                    </div>
                    <div className="text-sm text-bloom-cream">
                      {formatShort(swap.requester_shift.date)}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {swap.requester_shift.start_time.slice(0, 5)}–
                      {swap.requester_shift.end_time.slice(0, 5)} ·{" "}
                      {labelRole(swap.requester_shift.role)}
                    </div>
                  </div>

                  {swap.target_shift && (
                    <div>
                      <div className="text-xs uppercase tracking-[0.22em] text-text-muted mb-2">
                        Deine Schicht
                      </div>
                      <div className="text-sm text-bloom-cream">
                        {formatShort(swap.target_shift.date)}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {swap.target_shift.start_time.slice(0, 5)}–
                        {swap.target_shift.end_time.slice(0, 5)} ·{" "}
                        {labelRole(swap.target_shift.role)}
                      </div>
                    </div>
                  )}
                </div>

                {swap.reason && (
                  <p className="text-sm text-text-secondary mb-4">
                    &ldquo;{swap.reason}&rdquo;
                  </p>
                )}

                <SwapResponseButtons swapId={swap.id} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming shifts */}
      <section>
        <h3 className="font-display text-xl text-bloom-cream mb-4">
          Kommende Schichten
        </h3>
        {upcomingShifts.length > 0 ? (
          <div className="space-y-2">
            {upcomingShifts.map((shift) => (
              <div
                key={shift.id}
                className="rounded-[var(--radius-input)] border border-border-soft bg-surface-card px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="text-sm font-mono text-bloom-ochre tabular-nums">
                    {formatShort(shift.date)}
                  </div>
                  <div className="text-sm text-bloom-cream">
                    {shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)}{" "}
                    Uhr
                  </div>
                  <div className="text-sm text-text-secondary">
                    {labelRole(shift.role)}
                  </div>
                </div>
                {canRequestSwap(shift.date, shift.start_time) && (
                  <SwapActionButtons
                    assignmentId={shift.assignment_id}
                    shift={{
                      date: shift.date,
                      start_time: shift.start_time,
                      end_time: shift.end_time,
                      role: shift.role,
                    }}
                    kinds={["exchange", "takeover"]}
                    variant="compact"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-sm">
            Keine weiteren Schichten geplant.
          </p>
        )}
      </section>

      {/* My open swap requests */}
      {mySwaps.length > 0 && (
        <section>
          <h3 className="font-display text-xl text-bloom-cream mb-4">
            Meine Anfragen
          </h3>
          <div className="space-y-2">
            {mySwaps.map((swap) => (
              <div
                key={swap.id}
                className="rounded-[var(--radius-input)] border border-border-soft bg-surface-card px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-bloom-cream">
                      {swap.kind === "exchange" ? "Tausch" : "Übernahme"} mit{" "}
                      <strong>{swap.target_name ?? "..."}</strong>
                    </div>
                    <div className="text-xs text-text-muted">
                      · {formatShort(swap.requester_shift.date)}{" "}
                      {swap.requester_shift.start_time.slice(0, 5)}–
                      {swap.requester_shift.end_time.slice(0, 5)}
                    </div>
                  </div>
                  <CancelSwapButton swapId={swap.id} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <ShiftPreferencesPanel />

      {/* Today's occupancy */}
      <section>
        <h3 className="font-display text-xl text-bloom-cream mb-4">
          Auslastung heute
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface-card p-5 text-center">
            <div className="text-3xl font-display text-bloom-cream mb-1">
              {reservationCount}
            </div>
            <div className="text-xs uppercase tracking-[0.22em] text-text-muted">
              Reservierungen
            </div>
          </div>
          <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface-card p-5 text-center">
            <div className="text-3xl font-display text-bloom-cream mb-1">
              {guestCount}
            </div>
            <div className="text-xs uppercase tracking-[0.22em] text-text-muted">
              Gäste
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Guten Morgen.";
  if (h < 17) return "Buenos días.";
  if (h < 22) return "Buenas tardes.";
  return "Buenas noches.";
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

function formatShort(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short",
  }).format(new Date(y, m - 1, d));
}

function formatRelativeTime(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  const absDiff = Math.abs(diff);
  const mins = Math.round(absDiff / 60000);
  const past = diff < 0;

  if (mins < 1) return "gerade eben";
  if (mins < 60) return past ? `vor ${mins} Min.` : `in ${mins} Min.`;

  const hrs = Math.round(mins / 60);
  if (hrs < 24) return past ? `vor ${hrs} Std.` : `in ${hrs} Std.`;

  const days = Math.round(hrs / 24);
  return past ? `vor ${days} Tagen` : `in ${days} Tagen`;
}

function canRequestSwap(date: string, startTime: string): boolean {
  const shiftStart = new Date(`${date}T${startTime}`);
  const now = new Date();
  const hoursUntil = (shiftStart.getTime() - now.getTime()) / 3600000;
  return hoursUntil >= 24;
}
