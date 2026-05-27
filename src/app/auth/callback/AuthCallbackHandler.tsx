"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

type Phase = "working" | "ok" | "error";

export function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<Phase>("working");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = supabaseBrowser();
    if (!supabase) {
      // setState inside an effect is intentional here: the entire effect is
      // a state-machine driven by async Supabase calls and `window` access
      // (which is unavailable during SSR). The lint rule is too strict for
      // PKCE-callback handlers.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("error");
      setMessage("Supabase ist nicht konfiguriert.");
      return;
    }

    const safeNext = (raw: string | null | undefined): string => {
      if (!raw) return "/dashboard";
      if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
      return "/dashboard";
    };

    async function handle() {
      const code = searchParams.get("code");
      const errParam =
        searchParams.get("error_description") ?? searchParams.get("error");

      // PKCE flow (signInWithOtp default).
      if (code) {
        const { error } = await supabase!.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (error) {
          fail(`PKCE: ${error.message}`);
          return;
        }
        succeed(safeNext(searchParams.get("next")));
        return;
      }

      // Implicit flow (inviteUserByEmail / recovery / signup default).
      // Tokens live in the hash fragment. Strip leading `#`.
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;
      const params = new URLSearchParams(hash);

      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const hashErr =
        params.get("error_description") ?? params.get("error");

      if (hashErr) {
        fail(`Hash: ${hashErr}`);
        return;
      }

      if (accessToken && refreshToken) {
        const { error } = await supabase!.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (cancelled) return;
        if (error) {
          fail(`Implicit: ${error.message}`);
          return;
        }
        // Clear the hash so a refresh doesn't re-trigger anything.
        try {
          history.replaceState(null, "", window.location.pathname + window.location.search);
        } catch {
          /* noop */
        }
        succeed(safeNext(searchParams.get("next")));
        return;
      }

      if (errParam) {
        fail(`Query: ${errParam}`);
        return;
      }

      fail("Kein gültiger Token im Callback gefunden.");
    }

    function succeed(next: string) {
      if (cancelled) return;
      setPhase("ok");
      // Use a hard redirect so the proxy / middleware sees the new cookies.
      window.location.replace(next);
    }

    function fail(detail: string) {
      if (cancelled) return;
      console.warn("[auth/callback]", detail);
      setPhase("error");
      setMessage(detail);
      const url = new URL("/login", window.location.origin);
      url.searchParams.set("error", "auth");
      setTimeout(() => router.replace(url.pathname + url.search), 1200);
    }

    void handle();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  if (phase === "ok") {
    return (
      <div className="text-center">
        <p className="text-sm text-text-secondary">Eingeloggt — leite weiter …</p>
      </div>
    );
  }
  if (phase === "error") {
    return (
      <div className="text-center max-w-sm">
        <p className="text-sm text-status-issue">Anmeldung fehlgeschlagen.</p>
        {message ? (
          <p className="text-xs text-text-muted mt-2 break-words">{message}</p>
        ) : null}
        <p className="text-xs text-text-muted mt-3">
          Du wirst zur Anmeldung weitergeleitet …
        </p>
      </div>
    );
  }
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
