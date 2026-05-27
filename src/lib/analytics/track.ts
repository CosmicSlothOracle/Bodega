"use client";

/**
 * Thin client-side analytics wrapper.
 *
 * Routes events to PostHog when configured, no-ops otherwise. Consumers don't
 * need to know whether analytics is initialised — they just call `track(...)`
 * at meaningful interaction points (CTA clicks, redirects, key views).
 *
 * PostHog is dynamic-imported in `Analytics.tsx`. We read the global namespace
 * here to avoid pulling in another ~250 kB chunk wherever this file is used.
 */
type PostHogShape = {
  capture?: (event: string, props?: Record<string, unknown>) => void;
};

function getPostHog(): PostHogShape | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { posthog?: PostHogShape };
  return w.posthog ?? null;
}

export function track(event: BloomEvent, props?: Record<string, unknown>) {
  const ph = getPostHog();
  ph?.capture?.(event, props);
}

/**
 * Curated set of named events. Keep this list small and stable so funnels and
 * dashboards stay comparable across releases. If you need a one-off, prefer a
 * generic event name (e.g. `cta_clicked`) with descriptive props.
 */
export type BloomEvent =
  | "reservation_clicked"
  | "dish_redirect"
  | "menu_viewed"
  | "event_clicked"
  | "contact_clicked"
  | "phone_clicked"
  | "email_clicked"
  | "gallery_opened"
  | "togo_clicked";
