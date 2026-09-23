import "server-only";
import { unstable_rethrow } from "next/navigation";
import { cache } from "react";
import { planIncludes, type FeatureId } from "@/config/premium";
import { getCurrentUser } from "@/features/auth/server/session";
import { createClient } from "@/lib/supabase/server";
import { FREE_ENTITLEMENTS, resolveEntitlements, type Entitlements, type SubscriptionRow } from "../plan";

export interface UserEntitlements extends Entitlements {
  signedIn: boolean;
}

/**
 * Droits de l'utilisateur, décidés côté serveur à partir de la table
 * `subscriptions` (que l'utilisateur ne peut pas modifier, voir RLS).
 * En cas d'erreur, on retombe sur l'offre gratuite (jamais l'inverse).
 */
export const getEntitlements = cache(async (): Promise<UserEntitlements> => {
  const user = await getCurrentUser();
  if (!user) return { ...FREE_ENTITLEMENTS, signedIn: false };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("subscriptions")
      .select("plan, status, started_at, expires_at")
      .eq("user_id", user.id)
      .maybeSingle<SubscriptionRow>();
    if (error) throw error;
    return { ...resolveEntitlements(data), signedIn: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[premium] lecture de l'abonnement impossible", error);
    return { ...FREE_ENTITLEMENTS, signedIn: true };
  }
});

/** Vérification serveur d'une fonctionnalité (routes, actions, composants serveur). */
export async function canUseFeature(feature: FeatureId) {
  return planIncludes((await getEntitlements()).plan, feature);
}
