/**
 * Centralised environment-variable access.
 * - Server-only secrets are read lazily via the `server` helpers.
 * - Public (NEXT_PUBLIC_*) values are read inline.
 * - Everything is optional so the project boots in mock-mode without secrets.
 *   In production, missing required values surface via `serverIntegrations()`.
 *
 * Reservations: DISH owns the booking engine (deep-link out of our
 * Bloom-styled prefilter). No reservation API key is required on our side;
 * staff manages bookings in the DISH backoffice.
 */

function normalizeEnvValue(raw: string | undefined, key: string): string {
  const value = (raw ?? "").trim();
  const prefix = `${key}=`;
  if (value.startsWith(prefix)) return value.slice(prefix.length).trim();
  return value;
}

export const env = {
  public: {
    siteUrl:
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://bodega-buehlot.de",
    posthogKey: normalizeEnvValue(
      process.env.NEXT_PUBLIC_POSTHOG_KEY,
      "NEXT_PUBLIC_POSTHOG_KEY",
    ),
    posthogHost:
      normalizeEnvValue(process.env.NEXT_PUBLIC_POSTHOG_HOST, "NEXT_PUBLIC_POSTHOG_HOST") ||
      "https://eu.i.posthog.com",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    dishRestaurantId: process.env.NEXT_PUBLIC_DISH_RESTAURANT_ID ?? "343512",
  },
};

export function serverEnv() {
  return {
    nodeEnv: process.env.NODE_ENV ?? "development",
    resend: {
      apiKey: process.env.RESEND_API_KEY ?? "",
      fromAddress:
        process.env.RESEND_FROM ?? "Bodega Bühlot <hola@bodega-buehlot.de>",
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID ?? "",
      authToken: process.env.TWILIO_AUTH_TOKEN ?? "",
      fromNumber: process.env.TWILIO_FROM_NUMBER ?? "",
    },
    telegram: {
      botToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
      botUsername: process.env.TELEGRAM_BOT_USERNAME ?? "",
    },
    supabase: {
      url: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    },
    posthog: {
      apiHost: process.env.POSTHOG_API_HOST ?? "https://eu.posthog.com",
      projectId: process.env.POSTHOG_PROJECT_ID ?? "",
      personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY ?? "",
    },
    cron: {
      secret: process.env.CRON_SECRET ?? "",
    },
  };
}

export function serverIntegrations() {
  const s = serverEnv();
  return {
    resend: Boolean(s.resend.apiKey),
    twilio: Boolean(s.twilio.accountSid && s.twilio.authToken && s.twilio.fromNumber),
    telegram: Boolean(s.telegram.botToken),
    supabase: Boolean(s.supabase.url && s.supabase.serviceRoleKey),
    posthog: Boolean(s.posthog.projectId && s.posthog.personalApiKey),
    payload: Boolean(process.env.PAYLOAD_SECRET && process.env.DATABASE_URL),
  };
}
