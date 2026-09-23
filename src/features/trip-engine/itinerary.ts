import { addDays } from "@/lib/dates";
import type {
  ActivityCategory,
  ComfortTier,
  DayPeriod,
  ItineraryDay,
  ItinerarySlot,
  PlanActivity,
  PlanRestaurant,
} from "@/types/travel-plan";
import type { TripRequest } from "@/types/trip";
import { effectiveEaters } from "./budget";
import type {
  ActivityTemplate,
  DestinationProfile,
  Moment,
  Neighborhood,
  RestaurantTemplate,
} from "./data-source/types";
import type { Preferences } from "./preferences";

/**
 * Construction du programme jour par jour.
 * Chaque créneau (matin, midi, après-midi, soir) reçoit l'activité ou le
 * restaurant le plus compatible avec les préférences, sans répétition.
 */

export interface ItineraryResult {
  days: ItineraryDay[];
  activities: PlanActivity[];
  restaurants: PlanRestaurant[];
  /** Somme des activités du programme, par personne. */
  activitiesCostPerPerson: number;
  /** Score de chaque activité retenue (pour choisir les moments forts). */
  activityScores: Map<string, number>;
}

interface BuildInput {
  profile: DestinationProfile;
  prefs: Preferences;
  tier: ComfortTier;
  request: TripRequest;
  neighborhood: Neighborhood;
}

const DAY_TITLES: Record<ActivityCategory, string> = {
  monument: "Histoire & grands monuments",
  musee: "Plongée dans la culture",
  quartier: "Flânerie en ville",
  panorama: "Vues imprenables",
  plage: "Cap sur la plage",
  nature: "Grand air",
  aventure: "Journée aventure",
  nightlife: "Journée tranquille, nuit animée",
  food: "Tour gourmand",
  shopping: "Shopping & pépites",
  detente: "Journée cocooning",
  evenement: "Culture & spectacle",
  excursion: "Escapade hors de la ville",
};

const toPlanActivity = (a: ActivityTemplate, source: PlanActivity["source"]): PlanActivity => ({
  id: a.id,
  name: a.name,
  description: a.description,
  category: a.category,
  emoji: a.emoji,
  estimatedCostPerPerson: a.cost,
  durationHours: a.hours,
  area: a.area,
  source,
});

const toPlanRestaurant = (r: RestaurantTemplate, source: PlanRestaurant["source"]): PlanRestaurant => ({
  id: r.id,
  name: r.name,
  description: r.description,
  priceLevel: r.priceLevel,
  estimatedCostPerPerson: r.cost,
  area: r.area,
  source,
});

/** Nombre de journées d'excursion selon la durée du séjour. */
function excursionCount(days: number) {
  if (days >= 9) return 3;
  if (days >= 7) return 2;
  if (days >= 4) return 1;
  return 0;
}

