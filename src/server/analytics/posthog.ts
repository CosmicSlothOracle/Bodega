/**
 * Server-side PostHog reader.
 *
 * Pulls aggregate KPIs (visits, top sources, conversion-ish funnel) from the
 * PostHog Query API. Returns null when not configured so the dashboard can
 * fall back to mock data without crashing.
 *
 * Why server-side: the personal API key must never reach the browser. We use
 * the EU host by default (`https://eu.i.posthog.com` for ingest,
 * `https://eu.posthog.com` for the API).
 *
 * Cost note: PostHog has free 1M events/month. We hit the query API at most
 * a few times per dashboard render — well under any rate limit.
 */

interface PostHogKpis {
  visitsToday: number;
  visitsTrendPct: number;
  topSources: { label: string; share: number }[];
  topPages: { path: string; views: number }[];
}

const PH_API = process.env.POSTHOG_API_HOST ?? "https://eu.posthog.com";
const PH_PROJECT = process.env.POSTHOG_PROJECT_ID ?? "";
const PH_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY ?? "";

export function postHogConfigured(): boolean {
  return Boolean(PH_PROJECT && PH_API_KEY);
}

async function runQuery<T>(query: object): Promise<T | null> {
  if (!postHogConfigured()) return null;

  const res = await fetch(
    `${PH_API}/api/projects/${PH_PROJECT}/query/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PH_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      // Fast caching at the edge; KPIs don't need second-level freshness.
      next: { revalidate: 300 },
    },
  );

  if (!res.ok) {
    console.error("[posthog] query failed", res.status, await res.text());
    return null;
  }
  const json = (await res.json()) as T;
  return json;
}

interface HogQLResponse {
  results: unknown[][];
}

export async function fetchPostHogKpis(): Promise<PostHogKpis | null> {
  if (!postHogConfigured()) return null;

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  const [todayCount, yesterdayCount, sources, pages] = await Promise.all([
    runQuery<HogQLResponse>({
      kind: "HogQLQuery",
      query: `select count(distinct distinct_id) from events where event = '$pageview' and toDate(timestamp) = toDate('${today}')`,
    }),
    runQuery<HogQLResponse>({
      kind: "HogQLQuery",
      query: `select count(distinct distinct_id) from events where event = '$pageview' and toDate(timestamp) = toDate('${yesterday}')`,
    }),
    runQuery<HogQLResponse>({
      kind: "HogQLQuery",
      query: `
        select
          coalesce(properties.$initial_referring_domain, 'direkt') as source,
          count(distinct distinct_id) as visitors
        from events
        where event = '$pageview'
          and timestamp >= now() - interval 7 day
        group by source
        order by visitors desc
        limit 6
      `,
    }),
    runQuery<HogQLResponse>({
      kind: "HogQLQuery",
      query: `
        select properties.$pathname as path, count() as views
        from events
        where event = '$pageview'
          and timestamp >= now() - interval 7 day
        group by path
        order by views desc
        limit 6
      `,
    }),
  ]);

  const visitsToday = Number(todayCount?.results?.[0]?.[0] ?? 0);
  const visitsYesterday = Number(yesterdayCount?.results?.[0]?.[0] ?? 0);
  const visitsTrendPct =
    visitsYesterday > 0
      ? Math.round(((visitsToday - visitsYesterday) / visitsYesterday) * 100)
      : 0;

  const sourceRows = (sources?.results ?? []) as [string, number][];
  const totalSourceVisitors = sourceRows.reduce((s, [, v]) => s + Number(v), 0);
  const topSources = sourceRows.map(([label, v]) => ({
    label: prettyDomain(label),
    share:
      totalSourceVisitors > 0
        ? Math.round((Number(v) / totalSourceVisitors) * 100)
        : 0,
  }));

  const topPages = ((pages?.results ?? []) as [string, number][]).map(
    ([path, views]) => ({ path: path || "/", views: Number(views) }),
  );

  return { visitsToday, visitsTrendPct, topSources, topPages };
}

function prettyDomain(domain: string): string {
  if (!domain || domain === "$direct" || domain === "direkt") return "Direkt";
  if (domain.includes("google")) return "Google";
  if (domain.includes("instagram")) return "Instagram";
  if (domain.includes("facebook")) return "Facebook";
  if (domain.includes("chatgpt") || domain.includes("openai")) return "ChatGPT";
  if (domain.includes("perplexity")) return "Perplexity";
  if (domain.includes("claude") || domain.includes("anthropic")) return "Claude";
  if (domain.includes("bing")) return "Bing";
  return domain.replace(/^www\./, "");
}
