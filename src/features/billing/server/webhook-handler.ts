import "server-only";
import type Stripe from "stripe";
import { idOf, invoiceSubscriptionId } from "../stripe-mapping";
import { syncSubscription, type SyncResult } from "./sync";

/** Événements Stripe écoutés (à sélectionner aussi dans le Dashboard Stripe). */
export const HANDLED_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
] as const;

/** Traite un événement déjà vérifié (signature contrôlée par la route). */
export async function handleStripeEvent(event: Stripe.Event): Promise<SyncResult> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const subscriptionId = idOf(session.subscription);
      if (session.mode !== "subscription" || !subscriptionId) {
        return { status: "ignored", reason: "session sans abonnement" };
      }
      return syncSubscription(subscriptionId, { userId: session.client_reference_id });
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      return syncSubscription(event.data.object.id);
    case "invoice.paid":
    case "invoice.payment_failed": {
      const subscriptionId = invoiceSubscriptionId(event.data.object);
      return subscriptionId
        ? syncSubscription(subscriptionId)
        : { status: "ignored", reason: "facture hors abonnement" };
    }
    default:
      return { status: "ignored", reason: `événement non traité : ${event.type}` };
  }
}
