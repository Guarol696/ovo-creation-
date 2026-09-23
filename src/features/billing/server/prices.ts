import "server-only";
import { PAID_PLANS, type PaidPlanId } from "@/config/premium";
import {
  checkPlanPrice,
  configPlanPrice,
  planPriceFrom,
  type PlanPrice,
  type PriceIssue,
} from "../price-check";
import { getBillingStatus, priceIdFor } from "./env";
import { getStripe } from "./stripe";

export interface PlanPrices {
  prices: Record<PaidPlanId, PlanPrice>;
  issues: Record<PaidPlanId, PriceIssue[]>;
  /** Prix effectivement lus chez Stripe (sinon : valeurs de config/premium.ts). */
  verified: boolean;
}

const fallback = (): PlanPrices => ({
  prices: { medium: configPlanPrice("medium"), premium: configPlanPrice("premium") },
  issues: { medium: [], premium: [] },
  verified: false,
});

const TTL_MS = process.env.NODE_ENV === "production" ? 5 * 60_000 : 15_000;
const ERROR_TTL_MS = 30_000;
let cached: { at: number; ttl: number; value: PlanPrices } | null = null;

/**
 * Prix des offres tels que configurés dans Stripe (source de vérité), avec un
 * court cache mémoire. Chaque Price est comparé à config/premium.ts : les
 * incohérences sont journalisées et affichées en développement / mode test.
 */
export async function getPlanPrices(): Promise<PlanPrices> {
  if (!getBillingStatus().checkoutReady) return fallback();
  if (cached && Date.now() - cached.at < cached.ttl) return cached.value;

  try {
    const stripe = getStripe();
    const entries = await Promise.all(
      PAID_PLANS.map(async (plan) => [plan, await stripe.prices.retrieve(priceIdFor(plan))] as const),
    );
    const value = fallback();
    value.verified = true;
    for (const [plan, price] of entries) {
      value.issues[plan] = checkPlanPrice(plan, price);
      value.prices[plan] = value.issues[plan].some((i) => i.level === "blocking")
        ? configPlanPrice(plan)
        : planPriceFrom(plan, price);
      for (const issue of value.issues[plan]) {
        (issue.level === "blocking" ? console.error : console.warn)(`[stripe] prix : ${issue.message}`);
      }
    }
    cached = { at: Date.now(), ttl: TTL_MS, value };
    return value;
  } catch (error) {
    // Price ID inexistant, clé refusée, Stripe injoignable… : affichage par défaut, erreur journalisée.
    console.error("[stripe] lecture des prix impossible", (error as Error).message);
    const value = fallback();
    const message = `Impossible de lire les Prices Stripe (${(error as Error).message}). Vérifie STRIPE_MEDIUM_PRICE_ID / STRIPE_PREMIUM_PRICE_ID et la clé Stripe (même mode test/live).`;
    value.issues = {
      medium: [{ level: "mismatch", message }],
      premium: [],
    };
    cached = { at: Date.now(), ttl: ERROR_TTL_MS, value };
    return value;
  }
}

/** Incohérences visibles dans l'interface : en développement ou en mode test Stripe uniquement. */
export const showPriceDiagnostics = () =>
  process.env.NODE_ENV !== "production" || getBillingStatus().testMode;
