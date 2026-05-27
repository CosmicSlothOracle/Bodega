"use client";

import { useEffect } from "react";

/**
 * Resilience layer for Supabase invite / recovery links that landed on a
 * page other than /auth/callback (e.g. when Site URL was momentarily
 * misconfigured, or an old link is opened post-domain-cutover).
 *
 * On mount we inspect `window.location.hash`. If it carries a Supabase
 * implicit-flow token bundle (`#access_token=…`), we forward the user
 * to `/auth/callback` with the same hash so the central handler can
 * complete the session exchange.
 *
 * Renders nothing.
 */
export function HashAuthSniffer() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token=")) return;

    // Already at /auth/callback? Let that handler take it.
    if (window.location.pathname === "/auth/callback") return;

    const target = `/auth/callback${hash}`;
    window.location.replace(target);
  }, []);

  return null;
}
