import { formatMonthFr } from "@/lib/dates";
import { ambianceOptions, travelStyleOptions } from "@/lib/trip/options";
import { formatPrice } from "@/lib/utils";
import type { PlanHighlight, TransportOption, TravelBudget } from "@/types/travel-plan";
import type { DestinationProfile } from "./data-source/types";
import type { ItineraryResult } from "./itinerary";
import type { Preferences } from "./preferences";

/**
 * Textes explicatifs à partir des préférences — sans jamais exposer
 * le score technique.
 */

const styleLabel = (id: string) => travelStyleOptions.find((o) => o.id === id)?.label.toLowerCase() ?? id;
const ambianceLabel = (id: string) => ambianceOptions.find((o) => o.id === id)?.label.toLowerCase() ?? id;

function joinFr(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} et ${items.at(-1)}`;
}

export function buildReasons(
  profile: DestinationProfile,
  prefs: Preferences,
  budget: TravelBudget,
  recommended: boolean,
  transport: TransportOption,
): string[] {
  const reasons: string[] = [];
  const matchedStyles = prefs.styles.filter((s) => (profile.styles[s] ?? 0) >= 2);

  if (!recommended) {
    reasons.push(`Tu avais choisi ${profile.name} : on a construit tout le programme autour de tes envies.`);
  } else if (matchedStyles.length > 0) {
    reasons.push(
      `Parmi nos destinations, ${profile.name} est celle qui colle le mieux à ton envie de ${joinFr(matchedStyles.map(styleLabel))}.`,
    );
  } else {
    reasons.push(
      `${profile.name} offre le meilleur équilibre entre tes envies, ton budget et la durée du séjour.`,
    );
  }

  const matchedAmbiances = [...prefs.ambiances].filter((a) => (profile.ambiances[a] ?? 0) >= 2);
  if (matchedAmbiances.length > 0) {
    reasons.push(
      `L'ambiance y est ${joinFr(matchedAmbiances.map(ambianceLabel))}, exactement ce que tu recherches.`,
    );
  }

  if (budget.status === "within") {
    const limit = budget.userBudget.max;
    reasons.push(
      limit
        ? `Le budget estimé (≈ ${formatPrice(budget.perPerson)} par personne) rentre dans ton enveloppe.`
        : `Le budget estimé est d'environ ${formatPrice(budget.perPerson)} par personne.`,
    );
  }

  const { min, max } = profile.idealDays;
  if (profile.source === "demo" && prefs.days >= min && prefs.days <= max) {
    reasons.push(`${prefs.days} jours, c'est le format idéal pour profiter de ${profile.name} sans courir.`);
  }

  if (prefs.priorities.has("rapidite") && transport.durationHours <= 3.5) {
    reasons.push(`Accès rapide : ${transport.durationLabel} depuis ${transport.from}.`);
  }

  if (prefs.month !== null && profile.bestMonths.includes(prefs.month)) {
    reasons.push(
      `${capitalize(formatMonthFr(`2000-${String(prefs.month).padStart(2, "0")}`).replace(" 2000", ""))} est une très bonne période pour y aller.`,
    );
  }

  if (prefs.wishStyles.length > 0) {
    reasons.push(`On a tenu compte de ton envie particulière (${joinFr(prefs.wishStyles.map(styleLabel))}).`);
  }

  return reasons.slice(0, 5);
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function buildWarnings(
  profile: DestinationProfile,
  prefs: Preferences,
  budget: TravelBudget,
): string[] {
  const warnings: string[] = [];
  if (budget.status === "tight") {
    warnings.push(
      `Budget un peu serré : compte environ ${formatPrice(budget.perPerson)} par personne. Partir hors saison ou réduire d'une nuit peut suffire à rentrer dans ton enveloppe.`,
    );
  } else if (budget.status === "over") {
    warnings.push(
      `Avec ton budget, ce voyage risque d'être difficile : compte environ ${formatPrice(budget.perPerson)} par personne, même en version économique. Pense à raccourcir le séjour ou à choisir une destination plus abordable.`,
    );
  }
  if (
    prefs.month !== null &&
    profile.bestMonths.length > 0 &&
    !profile.bestMonths.includes(prefs.month) &&
    (profile.type === "balneaire" || prefs.styles.includes("plage"))
  ) {
    warnings.push(
      "À cette période, la mer peut être fraîche : les activités plage sont à confirmer selon la météo.",
    );
  }
  if (profile.source === "generic") {
    warnings.push(
      `OVO n'a pas encore d'adresses détaillées pour ${profile.name} : ce programme est un modèle à adapter sur place.`,
    );
  }
  return warnings;
}

/** Moments forts : incontournables et meilleure table effectivement programmés. */
export function buildHighlights(itinerary: ItineraryResult): PlanHighlight[] {
  const scheduledActivities = itinerary.activities
    .filter((a) => a.schedule.length > 0 && a.highlight)
    .sort((a, b) => b.relevance - a.relevance);

  const highlights: PlanHighlight[] = scheduledActivities.slice(0, 4).map((activity) => ({
    emoji: activity.emoji,
    title: activity.highlight!,
    description: activity.description,
  }));

  const bestRestaurant = itinerary.restaurants
    .filter((r) => r.schedule.length > 0)
    .sort((a, b) => b.priceLevel - a.priceLevel || b.relevance - a.relevance)[0];
  if (bestRestaurant) {
    highlights.push({
      emoji: "🍽️",
      title: `Dîner chez ${bestRestaurant.name}`,
      description: `${bestRestaurant.cuisine} — ${bestRestaurant.description}`,
    });
  }
  return highlights.slice(0, 5);
}

export function buildSummary(profile: DestinationProfile, prefs: Preferences): string {
  const styles = prefs.styles.slice(0, 3).map(styleLabel);
  const who =
    prefs.travelers === 1
      ? "en solo"
      : prefs.children > 0
        ? `en famille (${prefs.travelers} personnes)`
        : `à ${prefs.travelers}`;
  const ambiance = [...prefs.ambiances].slice(0, 2).map(ambianceLabel);
  return `${prefs.days} jours à ${profile.name} ${who}, entre ${joinFr(styles)}${
    ambiance.length ? ` — un voyage à l'ambiance ${joinFr(ambiance)}` : ""
  }, pensé pour ton budget.`;
}
