import type {
  ActivityTheme,
  ComfortTier,
  PlanActivity,
  PriceLevel,
  RecommendedMoment,
} from "@/types/travel-plan";
import type { TravelStyle } from "@/types/trip";
import type { ActivityTemplate, DestinationProfile } from "../data-source/types";
import type { Preferences } from "../preferences";

/**
 * Service activités.
 *
 *   activités de démo (catalogue)
 *     → note de pertinence selon le profil (styles, ambiance, priorités, budget)
 *     → liste classée de PlanActivity, dans laquelle pioche l'itinéraire
 *
 * Une vraie API d'activités implémentera simplement `ActivityProvider`.
 */

export interface ActivityContext {
  profile: DestinationProfile;
  prefs: Preferences;
  tier: ComfortTier;
}

export interface ActivityProvider {
  readonly id: string;
  getActivities(context: ActivityContext): Promise<PlanActivity[]>;
}

export const ACTIVITY_THEMES: Record<ActivityTheme, { label: string; emoji: string }> = {
  culture: { label: "Culture", emoji: "🏛️" },
  nature: { label: "Nature", emoji: "🌳" },
  sorties: { label: "Sorties", emoji: "🎉" },
  aventure: { label: "Aventure", emoji: "🏄" },
  shopping: { label: "Shopping", emoji: "🛍️" },
  gastronomie: { label: "Gastronomie", emoji: "🍷" },
  evenements: { label: "Événements", emoji: "🎵" },
  detente: { label: "Détente", emoji: "😌" },
};

export const MUST_SEE_LABEL = { label: "Incontournable", emoji: "📸" } as const;

/** Seuil de pertinence au-delà duquel une activité est mise en avant. */
const RECOMMENDED_THRESHOLD = 2.5;

const THEME_BY_TAG: Partial<Record<TravelStyle, ActivityTheme>> = {
  culture: "culture",
  nature: "nature",
  plage: "nature",
  aventure: "aventure",
  fete: "sorties",
  detente: "detente",
};

export function themeOf(activity: ActivityTemplate): ActivityTheme {
  switch (activity.category) {
    case "monument":
    case "musee":
    case "quartier":
      return "culture";
    case "panorama":
    case "plage":
    case "nature":
      return "nature";
    case "aventure":
      return "aventure";
    case "nightlife":
      return "sorties";
    case "evenement":
      return "evenements";
    case "food":
      return "gastronomie";
    case "shopping":
      return "shopping";
    case "detente":
      return "detente";
    case "excursion":
      return activity.tags.map((tag) => THEME_BY_TAG[tag]).find(Boolean) ?? "nature";
  }
}

export function priceLevelOf(cost: number): PriceLevel {
  if (cost === 0) return 0;
  if (cost <= 15) return 1;
  if (cost <= 40) return 2;
  return 3;
}

export function durationLabelOf(hours: number, fullDay = false) {
  if (fullDay || hours >= 6) return "Journée";
  if (hours >= 4) return "Demi-journée";
  const low = Math.floor(hours);
  const high = Math.ceil(hours);
  return low === high ? `${low} h` : `${Math.max(1, low)}–${high} h`;
}

function bestMomentOf(activity: ActivityTemplate): RecommendedMoment {
  if (activity.fullDay) return "day";
  if (activity.category === "nightlife") return "night";
  if (activity.moments.length === 1) return activity.moments[0]!;
  return activity.moments.includes("morning") ? "morning" : activity.moments[0]!;
}

/**
 * Pertinence d'une activité pour ce voyage (règles simples).
 * Ex. style « fête » → sorties en tête ; « culture » → musées et monuments.
 */
export function activityRelevance(activity: ActivityTemplate, prefs: Preferences, tier: ComfortTier) {
  let score = prefs.categoryWeights[activity.category];
  score += activity.tags.reduce((sum, tag) => sum + prefs.styleWeights[tag], 0) * 0.8;
  // Les incontournables de la destination passent en priorité.
  if (activity.highlight) score += 1.2;
  if (tier === "eco" && activity.cost > 35) score -= 1.5;
  if (prefs.prefersEconomy && activity.cost === 0) score += 0.5;
  if (prefs.prefersComfort && activity.cost > 30) score += 0.3;
  return Math.round(score * 100) / 100;
}

export function toPlanActivity(
  activity: ActivityTemplate,
  relevance: number,
  source: PlanActivity["source"],
): PlanActivity {
  return {
    id: activity.id,
    name: activity.name,
    description: activity.description,
    category: activity.category,
    theme: themeOf(activity),
    emoji: activity.emoji,
    mustSee: Boolean(activity.highlight),
    highlight: activity.highlight,
    estimatedCostPerPerson: activity.cost,
    priceLevel: priceLevelOf(activity.cost),
    durationHours: activity.hours,
    durationLabel: durationLabelOf(activity.hours, activity.fullDay),
    moments: activity.moments,
    bestMoment: bestMomentOf(activity),
    area: activity.area,
    tags: activity.tags,
    fullDay: Boolean(activity.fullDay),
    repeatable: Boolean(activity.repeatable),
    relevance,
    recommended: relevance >= RECOMMENDED_THRESHOLD,
    schedule: [],
    source,
  };
}

/** Fournisseur de DÉMONSTRATION : activités du catalogue, prix indicatifs. */
export const demoActivityProvider: ActivityProvider = {
  id: "ovo-demo-activities",
  async getActivities({ profile, prefs, tier }) {
    return (
      profile.activities
        // Pas de sorties nocturnes proposées quand des enfants voyagent.
        .filter((a) => !(prefs.children > 0 && a.category === "nightlife"))
        .map((a) => toPlanActivity(a, activityRelevance(a, prefs, tier), profile.source))
        .sort((a, b) => b.relevance - a.relevance)
    );
  },
};
