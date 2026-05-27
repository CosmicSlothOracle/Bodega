"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

let cached: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient | null {
  if (cached) return cached;
  if (!env.public.supabaseUrl || !env.public.supabaseAnonKey) return null;
  cached = createBrowserClient(env.public.supabaseUrl, env.public.supabaseAnonKey, {
    auth: {
      flowType: "implicit",
    },
  });
  return cached;
}
