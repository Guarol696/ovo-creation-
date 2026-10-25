import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/env";

/**
 * Client « service_role » (contourne la RLS) — serveur uniquement, réservé
 * aux écritures que l'utilisateur ne doit jamais faire lui-même
 * (abonnement synchronisé depuis Stripe).
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante (serveur uniquement).");
  const { url } = getSupabaseEnv();
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export const isAdminConfigured = () => Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
