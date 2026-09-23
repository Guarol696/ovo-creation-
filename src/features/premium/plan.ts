import { PLAN_LIMITS, planIncludes, type FeatureId, type PlanId } from "@/config/premium";

/**
 * Résolution des droits d'un utilisateur à partir de sa ligne `subscriptions`,
 * elle-même synchronisée avec Stripe par le webhook (fonction pure : utilisée
 * par le serveur pour les droits et par le navigateur pour l'affichage).
 */

/** Statuts d'abonnement Stripe (+ `null` : aucun abonnement). */
export type SubscriptionStatus =
  "active" | "trialing" | "past_due" | "canceled" | "unpaid" | "incomplete" | "incomplete_expired" | "paused";

export interface SubscriptionRow {
  plan: PlanId;
  subscription_status: SubscriptionStatus | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

/** Colonnes à lire pour résoudre les droits. */
export const SUBSCRIPTION_COLUMNS =
  "plan, subscription_status, current_period_start, current_period_end, cancel_at_period_end";

/**
 * Statuts qui donnent accès à l'offre payée :
 * - `active`, `trialing` ;
 * - `past_due` : paiement échoué, Stripe réessaie (période de grâce, l'utilisateur est prévenu).
 * `unpaid`, `canceled`, `incomplete*`, `paused` : retour à l'offre gratuite.
 */
export const ACCESS_STATUSES: SubscriptionStatus[] = ["active", "trialing", "past_due"];

/** Marge si un webhook de renouvellement arrive en retard (la période est prolongée par Stripe). */
const PERIOD_TOLERANCE_MS = 48 * 60 * 60 * 1000;

export interface Entitlements {
  /** Offre effective (droits). */
  plan: PlanId;
  /** Offre souscrite chez Stripe, même si elle n'est plus active (ex. annulée). */
  subscribedPlan: PlanId;
  isPaid: boolean;
  isPremium: boolean;
  status: SubscriptionStatus | null;
  /** Paiement échoué : accès maintenu pendant les relances Stripe, action requise. */
  paymentIssue: boolean;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  limits: (typeof PLAN_LIMITS)[PlanId];
}

export const FREE_ENTITLEMENTS: Entitlements = {
  plan: "free",
  subscribedPlan: "free",
  isPaid: false,
  isPremium: false,
  status: null,
  paymentIssue: false,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  limits: PLAN_LIMITS.free,
};

export function resolveEntitlements(row: SubscriptionRow | null, now = new Date()): Entitlements {
  if (!row || row.plan === "free") {
    return row ? { ...FREE_ENTITLEMENTS, status: row.subscription_status } : FREE_ENTITLEMENTS;
  }
  const statusOk = row.subscription_status !== null && ACCESS_STATUSES.includes(row.subscription_status);
  const periodOk =
    !row.current_period_end ||
    new Date(row.current_period_end).getTime() + PERIOD_TOLERANCE_MS > now.getTime();
  const plan: PlanId = statusOk && periodOk ? row.plan : "free";
  return {
    plan,
    subscribedPlan: row.plan,
    isPaid: plan !== "free",
    isPremium: plan === "premium",
    status: row.subscription_status,
    paymentIssue: plan !== "free" && row.subscription_status === "past_due",
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    limits: PLAN_LIMITS[plan],
  };
}

/**
 * Accès à une fonctionnalité selon les droits résolus (Free ⊂ Medium ⊂ Premium).
 * Côté serveur, passer par `canUseFeature()` qui lit l'abonnement en base ;
 * ne jamais appeler ceci avec des droits venus du navigateur pour autoriser une action.
 */
export function hasFeatureAccess(entitlements: Pick<Entitlements, "plan">, feature: FeatureId) {
  return planIncludes(entitlements.plan, feature);
}

/** Libellé lisible d'un statut d'abonnement. */
export function statusLabel(entitlements: Entitlements): string {
  const { status, plan, cancelAtPeriodEnd } = entitlements;
  if (status === null) return "Aucun abonnement";
  if (plan !== "free" && cancelAtPeriodEnd) return "Actif, annulation programmée";
  switch (status) {
    case "active":
      return plan === "free" ? "Période terminée" : "Actif";
    case "trialing":
      return "Période d'essai";
    case "past_due":
      return "Paiement échoué : nouvelle tentative en cours";
    case "unpaid":
      return "Suspendu (paiement non réglé)";
    case "canceled":
      return "Annulé";
    case "incomplete":
      return "Paiement en attente de confirmation";
    case "incomplete_expired":
      return "Paiement non abouti";
    case "paused":
      return "En pause";
  }
}
