import type { ComfortTier } from "@/types/travel-plan";
import type { DestinationProfile, Neighborhood } from "./data-source/types";
import type { Preferences } from "./preferences";

/** Quartier où loger : adapté au niveau de confort et au style de voyage. */
export function chooseNeighborhood(
  profile: DestinationProfile,
  prefs: Preferences,
  tier: ComfortTier,
): Neighborhood {
  const score = (n: Neighborhood) =>
    (n.tiers.includes(tier) ? 3 : 0) + n.tags.reduce((sum, tag) => sum + prefs.styleWeights[tag], 0);
  return profile.neighborhoods.reduce(
    (best, n) => (score(n) > score(best) ? n : best),
    profile.neighborhoods[0]!,
  );
}
