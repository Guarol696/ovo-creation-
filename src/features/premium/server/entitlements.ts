import "server-only";
import { unstable_rethrow } from "next/navigation";
import { cache } from "react";
import type { FeatureId } from "@/config/premium";
import { getCurrentUser } from "@/features/auth/server/session";
import { createClient } from "@/lib/supabase/server";
import {
  FREE_ENTITLEMENTS,
  hasFeatureAccess,
  resolveEntitlements,
  SUBSCRIPTION_COLUMNS,
  type Entitlements,
  type SubscriptionRow,
} from "../plan";

export interface UserEntitlements extends Entitlements {
  signedIn: boolean;
  /** Un client Stripe existe pour ce compte (portail de gestion disponible). */
  hasBillingAccount: boolean;
}

/**
 * Droits de l'utilisateur, décidés côté serveur à partir de la table
 * `subscriptions`, synchronisée avec Stripe par le webhook (l'utilisateur ne
 * peut pas la modifier, voir RLS).
 * En cas d'erreur, on retombe sur l'offre gratuite (jamais l'inverse).
 */
export const getEntitlements = cache(async (): Promise<UserEntitlements> => {
  const user = await getCurrentUser();
  if (!user) return { ...FREE_ENTITLEMENTS, signedIn: false, hasBillingAccount: false };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("subscriptions")
      .select(`${SUBSCRIPTION_COLUMNS}, stripe_customer_id`)
      .eq("user_id", user.id)
      .maybeSingle<SubscriptionRow & { stripe_customer_id: string | null }>();
    if (error) throw error;
    return {
      ...resolveEntitlements(data),
      signedIn: true,
      hasBillingAccount: Boolean(data?.stripe_customer_id),
    };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[premium] lecture de l'abonnement impossible", error);
    return { ...FREE_ENTITLEMENTS, signedIn: true, hasBillingAccount: false };
  }
});

/**
 * Vérification serveur d'une fonctionnalité pour l'utilisateur connecté
 * (routes, Server Actions, composants serveur) : `hasFeatureAccess` appliqué
 * aux droits lus en base, jamais à une donnée envoyée par le navigateur.
 */
export async function canUseFeature(feature: FeatureId) {
  return hasFeatureAccess(await getEntitlements(), feature);
}
