import "server-only";
import type { PlanId } from "@/config/plans";
import { isSupabaseConfigured } from "@/lib/env";

/** Configuration Stripe — lue uniquement côté serveur. */
export function billingConfig() {
  return {
    secretKey: process.env.STRIPE_SECRET_KEY?.trim() ?? "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "",
    prices: {
      pro: process.env.STRIPE_PRICE_PRO?.trim() ?? "",
      premium: process.env.STRIPE_PRICE_PREMIUM?.trim() ?? "",
    } as Record<Exclude<PlanId, "free">, string>,
    serviceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
  };
}

export function billingStatus() {
  const config = billingConfig();
  const missing = [
    !isSupabaseConfigured() && "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY",
    !config.secretKey && "STRIPE_SECRET_KEY",
    !config.prices.pro && "STRIPE_PRICE_PRO",
    !config.prices.premium && "STRIPE_PRICE_PREMIUM",
    !config.webhookSecret && "STRIPE_WEBHOOK_SECRET",
    !config.serviceRole && "SUPABASE_SERVICE_ROLE_KEY",
  ].filter((item): item is string => Boolean(item));
  return { ready: missing.length === 0, missing };
}

/** Plan correspondant à un identifiant de prix Stripe (inconnu = gratuit). */
export function planForPrice(priceId: string | undefined | null): PlanId {
  const { prices } = billingConfig();
  if (priceId && priceId === prices.premium) return "premium";
  if (priceId && priceId === prices.pro) return "pro";
  return "free";
}
