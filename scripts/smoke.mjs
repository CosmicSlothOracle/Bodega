#!/usr/bin/env node
/**
 * Bloom · Post-Deploy Smoke Test
 *
 * Verifies that a deployed (or locally running) instance of bodega-web is
 * reachable, that public routes serve, that the auth gate redirects, and that
 * the Supabase REST anon-read on `menu_sections` works.
 *
 * Run examples
 *   node scripts/smoke.mjs                        # local: http://localhost:3000
 *   node scripts/smoke.mjs --base https://bodega-web.vercel.app
 *   BLOOM_SMOKE_BASE=https://bodega-buehlot.de node scripts/smoke.mjs
 *
 * Exit code 0 on success, 1 on any failure.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// -------- .env.local loader (no dotenv dep) --------------------------------
function loadEnvFile(file) {
  const full = path.join(projectRoot, file);
  if (!fs.existsSync(full)) return;
  const raw = fs.readFileSync(full, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    const key = m[1];
    let value = m[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
loadEnvFile(".env.local");
loadEnvFile(".env");

// -------- args -------------------------------------------------------------
function arg(name, fallback) {
  const flag = `--${name}`;
  const i = process.argv.findIndex((a) => a === flag || a.startsWith(`${flag}=`));
  if (i === -1) return fallback;
  const v = process.argv[i];
  if (v.includes("=")) return v.slice(v.indexOf("=") + 1);
  return process.argv[i + 1] ?? fallback;
}

const base = (arg("base") ?? process.env.BLOOM_SMOKE_BASE ?? "http://localhost:3000").replace(/\/$/, "");
const supabaseUrl = (arg("supabase-url") ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
const supabaseAnonKey = arg("supabase-anon-key") ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const verbose = process.argv.includes("--verbose");

// -------- runner -----------------------------------------------------------
const results = [];
const t0 = Date.now();

const C = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

async function check(name, fn) {
  const start = Date.now();
  try {
    await fn();
    const ms = Date.now() - start;
    results.push({ name, ok: true, ms });
    console.log(`${C.green}✓${C.reset} ${name} ${C.dim}(${ms}ms)${C.reset}`);
  } catch (err) {
    const ms = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    results.push({ name, ok: false, ms, message });
    console.log(`${C.red}✗${C.reset} ${name} ${C.dim}(${ms}ms)${C.reset}`);
    console.log(`  ${C.red}${message}${C.reset}`);
  }
}

async function get(url, init = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15_000);
  try {
    const res = await fetch(url, { redirect: "manual", signal: ctrl.signal, ...init });
    return res;
  } finally {
    clearTimeout(t);
  }
}

function expectStatus(res, ...allowed) {
  if (!allowed.includes(res.status)) {
    throw new Error(`expected status ∈ {${allowed.join(", ")}}, got ${res.status}`);
  }
}

// -------- tests ------------------------------------------------------------
const publicRoutes = [
  "/",
  "/speisekarte",
  "/events",
  "/galerie",
  "/ueber-uns",
  "/reservierung",
  "/to-go",
  "/kontakt",
  "/impressum",
  "/datenschutz",
];

console.log(`${C.bold}${C.cyan}Bloom · Smoke Test${C.reset}  →  ${base}\n`);

for (const route of publicRoutes) {
  await check(`GET ${route} → 200`, async () => {
    const res = await get(`${base}${route}`);
    expectStatus(res, 200);
  });
}

await check("GET /login → 200 (Magic-Link form)", async () => {
  const res = await get(`${base}/login`);
  expectStatus(res, 200);
});

// /auth/callback is a *page*, not a route handler — Supabase implicit
// flows put the token in the hash fragment which browsers never send to
// the server. So the server always returns 200; the client-side
// `AuthCallbackHandler` then routes to /login on missing tokens. We
// verify the shell renders.
await check("GET /auth/callback (no code) → 200 (client-side handler)", async () => {
  const res = await get(`${base}/auth/callback`);
  expectStatus(res, 200);
  const body = await res.text();
  if (!body.includes("Anmeldung wird abgeschlossen")) {
    throw new Error("expected auth-callback page shell");
  }
});

// When Supabase env is configured, the proxy MUST redirect unauthenticated
// requests. Accepting a 200 here would mask a broken auth guard (e.g. the
// proxy file in the wrong location, or env not loaded by the deployed app).
const expectAuthRedirect = Boolean(supabaseUrl && supabaseAnonKey);

await check(
  expectAuthRedirect
    ? "GET /dashboard → redirect to /login (auth-mode)"
    : "GET /dashboard → 200 (mock-mode, no Supabase env)",
  async () => {
    const res = await get(`${base}/dashboard`);
    if (expectAuthRedirect) {
      if (![302, 307, 308].includes(res.status)) {
        throw new Error(
          `expected redirect, got ${res.status}. Auth guard not running — check that src/proxy.ts is at the correct path (Next.js 16 convention) and that NEXT_PUBLIC_SUPABASE_* env vars are loaded by the running process.`,
        );
      }
      const loc = res.headers.get("location") ?? "";
      if (!loc.includes("/login")) {
        throw new Error(`redirected to ${loc} (expected /login)`);
      }
      if (verbose) console.log(`  ${C.dim}→ ${loc}${C.reset}`);
      return;
    }
    expectStatus(res, 200);
    if (verbose) console.log(`  ${C.dim}x-bloom-auth=${res.headers.get("x-bloom-auth") ?? "n/a"}${C.reset}`);
  },
);

await check(
  expectAuthRedirect
    ? "GET /admin → redirect to /login (auth-mode)"
    : "GET /admin → 200 or 404 (mock-mode)",
  async () => {
    const res = await get(`${base}/admin`);
    if (expectAuthRedirect) {
      if (![302, 307, 308].includes(res.status)) {
        throw new Error(`expected redirect, got ${res.status}`);
      }
      const loc = res.headers.get("location") ?? "";
      if (!loc.includes("/login")) {
        throw new Error(`redirected to ${loc} (expected /login)`);
      }
      return;
    }
    if (![200, 404].includes(res.status)) {
      throw new Error(`unexpected status ${res.status}`);
    }
  },
);

// ── Removed legacy routes (Phase F2 / ADR-007) ────────────────────────────
// After the auto-final swap rewrite the manager-approval page and the
// per-staff "Meine Schichten" page were subsumed by the Staff Home. They
// must return 404 — a 200 here means a stale build is still on the host.
const removedRoutes = [
  "/dashboard/schichten/anfragen",
  "/dashboard/meine-schichten",
];
for (const route of removedRoutes) {
  await check(`GET ${route} → 404 (removed in ADR-007)`, async () => {
    const res = await get(`${base}${route}`);
    if (expectAuthRedirect && [302, 307, 308].includes(res.status)) {
      // Proxy redirects unauthenticated dashboard routes to /login *before*
      // the 404 has a chance to render. That still proves the legacy route
      // is gated; we accept it.
      const loc = res.headers.get("location") ?? "";
      if (!loc.includes("/login")) {
        throw new Error(`redirected to ${loc} (expected /login)`);
      }
      return;
    }
    if (res.status !== 404) {
      throw new Error(
        `expected 404, got ${res.status}. Legacy route ${route} is still being served — run the build with the new tree.`,
      );
    }
  });
}

// ── Shift-swap API guards ─────────────────────────────────────────────────
await check("POST /api/shifts (unauth) → 401 or 503", async () => {
  const res = await get(`${base}/api/shifts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (![401, 503].includes(res.status)) {
    throw new Error(`expected 401 (or 503 when Supabase unset), got ${res.status}`);
  }
});

await check("POST /api/shifts/swap (unauth) → 401 or 503", async () => {
  const res = await get(`${base}/api/shifts/swap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (![401, 503].includes(res.status)) {
    throw new Error(`expected 401 (or 503 when Supabase unset), got ${res.status}`);
  }
});

await check("GET /api/shifts/template (unauth) → 401 or 503", async () => {
  const res = await get(`${base}/api/shifts/template`);
  if (![401, 503].includes(res.status)) {
    throw new Error(`expected 401, got ${res.status}`);
  }
});

await check("POST /api/shifts/open-claim (unauth) → 401 or 503", async () => {
  const res = await get(`${base}/api/shifts/open-claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (![401, 503].includes(res.status)) {
    throw new Error(`expected 401, got ${res.status}`);
  }
});

await check("GET /api/shifts/preferences (unauth) → 401 or 503", async () => {
  const res = await get(`${base}/api/shifts/preferences`);
  if (![401, 503].includes(res.status)) {
    throw new Error(`expected 401, got ${res.status}`);
  }
});

await check("GET /api/cron/expire-swaps (no secret) → 401", async () => {
  const res = await get(`${base}/api/cron/expire-swaps`);
  if (res.status !== 401) {
    throw new Error(`expected 401, got ${res.status}`);
  }
});

await check("PATCH /api/shifts/swap (unauth) → 401 or 503", async () => {
  const res = await get(`${base}/api/shifts/swap`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (![401, 503].includes(res.status)) {
    throw new Error(`expected 401, got ${res.status}`);
  }
});

await check("GET /api/shifts/swap/confirm (no token) → 400", async () => {
  const res = await get(`${base}/api/shifts/swap/confirm`);
  if (res.status !== 400) {
    throw new Error(`expected 400, got ${res.status}`);
  }
  const body = await res.text();
  if (!body.includes("Ungültiger Link")) {
    throw new Error(`expected German error page, got ${body.slice(0, 120)}`);
  }
});

await check("GET /api/team (unauth) → 401 or 503", async () => {
  const res = await get(`${base}/api/team`);
  if (![401, 503].includes(res.status)) {
    throw new Error(`expected 401, got ${res.status}`);
  }
});

await check(
  "GET /api/team/00000000-0000-0000-0000-000000000000/shifts (unauth) → 401 or 503",
  async () => {
    const res = await get(
      `${base}/api/team/00000000-0000-0000-0000-000000000000/shifts`,
    );
    if (![401, 503].includes(res.status)) {
      throw new Error(`expected 401, got ${res.status}`);
    }
  },
);

await check("POST /api/telegram/webhook (no secret) → 401", async () => {
  const res = await get(`${base}/api/telegram/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (res.status !== 401) {
    throw new Error(`expected 401, got ${res.status}`);
  }
});

await check("GET /robots.txt → 200", async () => {
  const res = await get(`${base}/robots.txt`);
  expectStatus(res, 200);
});

await check("GET /sitemap.xml → 200 with all 10 public routes", async () => {
  const res = await get(`${base}/sitemap.xml`);
  expectStatus(res, 200);
  const body = await res.text();
  for (const route of publicRoutes) {
    const tail = route === "/" ? "" : route;
    if (!body.includes(tail || "<loc>")) {
      throw new Error(`sitemap missing ${route}`);
    }
  }
});

if (supabaseUrl && supabaseAnonKey) {
  await check("Supabase REST: GET menu_sections (anon) → 200 + array", async () => {
    const res = await get(`${supabaseUrl}/rest/v1/menu_sections?select=id,slug,title&limit=10`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Accept: "application/json",
      },
    });
    expectStatus(res, 200);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error(`expected array, got ${typeof data}`);
    if (verbose) console.log(`  ${C.dim}(${data.length} section(s))${C.reset}`);
  });

  await check("Supabase REST: GET menu_items where available=true (anon) → 200 + array", async () => {
    const res = await get(
      `${supabaseUrl}/rest/v1/menu_items?select=id,name&available=eq.true&limit=20`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          Accept: "application/json",
        },
      },
    );
    expectStatus(res, 200);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error(`expected array, got ${typeof data}`);
    if (verbose) console.log(`  ${C.dim}(${data.length} item(s))${C.reset}`);
  });
} else {
  console.log(
    `${C.yellow}⚠${C.reset}  Supabase REST checks skipped (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY not set).`,
  );
}

// -------- summary ----------------------------------------------------------
const passed = results.filter((r) => r.ok).length;
const failed = results.length - passed;
const total = Date.now() - t0;

console.log("");
console.log(
  `${C.bold}${failed === 0 ? C.green : C.red}${passed}/${results.length} checks passed${C.reset} ${C.dim}in ${total}ms${C.reset}`,
);

if (failed > 0) {
  console.log("");
  for (const r of results.filter((x) => !x.ok)) {
    console.log(`  ${C.red}✗${C.reset} ${r.name}`);
    console.log(`    ${r.message}`);
  }
  process.exit(1);
}
