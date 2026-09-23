import "server-only";
import Stripe from "stripe";
import { getBillingEnv } from "./env";

let client: Stripe | null = null;

/** Client Stripe (serveur uniquement), créé à la demande avec STRIPE_SECRET_KEY. */
export function getStripe(): Stripe {
  if (client) return client;
  const { secretKey, apiBase } = getBillingEnv();
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY manquante ou invalide.");

  // Redirection vers un serveur de test local (stripe-mock…) : clés de test seulement.
  const local = apiBase && secretKey.includes("_test_") ? new URL(apiBase) : null;
  client = new Stripe(secretKey, {
    appInfo: { name: "OVO", url: "https://ovo.travel" },
    maxNetworkRetries: 2,
    timeout: 20_000,
    ...(local
      ? {
          host: local.hostname,
          port: local.port || (local.protocol === "https:" ? 443 : 80),
          protocol: local.protocol === "https:" ? "https" : "http",
        }
      : {}),
  });
  return client;
}
