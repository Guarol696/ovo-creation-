import "server-only";
import Stripe from "stripe";
import { billingConfig } from "./env";

let client: Stripe | null = null;

export function getStripe() {
  const { secretKey } = billingConfig();
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY manquante.");
  client ??= new Stripe(secretKey);
  return client;
}
