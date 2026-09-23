import type { ComfortTier, PlanAccommodation, PlanTransport } from "@/types/travel-plan";
import type { DestinationProfile, Neighborhood } from "./data-source/types";
import type { Preferences } from "./preferences";

/**
 * Hébergement et transport « types ». Ces blocs seront les premiers à être
 * remplacés par de vraies données (API d'hôtels, de vols, de trains).
 */

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

function accommodationType(tier: ComfortTier, prefs: Preferences, profile: DestinationProfile) {
  if (prefs.travelers >= 4)
    return tier === "confort" ? "Grande maison ou appartement de standing" : "Appartement pour le groupe";
  if (tier === "eco")
    return prefs.travelers === 1 ? "Auberge de jeunesse design" : "Chambre d'hôtes ou petit hôtel";
  if (tier === "standard")
    return profile.id === "marrakech" ? "Riad de charme" : "Hôtel 3★ ou appartement bien situé";
  return profile.id === "marrakech" ? "Riad de luxe avec piscine" : "Hôtel de charme 4★";
}

export function buildAccommodation(
  profile: DestinationProfile,
  prefs: Preferences,
  tier: ComfortTier,
  neighborhood: Neighborhood,
): PlanAccommodation {
  const sleepers = prefs.adults + prefs.children * 0.5;
  const discount = prefs.travelers >= 4 ? 0.9 : 1;
  return {
    type: accommodationType(tier, prefs, profile),
    area: neighborhood.name,
    description: `Quartier ${neighborhood.name} : ${neighborhood.vibe}.`,
    estimatedPricePerNight:
      Math.round((profile.costs.accommodationPerNight[tier] * sleepers * discount) / 5) * 5,
    nights: prefs.nights,
    tier,
    source: profile.source,
  };
}

export function buildTransport(profile: DestinationProfile): PlanTransport {
  return {
    toDestination: {
      mode: profile.access.mode,
      from: profile.access.from,
      durationLabel: profile.access.durationLabel,
      estimatedCostPerPerson: profile.access.roundTripPerPerson,
    },
    local: {
      description: profile.localTransport,
      estimatedCostPerDayPerPerson: profile.costs.localTransportPerDay,
    },
    source: profile.source,
  };
}
