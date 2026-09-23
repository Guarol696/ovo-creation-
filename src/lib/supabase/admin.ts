import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/env";

/**
 * Client Supabase « service » (contourne la RLS) : UNIQUEMENT côté serveur, pour
 * les écritures que l'utilisateur ne doit jamais pouvoir faire lui-même
 * (abonnement synchronisé depuis Stripe). La clé n'est jamais préfixée
 * NEXT_PUBLIC_ et n'est donc jamais envoyée au navigateur.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante (serveur uniquement).");
  const { url } = getSupabaseEnv();
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export const isAdminConfigured = () => Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
