import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Topbar } from "@/components/dashboard/Topbar";
import { MockBanner } from "@/components/dashboard/MockBanner";
import { InviteMemberForm } from "@/components/dashboard/InviteMemberForm";
import { TeamMemberRow } from "@/components/dashboard/TeamMemberRow";
import { serverIntegrations } from "@/lib/env";
import { site } from "@/lib/site";
import { getCurrentUserRole, getTeamMembers } from "@/server/dashboard/team";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Bloom OS · Einstellungen",
  robots: { index: false, follow: false },
};

const ROLES = [
  { id: "owner",     label: "Owner",     desc: "Vollzugriff. Rollen, Integrationen, alles." },
  { id: "manager",   label: "Manager",   desc: "Reservierungen, Gäste, Events, Inhalte, Schichten." },
  { id: "staff",     label: "Staff",     desc: "Tagesbetrieb, eigene Schichten, Tauschanträge." },
  { id: "marketing", label: "Marketing", desc: "Inhalte, Galerie, Analytics." },
];

export default async function SettingsPage() {
  const integrations = serverIntegrations();
  const role = await getCurrentUserRole();
  const isOwner = role === "owner";

  // Non-owners may view their integrations and roles overview, but never
  // the team-management surface — gate it here in addition to the API
  // checks so we don't accidentally leak member emails.
  if (role !== null && role !== "owner") {
    redirect("/dashboard");
  }

  const members = isOwner ? await getTeamMembers() : [];
  const sb = await supabaseServer();
  const {
    data: { user: currentUser } = { user: null },
  } = (await sb?.auth.getUser()) ?? { data: { user: null } };

  return (
    <>
      <MockBanner />
      <Topbar eyebrow="Einstellungen" title="Bloom OS." />

      <div className="space-y-10">
        {isOwner ? (
          <section>
            <h2 className="font-display text-2xl text-bloom-cream mb-1">Team</h2>
            <p className="text-sm text-text-secondary mb-5">
              Lade Mitarbeiter:innen per Magic-Link ein, vergib Rollen und
              generiere Telegram-Onboarding-Codes für Schicht­benach­richti­gungen.
            </p>

            <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface-card p-5 mb-5">
              <h3 className="text-bloom-cream font-display text-lg mb-3">
                Neues Mitglied einladen
              </h3>
              <InviteMemberForm />
            </div>

            <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border-soft text-[0.6rem] uppercase tracking-[0.22em] text-text-muted flex items-center justify-between">
                <span>Mitglieder</span>
                <span>{members.length}</span>
              </div>
              {members.length === 0 ? (
                <p className="p-5 text-sm text-text-muted">
                  Noch niemand im Team. Lade jemanden über das Formular oben ein.
                </p>
              ) : (
                <ul className="divide-y divide-border-soft">
                  {members.map((m) => (
                    <TeamMemberRow
                      key={m.user_id}
                      member={m}
                      isSelf={currentUser?.id === m.user_id}
                    />
                  ))}
                </ul>
              )}
            </div>
          </section>
        ) : null}

        <section>
          <h2 className="font-display text-2xl text-bloom-cream mb-4">Rollen</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {ROLES.map((r) => (
              <div
                key={r.id}
                className="rounded-[var(--radius-card)] border border-border-soft bg-surface-card p-5"
              >
                <h3 className="text-bloom-cream font-display text-xl">{r.label}</h3>
                <p className="text-sm text-text-secondary mt-1">{r.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl text-bloom-cream mb-4">Öffnungszeiten</h2>
          <ul className="rounded-[var(--radius-card)] border border-border-soft bg-surface-card divide-y divide-border-soft">
            {site.hours.map((h) => (
              <li
                key={h.label}
                className="flex items-center justify-between px-5 py-4"
              >
                <span className="text-bloom-cream">{h.label}</span>
                <span className="text-text-secondary">{h.value}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-bloom-cream mb-4">
            Integrationen
          </h2>
          <ul className="rounded-[var(--radius-card)] border border-border-soft bg-surface-card divide-y divide-border-soft">
            <IntegrationRow label="Supabase"  state={integrations.supabase}  desc="Datenbank, Auth, Storage." />
            <IntegrationRow label="DISH"      state={true}                   desc="Reservierungs-Engine (vertraglich, inkl. Reserve with Google)." />
            <IntegrationRow label="Resend"    state={integrations.resend}    desc="Transaktionale E-Mails (Event-Bestätigungen, Owner-Reports)." />
            <IntegrationRow label="Twilio"    state={integrations.twilio}    desc="SMS-Erinnerungen für Events (optional)." />
            <IntegrationRow label="Telegram"  state={integrations.telegram}  desc="Mitarbeiter-Benachrichtigungen für Schichten und Tauschanfragen." />
            <IntegrationRow label="PostHog"   state={integrations.posthog}   desc="Cookielose Analytics, server-seitige KPI-Auswertung." />
            <IntegrationRow label="Payload"   state={integrations.payload}   desc="CMS für Hero-Slides, Speisekarte, Galerie, Seiten." />
          </ul>
          <p className="mt-4 text-xs text-text-muted">
            Schlüssel werden über Umgebungsvariablen gesetzt (siehe <code>.env.example</code>).
          </p>
        </section>
      </div>
    </>
  );
}

function IntegrationRow({
  label,
  state,
  desc,
}: {
  label: string;
  state: boolean;
  desc: string;
}) {
  return (
    <li className="flex items-center justify-between gap-4 px-5 py-4">
      <div>
        <div className="text-bloom-cream">{label}</div>
        <div className="text-xs text-text-muted">{desc}</div>
      </div>
      <span
        className={
          state
            ? "inline-flex items-center px-2.5 py-1 rounded-full text-[0.6rem] uppercase tracking-[0.22em] bg-status-confirmed/15 text-status-confirmed border border-status-confirmed/30"
            : "inline-flex items-center px-2.5 py-1 rounded-full text-[0.6rem] uppercase tracking-[0.22em] bg-status-late/10 text-status-late border border-status-late/30"
        }
      >
        {state ? "Aktiv" : "Nicht konfiguriert"}
      </span>
    </li>
  );
}
