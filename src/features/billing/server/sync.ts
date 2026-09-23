import "server-only";
import { z } from "zod";
import { ACCESS_STATUSES } from "@/features/premium/plan";
import { idOf, subscriptionToFields } from "../stripe-mapping";
import { planForPriceId } from "./env";
import { getBillingRowByCustomer, getBillingRowByUser, linkCustomer, saveSubscription } from "./store";
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
