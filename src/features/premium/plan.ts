import { PLAN_LIMITS, type PlanId } from "@/config/premium";

/**
 * Résolution du plan d'un utilisateur à partir de sa ligne `subscriptions`
 * (fonction pure, utilisée par le serveur pour les droits et par le navigateur
 * pour l'affichage uniquement).
 */

export type SubscriptionStatus = "active" | "trialing" | "canceled" | "expired";

export interface SubscriptionRow {
  plan: PlanId;
  status: SubscriptionStatus;
  started_at: string;
  expires_at: string | null;
}

export interface Entitlements {
  plan: PlanId;
  isPremium: boolean;
  status: SubscriptionStatus | null;
  expiresAt: string | null;
  limits: (typeof PLAN_LIMITS)[PlanId];
}

export const FREE_ENTITLEMENTS: Entitlements = {
  plan: "free",
  isPremium: false,
  status: null,
  expiresAt: null,
  limits: PLAN_LIMITS.free,
};

/** Premium seulement si l'abonnement est actif (ou en essai) et non expiré. */
export function resolveEntitlements(row: SubscriptionRow | null, now = new Date()): Entitlements {
  if (!row) return FREE_ENTITLEMENTS;
  const active = row.status === "active" || row.status === "trialing";
  const notExpired = !row.expires_at || new Date(row.expires_at).getTime() > now.getTime();
  const plan: PlanId = row.plan === "premium" && active && notExpired ? "premium" : "free";
  return {
    plan,
    isPremium: plan === "premium",
    status: row.status,
    expiresAt: row.expires_at,
    limits: PLAN_LIMITS[plan],
  };
}
