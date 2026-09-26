import "server-only";
import type { PaidPlanId } from "@/config/premium";
import { isSupabaseConfigured } from "@/lib/env";
import { isAdminConfigured } from "@/lib/supabase/admin";

/**
 * Variables Stripe (serveur uniquement). Voir .env.example.
 * Chaque valeur est validée : une clé mal copiée donne un message clair
 * plutôt qu'un paiement cassé.
 */

const SECRET_KEY = /^(sk|rk)_(test|live)_[A-Za-z0-9]+$/;
const WEBHOOK_SECRET = /^whsec_[A-Za-z0-9]+$/;
const PRICE_ID = /^price_[A-Za-z0-9]+$/;

const read = (name: string) => process.env[name]?.trim() ?? "";

export function getBillingEnv() {
  const secretKey = read("STRIPE_SECRET_KEY");
  const webhookSecret = read("STRIPE_WEBHOOK_SECRET");
  const priceIds: Record<PaidPlanId, string> = {
    medium: read("STRIPE_MEDIUM_PRICE_ID"),
    premium: read("STRIPE_PREMIUM_PRICE_ID"),
  };
  return {
    secretKey: SECRET_KEY.test(secretKey) ? secretKey : "",
    webhookSecret: WEBHOOK_SECRET.test(webhookSecret) ? webhookSecret : "",
    priceIds: {
      medium: PRICE_ID.test(priceIds.medium) ? priceIds.medium : "",
      premium: PRICE_ID.test(priceIds.premium) ? priceIds.premium : "",
    } satisfies Record<PaidPlanId, string>,
    portalConfigurationId: read("STRIPE_PORTAL_CONFIGURATION_ID") || undefined,
    /**
     * Tests locaux uniquement (stripe-mock ou simulateur) : n'est jamais utilisée
     * avec une clé « live ».
     */
    apiBase: read("STRIPE_API_BASE") || undefined,
  };
}

export interface BillingStatus {
  /** Paiement possible (Checkout, portail). */
  checkoutReady: boolean;
  /** Webhook capable de vérifier les signatures et d'écrire l'abonnement. */
  webhookReady: boolean;
  /** Clé de test Stripe : aucun débit réel. */
  testMode: boolean;
  /** Variables manquantes ou invalides (pour les journaux et le README). */
  missing: string[];
}

export function getBillingStatus(): BillingStatus {
  const env = getBillingEnv();
  const missing: string[] = [];
  if (!isSupabaseConfigured()) missing.push("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!isAdminConfigured()) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!env.secretKey) missing.push("STRIPE_SECRET_KEY (vide ou ne commence pas par sk_test_/sk_live_)");
  if (!env.priceIds.medium) missing.push("STRIPE_MEDIUM_PRICE_ID (vide ou ne commence pas par price_)");
  if (!env.priceIds.premium) missing.push("STRIPE_PREMIUM_PRICE_ID (vide ou ne commence pas par price_)");
  const coreReady = missing.length === 0;
  if (!env.webhookSecret) missing.push("STRIPE_WEBHOOK_SECRET");
  return {
    checkoutReady: coreReady,
    webhookReady: coreReady && Boolean(env.webhookSecret),
    testMode: env.secretKey.includes("_test_"),
    missing,
  };
}

/** Price ID Stripe d'une offre payante. */
export const priceIdFor = (plan: PaidPlanId) => getBillingEnv().priceIds[plan];

/** Offre correspondant à un Price ID Stripe (null si inconnu : aucun droit accordé). */
export function planForPriceId(priceId: string | null | undefined): PaidPlanId | null {
  if (!priceId) return null;
  const { priceIds } = getBillingEnv();
  if (priceId === priceIds.medium) return "medium";
  if (priceId === priceIds.premium) return "premium";
  return null;
}
