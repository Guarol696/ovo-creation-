import "server-only";
import type { AppUser } from "@/features/auth/server/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBillingRowByUser, linkCustomer } from "./store";
import { getStripe } from "./stripe";

/**
 * Client Stripe du compte OVO : réutilisé s'il existe, créé sinon.
 * - clé d'idempotence par utilisateur : un double clic ne crée pas deux clients ;
 * - métadonnée `ovo_user_id` : le lien est vérifiable depuis Stripe ;
 * - un client supprimé dans Stripe est remplacé proprement.
 */
export async function ensureStripeCustomer(user: AppUser): Promise<string> {
  const stripe = getStripe();
  const row = await getBillingRowByUser(user.id);
  if (row?.stripe_customer_id) {
    const existing = await stripe.customers.retrieve(row.stripe_customer_id);
    if (!("deleted" in existing && existing.deleted)) return row.stripe_customer_id;
    console.warn("[stripe] client supprimé côté Stripe, recréation", { userId: user.id });
  }
  const customer = await stripe.customers.create(
    { email: user.email, name: user.displayName, metadata: { ovo_user_id: user.id } },
    { idempotencyKey: `ovo-customer-${user.id}-${row?.stripe_customer_id ?? "new"}` },
  );
  if (row?.stripe_customer_id) {
    // Ancien client supprimé : on remplace l'association.
    const { error } = await createAdminClient()
      .from("subscriptions")
      .update({ stripe_customer_id: customer.id })
      .eq("user_id", user.id);
    if (error) throw error;
    return customer.id;
  }
  return linkCustomer(user.id, customer.id);
}
