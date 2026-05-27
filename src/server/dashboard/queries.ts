/**
 * Dashboard data layer.
 *
 * Reads from Supabase via the service-role client when configured; falls back
 * to deterministic mock data so the UI is browsable without a backend.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";
import { serverIntegrations } from "@/lib/env";
import { fetchPostHogKpis } from "@/server/analytics/posthog";
import {
  mockEvents,
  mockGuests,
  mockKpis,
  mockNotifications,
  mockReservations,
  mockTables,
  mockAiTraffic,
} from "./mock";
import type {
  BloomEvent,
  Guest,
  Notification,
  Reservation,
  Table,
} from "@/lib/supabase/types";

export async function isLive() {
  return serverIntegrations().supabase;
}

export async function getReservationsForDate(date: string): Promise<Reservation[]> {
  const sb = supabaseAdmin();
  if (!sb) return mockReservations.filter((r) => r.date === date);

  const { data, error } = await sb
    .from("reservations")
    .select("*, guest:guests(*), table:tables(*)")
    .eq("date", date)
    .order("time", { ascending: true });

  if (error) {
    console.error("[dashboard.getReservationsForDate]", error);
    return [];
  }
  return (data ?? []) as Reservation[];
}

export async function getUpcomingReservations(limit = 50): Promise<Reservation[]> {
  const sb = supabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);
  if (!sb)
    return mockReservations
      .filter((r) => r.date >= today)
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
      .slice(0, limit);

  const { data, error } = await sb
    .from("reservations")
    .select("*, guest:guests(*), table:tables(*)")
    .gte("date", today)
    .order("date", { ascending: true })
    .order("time", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[dashboard.getUpcomingReservations]", error);
    return [];
  }
  return (data ?? []) as Reservation[];
}

export async function getTables(): Promise<Table[]> {
  const sb = supabaseAdmin();
  if (!sb) return mockTables;

  const { data, error } = await sb
    .from("tables")
    .select("*")
    .eq("active", true)
    .order("zone", { ascending: true });

  if (error) {
    console.error("[dashboard.getTables]", error);
    return [];
  }
  return (data ?? []) as Table[];
}

export async function getGuests(query?: string): Promise<Guest[]> {
  const sb = supabaseAdmin();
  if (!sb) {
    if (!query) return mockGuests;
    const q = query.toLowerCase();
    return mockGuests.filter(
      (g) =>
        g.first_name.toLowerCase().includes(q) ||
        g.last_name.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q),
    );
  }

  let q = sb.from("guests").select("*").order("last_name", { ascending: true }).limit(200);
  if (query) {
    const ilike = `%${query}%`;
    q = q.or(
      `first_name.ilike.${ilike},last_name.ilike.${ilike},email.ilike.${ilike}`,
    );
  }
  const { data, error } = await q;
  if (error) {
    console.error("[dashboard.getGuests]", error);
    return [];
  }
  return (data ?? []) as Guest[];
}

export async function getEvents(): Promise<BloomEvent[]> {
  const sb = supabaseAdmin();
  if (!sb) return mockEvents;
  const { data, error } = await sb
    .from("events")
    .select("*")
    .order("date", { ascending: true });
  if (error) {
    console.error("[dashboard.getEvents]", error);
    return [];
  }
  return (data ?? []) as BloomEvent[];
}

export async function getNotifications(limit = 20): Promise<Notification[]> {
  const sb = supabaseAdmin();
  if (!sb) return mockNotifications.slice(0, limit);
  const { data, error } = await sb
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[dashboard.getNotifications]", error);
    return [];
  }
  return (data ?? []) as Notification[];
}

/**
 * KPI roll-up. Pulls live visit/source data from PostHog when configured;
 * falls back to mock numbers otherwise so the dashboard stays meaningful
 * during local dev or before the analytics SDK has shipped any events.
 */
export async function getKpis() {
  const ph = await fetchPostHogKpis();
  if (!ph) return mockKpis;

  // Conversion + occupancy + no-shows still come from Supabase aggregates
  // (tracked separately). For now we keep mock placeholders for those
  // fields and only override what PostHog can answer authoritatively.
  return {
    ...mockKpis,
    visitsToday: ph.visitsToday,
    visitsTrendPct: ph.visitsTrendPct,
    sources:
      ph.topSources.length > 0
        ? ph.topSources
        : mockKpis.sources,
    topPages:
      ph.topPages.length > 0
        ? ph.topPages
        : mockKpis.topPages,
  };
}

export function getAiTraffic() {
  // Heuristic AI-traffic detection (LLM-referrer share) is computed by
  // PostHog dashboards directly; this widget is descriptive until then.
  return mockAiTraffic;
}
