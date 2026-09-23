import type {
  BudgetStatus,
  ComfortTier,
  PlanAccommodation,
  PlanTransport,
  TravelBudget,
} from "@/types/travel-plan";
import type { DestinationProfile } from "./data-source/types";
import type { Preferences } from "./preferences";
import { accommodationNightlyPrice, accommodationTypeFor } from "./services/accommodation";
import { restaurantRelevance } from "./services/restaurants";
import { recommendedRoute } from "./services/transport";

/**
 * Estimation du budget. Montants de DÉMONSTRATION : jamais présentés comme
 * des prix réels.
 *
 * - `estimateBudget` : estimation rapide (catalogue) pour classer les
 *   destinations et choisir le niveau de confort.
 * - `buildTravelBudget` : budget final, qui reprend EXACTEMENT les options de
 *   transport et d'hébergement retenues (mêmes montants que les cartes).
 */

/** Les enfants consomment un peu moins (repas, activités). */
const CHILD_FACTOR = 0.7;
/** Part « autres » : assurance, souvenirs, imprévus. */
const OTHER_RATE = 0.07;
/** Nombre moyen d'activités payantes par jour (avant construction du programme). */
const ACTIVITIES_PER_DAY = 1.6;

const roundTo10 = (value: number) => Math.round(value / 10) * 10;

export function effectiveEaters(prefs: Preferences) {
  return prefs.adults + prefs.children * CHILD_FACTOR;
}

/** Coût moyen d'une activité payante de la destination, par personne. */
function averageActivityCost(profile: DestinationProfile) {
  const paid = profile.activities.filter((a) => a.cost > 0 && !a.fullDay);
  if (paid.length === 0) return 15;
  return paid.reduce((sum, a) => sum + a.cost, 0) / paid.length;
}

interface BreakdownParts {
  /** Aller-retour pour tout le groupe. */
  transportRoundTrip: number;
  localTransportPerDayPerPerson: number;
  /** Hébergement pour tout le séjour et tout le groupe. */
  accommodation: number;
  /** Nourriture pour tout le séjour, par personne. */
  foodPerPerson: number;
  activitiesPerPerson: number;
}

function computeBreakdown(prefs: Preferences, parts: BreakdownParts) {
  const people = Math.max(1, prefs.travelers);
  const eaters = effectiveEaters(prefs);

  const transport = Math.round(
    parts.transportRoundTrip + parts.localTransportPerDayPerPerson * prefs.days * people,
  );
  const accommodation = Math.round(parts.accommodation);
  const food = roundTo10(parts.foodPerPerson * eaters);
  const activities = roundTo10(parts.activitiesPerPerson * eaters);
  const other = roundTo10((transport + accommodation + food + activities) * OTHER_RATE);

  const breakdown = { transport, accommodation, food, activities, other };
  const total = transport + accommodation + food + activities + other;
  return { breakdown, total, perPerson: Math.round(total / people) };
}

/** Petit-déjeuner + en-cas par jour et par personne (hors repas du programme). */
const BREAKFAST_PER_DAY: Record<ComfortTier, number> = { eco: 5, standard: 8, confort: 14 };
const SNACKS_PER_DAY = 4;

/** Petits-déjeuners et en-cas sur tout le séjour, par personne. */
export function snacksForTrip(prefs: Preferences, tier: ComfortTier, breakfastIncluded: boolean) {
  return (SNACKS_PER_DAY + (breakfastIncluded ? 0 : BREAKFAST_PER_DAY[tier])) * prefs.days;
}

/**
 * Coût moyen d'un repas, sur la base des restaurants que le programme
 * choisirait en priorité (même règle de pertinence que l'itinéraire).
 */
function typicalMealCost(
  profile: DestinationProfile,
  prefs: Preferences,
  tier: ComfortTier,
  meal: "lunch" | "dinner",
) {
  const ranked = profile.restaurants
    .filter((r) => r.meals.includes(meal))
    .sort((a, b) => restaurantRelevance(b, prefs, tier) - restaurantRelevance(a, prefs, tier))
    .slice(0, 3);
  if (ranked.length === 0) return 15;
  return ranked.reduce((sum, r) => sum + r.cost, 0) / ranked.length;
}

