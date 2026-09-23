import type { ReactNode } from "react";
import { planIncludes, type FeatureId } from "@/config/premium";
import { getEntitlements } from "../server/entitlements";
import { PremiumLockedCard } from "./premium-locked-card";

interface PremiumFeatureProps {
  feature: FeatureId;
  children: ReactNode;
  /** Affiché aux utilisateurs sans accès (par défaut : carte « Fonctionnalité Premium »). */
  fallback?: ReactNode;
}

/**
 * Protège une fonctionnalité selon `FEATURES` (config/premium.ts).
 * Composant serveur : la décision vient de la base (table `subscriptions`),
 * jamais d'une variable du navigateur. Les routes et actions concernées
 * revérifient les droits avec `canUseFeature` (défense en profondeur).
 */
export async function PremiumFeature({ feature, children, fallback }: PremiumFeatureProps) {
  const { plan } = await getEntitlements();
  if (planIncludes(plan, feature)) return <>{children}</>;
  return <>{fallback ?? <PremiumLockedCard feature={feature} />}</>;
}
