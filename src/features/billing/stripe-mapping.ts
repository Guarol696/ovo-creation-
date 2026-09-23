import type Stripe from "stripe";
import type { PaidPlanId, PlanId } from "@/config/premium";
import type { SubscriptionStatus } from "@/features/premium/plan";

/**
 * Conversions Stripe → OVO (fonctions pures, testées unitairement).
 * API Stripe récente : la période de facturation est portée par les
 * éléments d'abonnement (`items.data[].current_period_*`), avec repli sur
 * les anciens champs de l'abonnement si présents.
 */

const KNOWN_STATUSES: SubscriptionStatus[] = [
  "active",
  "trialing",
  "past_due",
  "canceled",
  "unpaid",
  "incomplete",
  "incomplete_expired",
  "paused",
];

export interface SubscriptionFields {
  plan: PlanId;
  subscription_status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string | null;
}

const toIso = (seconds: number | null | undefined) =>
  typeof seconds === "number" && seconds > 0 ? new Date(seconds * 1000).toISOString() : null;

export const idOf = (value: string | { id: string } | null | undefined) =>
  value ? (typeof value === "string" ? value : value.id) : null;

/**
 * Ligne `subscriptions` à partir de l'abonnement Stripe.
 * Un Price ID inconnu ne donne aucun droit (offre gratuite) : jamais d'accès
 * accordé sur une donnée non reconnue.
 */
export function subscriptionToFields(
  subscription: Stripe.Subscription,
  planForPriceId: (priceId: string | null) => PaidPlanId | null,
): SubscriptionFields {
  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.id ?? null;
  const legacy = subscription as unknown as { current_period_start?: number; current_period_end?: number };
  const status = KNOWN_STATUSES.includes(subscription.status as SubscriptionStatus)
    ? (subscription.status as SubscriptionStatus)
    : "incomplete";
  return {
    plan: planForPriceId(priceId) ?? "free",
    subscription_status: status,
    current_period_start: toIso(item?.current_period_start ?? legacy.current_period_start),
    current_period_end: toIso(item?.current_period_end ?? legacy.current_period_end),
    // Annulation programmée : « à la fin de la période » ou à une date précise.
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end || subscription.cancel_at),
    stripe_customer_id: idOf(subscription.customer)!,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
  };
}

/** Abonnement lié à une facture (API récente : `parent.subscription_details`). */
export function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const fromParent = idOf(invoice.parent?.subscription_details?.subscription ?? null);
  if (fromParent) return fromParent;
  const legacy = invoice as unknown as { subscription?: string | { id: string } | null };
  return idOf(legacy.subscription ?? null);
}

/**
 * Abonnement « en cours » côté Stripe : pas de nouvel achat, on passe par le
 * portail pour changer d'offre (évite deux abonnements pour un même compte).
 */
export const ONGOING_STATUSES: SubscriptionStatus[] = ["active", "trialing", "past_due", "unpaid", "paused"];

export interface CheckoutParamsInput {
  plan: PaidPlanId;
  priceId: string;
  customerId: string;
  userId: string;
  siteUrl: string;
}

/** Paramètres de la session Stripe Checkout (mode abonnement). */
export function buildCheckoutParams(input: CheckoutParamsInput): Stripe.Checkout.SessionCreateParams {
  const metadata = { ovo_user_id: input.userId, ovo_plan: input.plan };
  return {
    mode: "subscription",
    customer: input.customerId,
    client_reference_id: input.userId,
    line_items: [{ price: input.priceId, quantity: 1 }],
    success_url: `${input.siteUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.siteUrl}/payment/cancel?offre=${input.plan}`,
    metadata,
    subscription_data: { metadata },
    allow_promotion_codes: true,
    locale: "fr",
  };
}
