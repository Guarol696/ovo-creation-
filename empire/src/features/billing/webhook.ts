import "server-only";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { planForPrice } from "./env";
import { getStripe } from "./stripe";

const ACTIVE = new Set(["active", "trialing"]);

/**
 * Synchronise un abonnement : relu chez Stripe (source de vérité), jamais
 * depuis le contenu de l'événement seul. Un abonnement inactif (résilié,
 * impayé…) ramène l'utilisateur à l'offre gratuite : accès révoqué.
 */
export async function syncSubscription(subscriptionId: string, fallbackUserId?: string) {
  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.user_id || fallbackUserId;
  if (!userId) throw new Error(`Abonnement ${subscription.id} sans user_id.`);

  const item = subscription.items.data[0];
  const plan = ACTIVE.has(subscription.status) ? planForPrice(item?.price.id) : "free";
  const periodEnd = item?.current_period_end;
  const admin = createAdminClient();
  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
      stripe_subscription_id: subscription.id,
      plan,
      status: subscription.status,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
  return { userId, plan, status: subscription.status };
}

export async function handleStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode !== "subscription" || !session.subscription) return { handled: false };
      const id = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
      return { handled: true, ...(await syncSubscription(id, session.client_reference_id ?? undefined)) };
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed":
      return { handled: true, ...(await syncSubscription(event.data.object.id)) };
    default:
      return { handled: false };
  }
}

/** Idempotence : vrai si l'événement n'avait pas encore été enregistré. */
export async function claimEvent(event: Stripe.Event) {
  const admin = createAdminClient();
  const { error } = await admin.from("stripe_events").insert({ id: event.id, type: event.type });
  if (!error) return true;
  if (error.code === "23505") return false;
  throw error;
}

export async function releaseEvent(eventId: string) {
  await createAdminClient().from("stripe_events").delete().eq("id", eventId);
}
