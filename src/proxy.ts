import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { env } from "@/lib/env";

/**
 * Auth + role guard for /dashboard and /admin.
 *
 * Next.js 16 convention: this file lives at `src/proxy.ts` and exports a
 * function named `proxy` (the legacy `middleware.ts` / `middleware` export
 * still works but is deprecated).
 *
 * - If Supabase is not configured (mock mode), routes are wide open so the
 *   designer can preview the UI; we tag the response with `x-bloom-auth: mock`.
 * - In production, unauthenticated requests are redirected to /login.
 * - Role-based gating is *also* enforced server-side via Supabase RLS — this
 *   middleware is only a UX shortcut.
 */
export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const protectedRoot =
    path.startsWith("/dashboard") || path.startsWith("/admin");
  if (!protectedRoot) return NextResponse.next();

  if (!env.public.supabaseUrl || !env.public.supabaseAnonKey) {
    const res = NextResponse.next();
    res.headers.set("x-bloom-auth", "mock");
    return res;
  }

  const res = NextResponse.next();
  const supabase = createServerClient(
    env.public.supabaseUrl,
    env.public.supabaseAnonKey,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (
          cookiesToSet: { name: string; value: string; options: CookieOptions }[],
        ) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
