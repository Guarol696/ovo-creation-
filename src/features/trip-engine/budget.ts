import type { BudgetStatus, ComfortTier, EstimatedBudget } from "@/types/travel-plan";
import type { DestinationProfile } from "./data-source/types";
import type { Preferences } from "./preferences";

/**
 * Estimation du budget à partir des coûts indicatifs d'une destination.
 * Montants de DÉMONSTRATION : jamais présentés comme des prix réels.
 */

/** Les enfants consomment un peu moins (repas, activités). */
const CHILD_FACTOR = 0.7;
/** Les enfants partagent la chambre des adultes. */
const CHILD_ROOM_FACTOR = 0.5;
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

export interface BudgetBreakdownInput {
  profile: DestinationProfile;
  prefs: Preferences;
  tier: ComfortTier;
  /** Coût réel des activités du programme, par personne (sinon estimation). */
  activitiesPerPerson?: number;
}

export function estimateBudget({ profile, prefs, tier, activitiesPerPerson }: BudgetBreakdownInput) {
  const { costs, access } = profile;
  const people = prefs.travelers;
  const eaters = effectiveEaters(prefs);
  // Au-delà de 4 voyageurs, on loue un appartement : un peu moins cher par personne.
  const groupDiscount = people >= 4 ? 0.9 : 1;
  const sleepers = prefs.adults + prefs.children * CHILD_ROOM_FACTOR;

  const activitiesPP = activitiesPerPerson ?? averageActivityCost(profile) * ACTIVITIES_PER_DAY * prefs.days;

  const transport = access.roundTripPerPerson * people + costs.localTransportPerDay * prefs.days * people;
  const accommodation = costs.accommodationPerNight[tier] * prefs.nights * sleepers * groupDiscount;
  const food = costs.foodPerDay[tier] * prefs.days * eaters;
  const activities = activitiesPP * eaters;
  const other = (transport + accommodation + food + activities) * OTHER_RATE;

  const breakdown = {
    transport: roundTo10(transport),
    accommodation: roundTo10(accommodation),
    food: roundTo10(food),
    activities: roundTo10(activities),
    other: roundTo10(other),
  };
  const total = Object.values(breakdown).reduce((sum, v) => sum + v, 0);
  return { breakdown, total, perPerson: roundTo10(total / people) };
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

export function buildEstimatedBudget(input: Required<BudgetBreakdownInput>): EstimatedBudget {
  const { breakdown, total, perPerson } = estimateBudget(input);
  const { prefs, profile } = input;
  return {
    currency: "EUR",
    breakdown,
    total,
    perPerson,
    tier: input.tier,
    userBudget: {
      min: prefs.budget.min,
      max: Number.isFinite(prefs.budget.max) ? prefs.budget.max : null,
    },
    status: budgetStatus(total, prefs),
    source: profile.source,
  };
}
