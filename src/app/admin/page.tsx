import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bloom OS · Admin",
  robots: { index: false, follow: false },
};

/**
 * Placeholder for the Payload v3 admin mount.
 * Activate by following payload.config.ts at the repo root, then replacing
 * this page with the official Payload Next.js bridge.
 */
export default function AdminStubPage() {
  return (
    <main
      id="main-content"
      className="min-h-screen flex items-center justify-center px-6 py-20 text-bloom-cream"
    >
      <div className="max-w-xl space-y-6">
        <p className="text-[0.7rem] uppercase tracking-[0.32em] text-bloom-ochre">
          Bloom OS · CMS
        </p>
        <h1 className="font-display text-4xl">Payload v3 ist noch nicht gemountet.</h1>
        <p className="text-text-secondary">
          Die Konfiguration liegt unter <code>payload.config.ts</code> im
          Projekt-Root. Zum Aktivieren:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-text-secondary">
          <li>
            <code className="text-bloom-cream">npm i payload @payloadcms/next @payloadcms/db-postgres @payloadcms/richtext-lexical</code>
          </li>
          <li>
            Setze <code className="text-bloom-cream">DATABASE_URL</code> auf den Supabase-Postgres-Connection-String.
          </li>
          <li>
            Lege <code className="text-bloom-cream">src/app/(payload)/admin/[...segments]/page.tsx</code> an
            (siehe Payload-Docs „Installation in Existing Next.js“).
          </li>
          <li>
            <code className="text-bloom-cream">npx payload migrate</code> ausführen.
          </li>
        </ol>
        <p>
          Bis dahin werden Inhalte über das{" "}
          <Link href="/dashboard" className="text-bloom-ochre">Bloom Dashboard</Link> verwaltet
          und in Supabase gespeichert.
        </p>
      </div>
    </main>
  );
}
