import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env";

let cached: SupabaseClient | null = null;

/**
 * Service-role Supabase client for server-side mutations.
 * Returns null if env vars are not configured (mock mode).
 * Never expose to the browser.
 */
export function supabaseAdmin(): SupabaseClient | null {
  if (cached) return cached;
  const { supabase } = serverEnv();
  if (!supabase.url || !supabase.serviceRoleKey) return null;
  cached = createClient(supabase.url, supabase.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
