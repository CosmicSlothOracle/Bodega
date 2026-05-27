"use client";

import { useEffect } from "react";
import { env } from "@/lib/env";

/**
 * Loads PostHog with a cookieless configuration (memory persistence) so we
 * stay banner-free under ePrivacy. PostHog covers everything we need:
 * pageviews, autocapture, custom events (`track()`), and server-side KPIs
 * via the HogQL Query API. A separate web-analytics provider (Plausible,
 * Umami, …) is intentionally not loaded — see ADR-006.
 *
 * The SDK is dynamic-imported so its ~250kB never enters the layout entry
 * chunk, keeping Turbopack's first compile light enough not to blow Node's
 * heap during dev.
 */
export function Analytics() {
  useEffect(() => {
    if (!env.public.posthogKey) return;
    if (typeof window === "undefined") return;
    if ((window as unknown as { __ph?: boolean }).__ph) return;
    (window as unknown as { __ph?: boolean }).__ph = true;

    let cancelled = false;
    void import("posthog-js").then(({ default: posthog }) => {
      if (cancelled) return;
      posthog.init(env.public.posthogKey!, {
        api_host: env.public.posthogHost,
        person_profiles: "identified_only",
        capture_pageview: true,
        capture_pageleave: true,
        disable_session_recording: true,
        autocapture: true,
        persistence: "memory",
        cross_subdomain_cookie: false,
      });
      (window as unknown as { posthog?: typeof posthog }).posthog = posthog;
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
