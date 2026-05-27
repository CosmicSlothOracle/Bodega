import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * Cookie-bound server client (RLS-respecting).
 * Returns null if Supabase is not configured.
 */
export async function supabaseServer(): Promise<SupabaseClient | null> {
  if (!env.public.supabaseUrl || !env.public.supabaseAnonKey) return null;
  const store = await cookies();
  return createServerClient(env.public.supabaseUrl, env.public.supabaseAnonKey, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            store.set(name, value, options),
          );
        } catch {
          // Server components can't set cookies — middleware handles refresh.
        }
      },
    },
  });
}