export function buildItinerary({ profile, prefs, tier, request, neighborhood }: BuildInput): ItineraryResult {
  const source = profile.source;
  const usage = new Map<string, number>();
  const restaurantUsage = new Map<string, number>();
  const activityScores = new Map<string, number>();
  const usedActivities = new Map<string, PlanActivity>();
  const usedRestaurants = new Map<string, PlanRestaurant>();

  // --- Scores ---------------------------------------------------------------
  function activityScore(a: ActivityTemplate) {
    let score = prefs.categoryWeights[a.category];
    score += a.tags.reduce((sum, tag) => sum + prefs.styleWeights[tag], 0) * 0.8;
    // Les incontournables de la destination passent en priorité.
    if (a.highlight) score += 1.2;
    if (tier === "eco" && a.cost > 35) score -= 1.5;
    if (prefs.prefersEconomy && a.cost === 0) score += 0.5;
    if (prefs.children > 0 && a.category === "nightlife") score -= 4;
    return score;
  }

  function restaurantScore(r: RestaurantTemplate, meal: "lunch" | "dinner") {
    const tierMatch: Record<ComfortTier, Record<1 | 2 | 3, number>> = {
      eco: { 1: 2, 2: 0.5, 3: -3 },
      standard: { 1: 1, 2: 2, 3: -0.5 },
      confort: { 1: 0.3, 2: 1.5, 3: 2 },
    };
    let score = tierMatch[tier][r.priceLevel];
    score += r.tags.reduce((sum, tag) => sum + prefs.styleWeights[tag], 0) * 0.7;
    if (meal === "dinner" && r.priceLevel === 3 && prefs.styles.includes("gastronomie") && tier !== "eco")
      score += 1;
    score -= (restaurantUsage.get(r.id) ?? 0) * 1.5;
    return score;
  }

  // --- Sélection ------------------------------------------------------------
  interface PickOptions {
    maxHours?: number;
    bonus?: Partial<Record<ActivityCategory, number>>;
    minScore?: number;
    avoid?: ActivityCategory[];
  }

  function pickActivity(moment: Moment, options: PickOptions = {}): ActivityTemplate | null {
    const { maxHours, bonus = {}, minScore = 0.4, avoid = [] } = options;
    let best: { activity: ActivityTemplate; score: number } | null = null;

    for (const activity of profile.activities) {
      if (activity.fullDay || !activity.moments.includes(moment)) continue;
      if (maxHours !== undefined && activity.hours > maxHours) continue;
      const times = usage.get(activity.id) ?? 0;
      if (times > 0 && !activity.repeatable) continue;
      // Sur un long séjour, on peut retourner une fois de plus à la plage ou au parc.
      if (times >= (prefs.days >= 8 ? 3 : 2)) continue;

      let score = activityScore(activity) + (bonus[activity.category] ?? 0) - times * 1.5;
      if (avoid.includes(activity.category)) score -= 1.2;
      if (!best || score > best.score) best = { activity, score };
    }
    if (!best || best.score < minScore) return null;
    return best.activity;
  }

  function takeActivity(activity: ActivityTemplate) {
    usage.set(activity.id, (usage.get(activity.id) ?? 0) + 1);
    activityScores.set(activity.id, activityScore(activity));
    const plan = toPlanActivity(activity, source);
    usedActivities.set(activity.id, plan);
    return plan;
  }

  function pickRestaurant(meal: "lunch" | "dinner"): PlanRestaurant | undefined {
    const candidates = profile.restaurants.filter((r) => r.meals.includes(meal));
    if (candidates.length === 0) return undefined;
    const best = candidates.reduce((a, b) => (restaurantScore(b, meal) > restaurantScore(a, meal) ? b : a));
    restaurantUsage.set(best.id, (restaurantUsage.get(best.id) ?? 0) + 1);
    const plan = toPlanRestaurant(best, source);
    usedRestaurants.set(best.id, plan);
    return plan;
  }

  // --- Slots ----------------------------------------------------------------
  const activitySlot = (period: DayPeriod, activity: PlanActivity): ItinerarySlot => ({
    period,
    title: activity.name,
    description: activity.description,
    activity,
    estimatedCostPerPerson: activity.estimatedCostPerPerson,
  });

  const freeSlot = (period: DayPeriod, title: string, description: string): ItinerarySlot => ({
    period,
    title,
    description,
    estimatedCostPerPerson: 0,
  });

  const mealSlot = (period: DayPeriod, restaurant?: PlanRestaurant): ItinerarySlot =>
    restaurant
      ? {
          period,
          title: restaurant.name,
          description: restaurant.description,
          restaurant,
          estimatedCostPerPerson: restaurant.estimatedCostPerPerson,
        }
      : freeSlot(period, "Déjeuner sur le pouce", "Une pause rapide pour recharger les batteries.");

  // --- Excursions -----------------------------------------------------------
  const excursions = profile.activities
    .filter((a) => a.fullDay)
    .map((a) => ({ activity: a, score: activityScore(a) }))
    .filter((e) => e.score >= (prefs.days >= 7 ? 2 : 2.5))
    .sort((a, b) => b.score - a.score)
    .slice(0, excursionCount(prefs.days));
  // Réparties au milieu du séjour, jamais le jour d'arrivée ou de départ.
  const excursionDays = new Map<number, ActivityTemplate>();
  excursions.forEach((excursion, index) => {
    const day = Math.round(((index + 1) * prefs.days) / (excursions.length + 1)) + 1;
    if (day > 1 && day < prefs.days && !excursionDays.has(day)) excursionDays.set(day, excursion.activity);
  });

  // --- Construction jour par jour ------------------------------------------
  const days: ItineraryDay[] = [];
  const wantsNightlife = prefs.nightlife >= 2.5 && prefs.children === 0;
  const transportLabel = profile.access.mode === "train" ? "Train" : "Vol";
  const startDate = request.dates.mode === "fixed" ? request.dates.departureDate : null;
  let previousNightOut = false;

  for (let day = 1; day <= prefs.days; day++) {
    const isArrival = day === 1;
    const isDeparture = day === prefs.days;
    const excursion = excursionDays.get(day);
    const slots: ItinerarySlot[] = [];
    const dayCategories: ActivityCategory[] = [];
    const track = (a: ActivityTemplate | null) => {
      if (a) dayCategories.push(a.category);
      return a;
    };

    // Matin
    if (isArrival) {
      slots.push(
        freeSlot(
          "morning",
          `Arrivée à ${profile.name}`,
          `${transportLabel} depuis ${profile.access.from} (${profile.access.durationLabel}), puis installation dans le quartier ${neighborhood.name}.`,
        ),
      );
    } else if (excursion) {
      slots.push(activitySlot("morning", takeActivity(excursion)));
      dayCategories.push("excursion");
    } else if (previousNightOut && prefs.pace !== "intense") {
      slots.push(
        freeSlot(
          "morning",
          "Grasse mat' bien méritée",
          "Réveil en douceur et café en terrasse après la soirée.",
        ),
      );
    } else if (prefs.pace === "relaxed" && day % 2 === 0) {
      slots.push(
        freeSlot(
          "morning",
          "Matinée tranquille",
          `Petit-déjeuner qui traîne et balade sans but dans ${neighborhood.name}.`,
        ),
      );
    } else {
      const morning = track(pickActivity("morning", { maxHours: isDeparture ? 2.5 : undefined }));
      slots.push(
        morning
          ? activitySlot("morning", takeActivity(morning))
          : freeSlot("morning", "Matinée libre", "Temps libre pour flâner à ton rythme."),
      );
    }

    // Midi
    slots.push(
      excursion
        ? freeSlot(
            "lunch",
            "Déjeuner pendant l'excursion",
            "Pique-nique ou petite adresse locale sur la route.",
          )
        : mealSlot("lunch", pickRestaurant("lunch")),
    );

    // Après-midi
    if (isDeparture) {
      slots.push(
        freeSlot(
          "afternoon",
          "Retour",
          `Dernier café, puis direction ${profile.access.mode === "train" ? "la gare" : "l'aéroport"} pour le retour.`,
        ),
      );
    } else if (excursion) {
      slots.push(
        freeSlot("afternoon", "Suite de l'excursion", "Fin de journée sur place, puis retour en ville."),
      );
    } else {
      const bonus: Partial<Record<ActivityCategory, number>> = isArrival
        ? { quartier: 1.5, panorama: 1, food: 1 }
        : prefs.pace === "relaxed"
          ? { detente: 2, plage: 1.5 }
          : {};
      const afternoon = track(
        pickActivity("afternoon", {
          bonus,
          maxHours: isArrival ? 3 : undefined,
          avoid: dayCategories,
          minScore: prefs.pace === "relaxed" ? 1 : 0.4,
        }),
      );
      slots.push(
        afternoon
          ? activitySlot("afternoon", takeActivity(afternoon))
          : freeSlot("afternoon", "Temps libre", "Repos, shopping ou sieste : c'est toi qui décides."),
      );
    }

    // Soir
    previousNightOut = false;
    if (!isDeparture) {
      const dinner = pickRestaurant("dinner");
      const evening = track(
        pickActivity("evening", {
          bonus: wantsNightlife ? { nightlife: 2 } : {},
          minScore: wantsNightlife ? 1 : 1.8,
        }),
      );
      const eveningActivity = evening ? takeActivity(evening) : undefined;
      if (eveningActivity?.category === "nightlife") previousNightOut = true;

      const parts = [
        dinner ? `Dîner : ${dinner.name.toLowerCase()}.` : "",
        eveningActivity?.description ?? "",
      ];
      slots.push({
        period: "evening",
        title: eveningActivity?.name ?? (dinner ? `Dîner — ${dinner.name}` : "Soirée libre"),
        description: parts.filter(Boolean).join(" ") || "Soirée libre.",
        activity: eveningActivity,
        restaurant: dinner,
        estimatedCostPerPerson:
          (eveningActivity?.estimatedCostPerPerson ?? 0) + (dinner?.estimatedCostPerPerson ?? 0),
      });
    }

    // Titre, description et coûts de la journée
    const mainActivities = slots.filter((s) => s.activity).map((s) => s.activity!);
    const main =
      excursion ??
      profile.activities.find((a) => a.id === mainActivities.find((m) => m.category !== "nightlife")?.id);
    const title = isArrival
      ? "Arrivée & premiers pas"
      : isDeparture
        ? `Derniers moments à ${profile.name}`
        : excursion
          ? excursion.name
          : main
            ? `${DAY_TITLES[main.category]}${main.area ? ` · ${main.area}` : ""}`
            : "Journée libre";

    const names = mainActivities.map((a) => a.name);
    const description =
      names.length === 0
        ? "Pas de programme imposé : retourne à ton spot préféré ou laisse-toi porter."
        : `Au programme : ${names.length > 1 ? `${names.slice(0, -1).join(", ")} et ${names.at(-1)}` : names[0]}.`;

    const costPerPerson =
      slots.reduce((sum, slot) => sum + slot.estimatedCostPerPerson, 0) + profile.costs.localTransportPerDay;

    days.push({
      dayNumber: day,
      date: startDate ? addDays(startDate, day - 1) : null,
      title,
      description,
      slots,
      estimatedCostPerPerson: Math.round(costPerPerson),
      estimatedCostTotal: Math.round(costPerPerson * effectiveEaters(prefs)),
    });
  }

  const activitiesCostPerPerson = [...usage.entries()].reduce((sum, [id, times]) => {
    const activity = profile.activities.find((a) => a.id === id);
    return sum + (activity?.cost ?? 0) * times;
  }, 0);

  return {
    days,
    activities: [...usedActivities.values()],
    restaurants: [...usedRestaurants.values()],
    activitiesCostPerPerson,
    activityScores,
  };
}
