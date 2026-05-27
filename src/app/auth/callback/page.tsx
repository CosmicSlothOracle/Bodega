import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCallbackHandler } from "./AuthCallbackHandler";

export const metadata: Metadata = {
  title: "Bloom · Anmeldung wird abgeschlossen …",
  robots: { index: false, follow: false },
};

/**
 * Auth return URL.
 *
 * Supabase routes four distinct flows here:
 *   - PKCE magic-link  → `?code=…` (server can resolve)
 *   - Implicit invite  → `#access_token=…&refresh_token=…&type=invite`
 *   - Implicit recovery → `#access_token=…&type=recovery`
 *   - Implicit signup   → `#access_token=…&type=signup`
 *
 * Browsers never send the URL hash to the server, so the implicit flows
 * MUST be handled client-side. The page below does both with a single
 * supabase-js browser client. On success we route to `next` (default
 * `/dashboard`); on failure to `/login?error=auth`.
 *
 * The page is intentionally minimal so it loads fast and the redirect
 * happens before the user sees a flicker.
 */
export default function AuthCallbackPage() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-bloom-ink text-bloom-cream flex items-center justify-center p-6"
    >
      <Suspense fallback={<Pending />}>
        <AuthCallbackHandler />
      </Suspense>
    </main>
  );
}

function Pending() {
  return (
    <div className="text-center">
      <div className="h-1 w-24 bg-bloom-ochre/40 mx-auto rounded-full overflow-hidden">
        <div className="h-full w-1/3 bg-bloom-ochre animate-pulse" />
      </div>
      <p className="mt-4 text-sm text-text-secondary">
        Anmeldung wird abgeschlossen …
      </p>
    </div>
  );
}
