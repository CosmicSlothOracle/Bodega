import type { Metadata } from "next";
import { Topbar } from "@/components/dashboard/Topbar";
import { MockBanner } from "@/components/dashboard/MockBanner";
import { getGuests } from "@/server/dashboard/queries";

export const metadata: Metadata = {
  title: "Bloom OS · Gäste",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function GaestePage({ searchParams }: Props) {
  const { q } = await searchParams;
  const guests = await getGuests(q);

  return (
    <>
      <MockBanner />
      <Topbar
        eyebrow="CRM"
        title="Gäste."
        actions={
          <form action="/dashboard/gaeste" className="hidden sm:flex">
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Suche Name oder E-Mail …"
              className="h-10 w-64 px-4 rounded-[var(--radius-input)] bg-surface-card border border-border-soft text-sm text-bloom-cream placeholder:text-text-muted focus:outline-none focus:border-bloom-ochre"
            />
          </form>
        }
      />

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border-soft bg-surface-card">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-[0.62rem] uppercase tracking-[0.22em] text-text-muted border-b border-border-soft">
              <Th>Name</Th>
              <Th>Kontakt</Th>
              <Th>Besuche</Th>
              <Th>Allergien / Präferenzen</Th>
              <Th>Lieblingswein</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {guests.map((g) => (
              <tr
                key={g.id}
                className="border-b border-border-soft last:border-0 hover:bg-surface-hover transition"
              >
                <Td>
                  <span className="text-bloom-cream font-display text-base">
                    {g.first_name} {g.last_name}
                  </span>
                </Td>
                <Td>
                  <div className="text-text-secondary">{g.email}</div>
                  {g.phone ? (
                    <div className="text-xs text-text-muted">{g.phone}</div>
                  ) : null}
                </Td>
                <Td>
                  <span className="font-mono text-bloom-cream tabular-nums">
                    {g.lifetime_visits}
                  </span>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1.5">
                    {g.allergies.map((a) => (
                      <Tag key={a} kind="warn">
                        {a}
                      </Tag>
                    ))}
                    {g.preferences.map((p) => (
                      <Tag key={p}>{p}</Tag>
                    ))}
                    {!g.allergies.length && !g.preferences.length ? (
                      <span className="text-text-muted text-xs">—</span>
                    ) : null}
                  </div>
                </Td>
                <Td>
                  <span className="text-text-secondary">
                    {g.favourite_wine ?? "—"}
                  </span>
                </Td>
                <Td>
                  {g.vip ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.6rem] uppercase tracking-[0.22em] bg-status-vip/15 text-status-vip border border-status-vip/30">
                      ★ VIP
                    </span>
                  ) : (
                    <span className="text-text-muted text-xs">—</span>
                  )}
                </Td>
              </tr>
            ))}
            {guests.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-text-muted">
                  Keine Gäste gefunden.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-5 py-3 font-normal">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-5 py-4 align-top">{children}</td>;
}

function Tag({ children, kind = "default" }: { children: React.ReactNode; kind?: "default" | "warn" }) {
  const cls = kind === "warn"
    ? "bg-status-late/15 text-status-late border-status-late/30"
    : "bg-surface-hover text-text-secondary border-border-strong";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.6rem] uppercase tracking-[0.18em] border ${cls}`}
    >
      {children}
    </span>
  );
}
