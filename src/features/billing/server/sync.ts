import "server-only";
import Stripe from "stripe";
import { z } from "zod";
import { ACCESS_STATUSES, type SubscriptionStatus } from "@/features/premium/plan";
import { idOf, subscriptionToFields } from "../stripe-mapping";
import { planForPriceId } from "./env";
import {
  endMissingSubscription,
  getBillingRowByCustomer,
  getBillingRowByUser,
  linkCustomer,
  saveSubscription,
} from "./store";
import { getStripe } from "./stripe";

export type SyncResult =
  | { status: "synced"; userId: string; plan: string; subscriptionStatus: string }
  | { status: "ignored"; reason: string };

/**
 * Synchronise un abonnement : on relit TOUJOURS l'état actuel chez Stripe
 * (jamais le contenu de l'événement seul), ce qui rend le traitement
 * idempotent et insensible à l'ordre d'arrivée des webhooks.
 */
export async function syncSubscription(
  subscriptionId: string,
  hint: { userId?: string | null } = {},
): Promise<SyncResult> {
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  const customerId = idOf(subscription.customer);
  if (!customerId) return { status: "ignored", reason: "abonnement sans client" };

  // 1. Compte OVO : d'abord l'association enregistrée par OVO (source de vérité).
  let userId = (await getBillingRowByCustomer(customerId))?.user_id ?? null;
  if (!userId) {
    // 2. Sinon, identifiant posé par OVO lors du Checkout (métadonnées / client_reference_id).
    const candidate = subscription.metadata?.ovo_user_id || hint.userId || null;
    if (!candidate || !z.uuid().safeParse(candidate).success) {
      return { status: "ignored", reason: "aucun compte OVO associé à ce client Stripe" };
    }
    const linked = await linkCustomer(candidate, customerId);
    if (linked !== customerId) {
      console.error("[stripe] incohérence : le compte est déjà associé à un autre client Stripe", {
        userId: candidate,
      });
      return { status: "ignored", reason: "compte associé à un autre client Stripe" };
    }
    userId = candidate;
  }

  const fields = subscriptionToFields(subscription, planForPriceId);
  if (fields.plan === "free" && fields.stripe_price_id) {
    console.error("[stripe] Price ID inconnu : aucun droit accordé", { priceId: fields.stripe_price_id });
  }

  // Ne jamais remplacer un abonnement qui donne accès par un autre qui n'en donne pas (ex. ancien doublon).
  const current = await getBillingRowByUser(userId);
  if (
    current?.stripe_subscription_id &&
    current.stripe_subscription_id !== subscription.id &&
    current.subscription_status &&
    ACCESS_STATUSES.includes(current.subscription_status) &&
    !ACCESS_STATUSES.includes(fields.subscription_status)
  ) {
    return { status: "ignored", reason: "abonnement plus récent déjà actif" };
  }

  await saveSubscription(userId, fields);
  return { status: "synced", userId, plan: fields.plan, subscriptionStatus: fields.subscription_status };
}

const isMissing = (error: unknown) =>
  error instanceof Stripe.errors.StripeInvalidRequestError && error.code === "resource_missing";

/**
 * Réconciliation d'un client Stripe : relit ses abonnements chez Stripe et
 * resynchronise OVO (filet de sécurité si un webhook n'a jamais abouti).
 * Priorité à l'abonnement le plus récent qui donne accès, sinon au plus récent.
 * Si Stripe ne connaît plus ni le client ni l'abonnement enregistré, l'accès
 * est retiré (jamais l'inverse).
 */
export async function reconcileCustomer(customerId: string, userId: string): Promise<SyncResult> {
  let subscriptions: Stripe.Subscription[];
  try {
    ({ data: subscriptions } = await getStripe().subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 10,
    }));
  } catch (error) {
    if (!isMissing(error)) throw error;
    subscriptions = [];
  }
  const byNewest = [...subscriptions].sort((a, b) => b.created - a.created);
  const pick = byNewest.find((s) => ACCESS_STATUSES.includes(s.status as SubscriptionStatus)) ?? byNewest[0];
  if (pick) return syncSubscription(pick.id, { userId });

  const row = await getBillingRowByUser(userId);
  if (!row?.stripe_subscription_id || !row.subscription_status || row.subscription_status === "canceled") {
    return { status: "ignored", reason: "aucun abonnement chez Stripe" };
  }
  try {
    return await syncSubscription(row.stripe_subscription_id, { userId });
  } catch (error) {
    if (!isMissing(error)) throw error;
    console.error("[stripe] abonnement enregistré inconnu de Stripe : accès retiré", { userId });
    await endMissingSubscription(userId, row.stripe_subscription_id);
    return { status: "synced", userId, plan: row.plan, subscriptionStatus: "canceled" };
  }
}

export type CheckoutOutcome = "paid" | "processing" | "not_completed" | "unknown";

/**
 * État d'une session Checkout, pour l'affichage de /payment/success
 * uniquement : n'active jamais rien (seul le webhook met à jour l'offre).
 * La session doit appartenir à l'utilisateur connecté.
 */
export async function getCheckoutOutcome(sessionId: string, userId: string): Promise<CheckoutOutcome> {
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) return "unknown";
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.client_reference_id !== userId) return "unknown";
    if (session.status !== "complete") return "not_completed";
    return session.payment_status === "unpaid" ? "processing" : "paid";
  } catch (error) {
    console.warn("[stripe] lecture de la session Checkout impossible", (error as Error).message);
    return "unknown";
  }
}
