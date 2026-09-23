import type { NextRequest } from "next/server";
import { getBillingEnv, getBillingStatus } from "@/features/billing/server/env";
import { getStripe } from "@/features/billing/server/stripe";
import { handleStripeEvent } from "@/features/billing/server/webhook-handler";

/**
 * Webhook Stripe : seule source de vérité pour activer, modifier ou arrêter
 * un abonnement OVO. Chaque requête est authentifiée par sa signature
 * (STRIPE_WEBHOOK_SECRET) ; le corps brut est vérifié avant toute lecture.
 */
export async function POST(request: NextRequest) {
  if (!getBillingStatus().webhookReady) {
    console.error("[stripe] webhook reçu mais configuration incomplète", getBillingStatus().missing);
    return new Response("Webhook Stripe non configuré.", { status: 503 });
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Signature Stripe manquante.", { status: 400 });

  const payload = await request.text();
  let event;
  try {
    event = await getStripe().webhooks.constructEventAsync(payload, signature, getBillingEnv().webhookSecret);
  } catch (error) {
    console.warn("[stripe] signature de webhook invalide", (error as Error).message);
    return new Response("Signature Stripe invalide.", { status: 400 });
  }

  try {
    const result = await handleStripeEvent(event);
    console.info(
      "[stripe] webhook",
      event.type,
      event.id,
      result.status,
      "reason" in result ? result.reason : result.plan,
    );
    return Response.json({ received: true, result: result.status });
  } catch (error) {
    // Erreur temporaire (Stripe, base…) : code 500 pour que Stripe réessaie.
    console.error("[stripe] traitement du webhook impossible", event.type, event.id, error);
    return new Response("Traitement impossible, réessayer plus tard.", { status: 500 });
  }
}
