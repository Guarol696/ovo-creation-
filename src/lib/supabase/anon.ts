import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/env";

/**
 * Client Supabase anonyme (rôle `anon`, sans session ni cookie), pour les pages
 * publiques. Les en-têtes fournis sont transmis à PostgREST : les règles RLS
 * peuvent les lire (ex. jeton de partage).
 */
export function createAnonClient(headers: Record<string, string> = {}) {
  const { url, anonKey } = getSupabaseEnv();
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers },
  });
}
