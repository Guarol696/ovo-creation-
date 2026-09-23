import "server-only";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Suivi des événements Stripe reçus (table `stripe_webhook_events`) :
 * un même événement livré plusieurs fois n'est traité qu'une fois.
 */

export type EventClaim = "process" | "duplicate" | "in_progress";

export async function claimEvent(event: Stripe.Event): Promise<EventClaim> {
  const { data, error } = await createAdminClient().rpc("claim_stripe_webhook_event", {
    p_event_id: event.id,
    p_event_type: event.type,
    p_stripe_created_at: new Date(event.created * 1000).toISOString(),
  });
  if (error) throw error;
  if (data !== "process" && data !== "duplicate" && data !== "in_progress") {
    throw new Error(`Réponse inattendue de claim_stripe_webhook_event : ${String(data)}`);
  }
  return data;
}

export async function markEventProcessed(eventId: string, result: string) {
  const { error } = await createAdminClient()
    .from("stripe_webhook_events")
    .update({ status: "processed", processed_at: new Date().toISOString(), result: result.slice(0, 500) })
    .eq("event_id", eventId);
  if (error) throw error;
}

export async function markEventFailed(eventId: string, message: string) {
  const { error } = await createAdminClient()
    .from("stripe_webhook_events")
    .update({ status: "failed", last_error: message.slice(0, 500) })
    .eq("event_id", eventId)
    .is("processed_at", null);
  if (error) console.error("[stripe] impossible d'enregistrer l'échec du webhook", eventId, error);
}

/** Purge des événements anciens (appelée par la réconciliation quotidienne). */
export async function purgeOldEvents(days = 90) {
  const before = new Date(Date.now() - days * 86_400_000).toISOString();
  const { error, count } = await createAdminClient()
    .from("stripe_webhook_events")
    .delete({ count: "exact" })
    .lt("received_at", before)
    .eq("status", "processed");
  if (error) throw error;
  return count ?? 0;
}
