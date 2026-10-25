import type { NextRequest } from "next/server";
import { billingConfig, billingStatus } from "@/features/billing/env";
import { getStripe } from "@/features/billing/stripe";
import { claimEvent, handleStripeEvent, releaseEvent } from "@/features/billing/webhook";

/**
 * Webhook Stripe — seule source de vérité des abonnements. Signature
 * vérifiée sur le corps brut ; chaque événement n'est traité qu'une fois.
 */
export async function POST(request: NextRequest) {
  if (!billingStatus().ready) return new Response("Paiements non configurés.", { status: 503 });
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Signature manquante.", { status: 400 });

  const payload = await request.text();
  let event;
  try {
    event = await getStripe().webhooks.constructEventAsync(payload, signature, billingConfig().webhookSecret);
  } catch (error) {
    console.warn("[stripe] signature invalide", (error as Error).message);
    return new Response("Signature invalide.", { status: 400 });
  }

  try {
    if (!(await claimEvent(event))) return Response.json({ received: true, duplicate: true });
  } catch (error) {
    console.error("[stripe] enregistrement de l'événement impossible", error);
    return new Response("Erreur temporaire.", { status: 500 });
  }

  try {
    const result = await handleStripeEvent(event);
    console.info("[stripe]", event.type, event.id, JSON.stringify(result));
    return Response.json({ received: true });
  } catch (error) {
    // Échec : on libère l'événement pour que la relivraison de Stripe le retraite.
    console.error("[stripe] traitement impossible", event.type, event.id, error);
    await releaseEvent(event.id).catch(() => {});
    return new Response("Erreur temporaire.", { status: 500 });
  }
}