/** Estimation des repas du séjour (déjeuner chaque jour, dîner sauf le dernier soir). */
function estimateFoodPerPerson(profile: DestinationProfile, prefs: Preferences, tier: ComfortTier) {
  const lunches = prefs.days * typicalMealCost(profile, prefs, tier, "lunch");
  const dinners = Math.max(1, prefs.days - 1) * typicalMealCost(profile, prefs, tier, "dinner");
  const breakfastIncluded = accommodationTypeFor(prefs, tier) === "hotel" && tier !== "eco";
  return lunches + dinners + snacksForTrip(prefs, tier, breakfastIncluded);
}

export interface EstimateInput {
  profile: DestinationProfile;
  prefs: Preferences;
  tier: ComfortTier;
  /** Coût réel des activités du programme, par personne (sinon estimation). */
  activitiesPerPerson?: number;
}

/** Estimation rapide à partir des données du catalogue (sans appel aux services). */
export function estimateBudget({ profile, prefs, tier, activitiesPerPerson }: EstimateInput) {
  const route = recommendedRoute(profile, prefs);
  const nightly = accommodationNightlyPrice(profile, prefs, tier, accommodationTypeFor(prefs, tier));
  return computeBreakdown(prefs, {
    transportRoundTrip: route.total,
    localTransportPerDayPerPerson: profile.costs.localTransportPerDay,
    accommodation: nightly * Math.max(1, prefs.nights),
    foodPerPerson: estimateFoodPerPerson(profile, prefs, tier),
    activitiesPerPerson:
      activitiesPerPerson ?? averageActivityCost(profile) * ACTIVITIES_PER_DAY * prefs.days,
  });
}

export function budgetStatus(total: number, prefs: Preferences): BudgetStatus {
  if (total <= prefs.budget.max) return "within";
  if (total <= prefs.budget.max * 1.15) return "tight";
  return "over";
}

/**
 * Choisit le niveau de confort le plus adapté : le meilleur qui tient dans
 * le budget, en respectant les envies (économique / confortable).
 */
export function selectTier(profile: DestinationProfile, prefs: Preferences): ComfortTier {
  const fits = (tier: ComfortTier) => estimateBudget({ profile, prefs, tier }).total <= prefs.budget.max;

  if (prefs.prefersEconomy && !prefs.prefersComfort) return "eco";

  const confortTotal = estimateBudget({ profile, prefs, tier: "confort" }).total;
  // Confort si demandé, ou si le budget minimum de l'utilisateur le couvre largement.
  if ((prefs.prefersComfort || prefs.budget.min >= confortTotal * 0.9) && fits("confort")) return "confort";
  if (fits("standard")) return "standard";
  return "eco";
}

export interface TravelBudgetInput {
  profile: DestinationProfile;
  prefs: Preferences;
  tier: ComfortTier;
  transport: PlanTransport;
  accommodation: PlanAccommodation;
  /** Totaux issus du programme (activités et repas réellement prévus). */
  itinerary: {
    activitiesCostPerPerson: number;
    paidActivitiesCount: number;
    mealsCostPerPerson: number;
    mealsCount: number;
  };
}

/** Budget final : reprend les options de transport et d'hébergement retenues. */
export function buildTravelBudget({
  profile,
  prefs,
  tier,
  transport,
  accommodation,
  itinerary,
}: TravelBudgetInput): TravelBudget {
  // Petit-déjeuner inclus dans l'hébergement : il ne reste que les en-cas.
  const breakfastIncluded = accommodation.main.amenities.includes("Petit-déjeuner");
  const snacksPerPerson = snacksForTrip(prefs, tier, breakfastIncluded);

  const { breakdown, total, perPerson } = computeBreakdown(prefs, {
    transportRoundTrip: transport.main.estimatedRoundTripTotal,
    localTransportPerDayPerPerson: transport.local.estimatedCostPerDayPerPerson,
    accommodation: accommodation.main.estimatedTotal,
    foodPerPerson: itinerary.mealsCostPerPerson + snacksPerPerson,
    activitiesPerPerson: itinerary.activitiesCostPerPerson,
  });
  return {
    currency: "EUR",
    breakdown,
    total,
    perPerson,
    tier,
    userBudget: {
      min: prefs.budget.min,
      max: Number.isFinite(prefs.budget.max) ? prefs.budget.max : null,
    },
    status: budgetStatus(total, prefs),
    details: {
      mealsCount: itinerary.mealsCount,
      mealsPerPerson: itinerary.mealsCostPerPerson,
      snacksPerPerson,
      paidActivitiesCount: itinerary.paidActivitiesCount,
      activitiesPerPerson: itinerary.activitiesCostPerPerson,
    },
    source: profile.source,
  };
}
