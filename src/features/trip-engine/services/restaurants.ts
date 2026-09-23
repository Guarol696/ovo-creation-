import type { ComfortTier, PlanRestaurant, RestaurantKind } from "@/types/travel-plan";
import type { DestinationProfile, RestaurantTemplate } from "../data-source/types";
import type { Preferences } from "../preferences";

/**
 * Service restaurants.
 *
 *   restaurants de démo (FICTIFS, noms « OVO »)
 *     → note de pertinence selon le budget et le style
 *     → liste classée de PlanRestaurant, dans laquelle pioche l'itinéraire
 *
 * Une vraie API de restaurants implémentera simplement `RestaurantProvider`.
 */

export interface RestaurantContext {
  profile: DestinationProfile;
  prefs: Preferences;
  tier: ComfortTier;
}

export interface RestaurantProvider {
  readonly id: string;
  getRestaurants(context: RestaurantContext): Promise<PlanRestaurant[]>;
}

export const RESTAURANT_KINDS: Record<RestaurantKind, string> = {
  "street-food": "Street food",
  local: "Cuisine locale",
  bistrot: "Bistrot",
  gastronomique: "Gastronomique",
  bar: "Bar & petites assiettes",
};

const RECOMMENDED_THRESHOLD = 2;

/** Adéquation gamme de prix / niveau de confort du voyage. */
const TIER_MATCH: Record<ComfortTier, Record<1 | 2 | 3, number>> = {
  eco: { 1: 2, 2: 0.5, 3: -3 },
  standard: { 1: 1, 2: 2, 3: -0.5 },
  confort: { 1: 0.3, 2: 1.5, 3: 2 },
};

const roundTo5 = (value: number) => Math.round(value / 5) * 5;

function hash(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Pertinence d'un restaurant (règles simples) : petit budget → street food,
 * budget élevé → adresses premium, styles gastronomie / fête / romantique
 * → adresses correspondantes.
 */
export function restaurantRelevance(restaurant: RestaurantTemplate, prefs: Preferences, tier: ComfortTier) {
  let score = TIER_MATCH[tier][restaurant.priceLevel];
  score += restaurant.tags.reduce((sum, tag) => sum + prefs.styleWeights[tag], 0) * 0.7;
  if (prefs.styles.includes("gastronomie") && restaurant.kind === "gastronomique" && tier !== "eco")
    score += 1;
  if (prefs.prefersEconomy && restaurant.kind === "street-food") score += 0.8;
  if (prefs.ambiances.has("authentique") && restaurant.isLocal) score += 0.5;
  return Math.round(score * 100) / 100;
}

/** Quartier indicatif : celui du restaurant, sinon un quartier à l'ambiance compatible. */
function areaOf(restaurant: RestaurantTemplate, profile: DestinationProfile) {
  if (restaurant.area) return restaurant.area;
  const match = profile.neighborhoods.find((n) => restaurant.tags.some((tag) => n.tags.includes(tag)));
  return (match ?? profile.neighborhoods[0])?.name;
}

export function toPlanRestaurant(
  restaurant: RestaurantTemplate,
  relevance: number,
  profile: DestinationProfile,
): PlanRestaurant {
  const base = { 1: 4.1, 2: 4.3, 3: 4.6 }[restaurant.priceLevel];
  return {
    id: restaurant.id,
    name: restaurant.name,
    description: restaurant.description,
    cuisine: restaurant.cuisine,
    emoji: restaurant.emoji,
    kind: restaurant.kind,
    isLocal: restaurant.isLocal,
    priceLevel: restaurant.priceLevel,
    estimatedCostPerPerson: restaurant.cost,
    priceRange: {
      min: Math.max(5, roundTo5(restaurant.cost * 0.75)),
      max: Math.max(10, roundTo5(restaurant.cost * 1.3)),
    },
    rating: Math.min(4.9, Math.round((base + (hash(profile.id + restaurant.id) % 3) * 0.1) * 10) / 10),
    meals: restaurant.meals,
    area: areaOf(restaurant, profile),
    tags: restaurant.tags,
    relevance,
    recommended: relevance >= RECOMMENDED_THRESHOLD,
    schedule: [],
    source: profile.source,
  };
}

/** Fournisseur de DÉMONSTRATION : restaurants fictifs, notes et prix indicatifs. */
export const demoRestaurantProvider: RestaurantProvider = {
  id: "ovo-demo-restaurants",
  async getRestaurants({ profile, prefs, tier }) {
    return profile.restaurants
      .map((r) => toPlanRestaurant(r, restaurantRelevance(r, prefs, tier), profile))
      .sort((a, b) => b.relevance - a.relevance);
  },
};
