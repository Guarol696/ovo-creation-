import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SubscriptionFields } from "../stripe-mapping";

/**
 * Accès en écriture à la table `subscriptions` (rôle service, serveur uniquement).
 * L'utilisateur ne peut jamais écrire lui-même dans cette table (RLS).
 */

export interface BillingRow extends Omit<
  SubscriptionFields,
  "stripe_customer_id" | "stripe_subscription_id" | "subscription_status"
> {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: SubscriptionFields["subscription_status"] | null;
}

const COLUMNS =
  "user_id, plan, subscription_status, current_period_start, current_period_end, cancel_at_period_end, stripe_customer_id, stripe_subscription_id, stripe_price_id";

export async function getBillingRowByUser(userId: string) {
  const { data, error } = await createAdminClient()
    .from("subscriptions")
    .select(COLUMNS)
    .eq("user_id", userId)
    .maybeSingle<BillingRow>();
  if (error) throw error;
  return data;
}

export async function getBillingRowByCustomer(customerId: string) {
  const { data, error } = await createAdminClient()
    .from("subscriptions")
    .select(COLUMNS)
    .eq("stripe_customer_id", customerId)
    .maybeSingle<BillingRow>();
  if (error) throw error;
  return data;
}

/** Associe un client Stripe à un compte OVO (sans jamais remplacer une association existante). */
export async function linkCustomer(userId: string, customerId: string) {
  const admin = createAdminClient();
  const existing = await getBillingRowByUser(userId);
  if (!existing) {
    const { error } = await admin
      .from("subscriptions")
      .insert({ user_id: userId, plan: "free", stripe_customer_id: customerId, provider: "stripe" });
    if (error) throw error;
    return customerId;
  }
  if (existing.stripe_customer_id) return existing.stripe_customer_id;
  const { data, error } = await admin
    .from("subscriptions")
    .update({ stripe_customer_id: customerId, provider: "stripe" })
    .eq("user_id", userId)
    .is("stripe_customer_id", null)
    .select("stripe_customer_id")
    .maybeSingle<{ stripe_customer_id: string }>();
  if (error) throw error;
  // Mise à jour concurrente : on renvoie l'association déjà enregistrée.
  return data?.stripe_customer_id ?? (await getBillingRowByUser(userId))?.stripe_customer_id ?? customerId;
}

/** Écrit l'état de l'abonnement tel que lu chez Stripe. */
export async function saveSubscription(userId: string, fields: SubscriptionFields) {
  const { error } = await createAdminClient()
    .from("subscriptions")
    .upsert(
      { user_id: userId, ...fields, provider: "stripe", stripe_synced_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
  if (error) throw error;
}

/** Comptes liés à un client Stripe, les moins récemment synchronisés d'abord. */
export async function listBillingCustomers(limit: number) {
  const { data, error } = await createAdminClient()
    .from("subscriptions")
    .select("user_id, stripe_customer_id")
    .not("stripe_customer_id", "is", null)
    .order("stripe_synced_at", { ascending: true, nullsFirst: true })
    .limit(limit)
    .returns<{ user_id: string; stripe_customer_id: string }[]>();
  if (error) throw error;
  return data;
}

/** Abonnement enregistré que Stripe ne connaît plus : statut « annulé » (plus aucun droit). */
export async function endMissingSubscription(userId: string, subscriptionId: string) {
  const { error } = await createAdminClient()
    .from("subscriptions")
    .update({
      subscription_status: "canceled",
      cancel_at_period_end: false,
      stripe_synced_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("stripe_subscription_id", subscriptionId);
  if (error) throw error;
}
