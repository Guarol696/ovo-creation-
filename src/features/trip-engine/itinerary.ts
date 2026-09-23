import { addDays } from "@/lib/dates";
import type {
  ActivityCategory,
  ActivityMoment,
  ComfortTier,
  DayPeriod,
  ItineraryDay,
  ItinerarySlot,
  Meal,
  PlanActivity,
  PlanRestaurant,
  TransportMode,
  TransportOption,
} from "@/types/travel-plan";
import type { TripRequest } from "@/types/trip";
import { effectiveEaters } from "./budget";
import type { DestinationProfile, Neighborhood } from "./data-source/types";
import type { Preferences } from "./preferences";

/**
 * Construction du programme jour par jour.
 *
 * Le programme pioche UNIQUEMENT dans les activités et restaurants fournis
 * par les services (et donc présents dans le TravelPlan) : chaque élément
 * reçoit en retour la liste des moments où il est programmé (`schedule`).
 *
 * Journée type : matin · midi · après-midi · soir (dîner) · nuit (sortie).
 */

export interface ItineraryResult {
  days: ItineraryDay[];
  /** Toutes les activités proposées, avec leur place dans le programme. */
  activities: PlanActivity[];
  /** Tous les restaurants proposés, avec leur place dans le programme. */
  restaurants: PlanRestaurant[];
  /** Somme des activités programmées, par personne. */
  activitiesCostPerPerson: number;
  paidActivitiesCount: number;
  /** Somme des repas programmés (restaurants, pique-niques), par personne. */
  mealsCostPerPerson: number;
  mealsCount: number;
}

interface BuildInput {
  profile: DestinationProfile;
  prefs: Preferences;
  tier: ComfortTier;
  request: TripRequest;
  neighborhood: Neighborhood;
  /** Trajet retenu, pour décrire l'arrivée et le départ. */
  transport: TransportOption;
  /** Activités classées par le service activités. */
  activities: PlanActivity[];
  /** Restaurants classés par le service restaurants. */
  restaurants: PlanRestaurant[];
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

const ARRIVAL_LABELS: Record<TransportMode, { trip: string; back: string }> = {
  avion: { trip: "Vol", back: "puis direction l'aéroport pour le retour" },
  train: { trip: "Train", back: "puis direction la gare pour le retour" },
  bus: { trip: "Bus", back: "puis direction la gare routière pour le retour" },
  voiture: { trip: "Route", back: "puis on reprend la route" },
};

/** Déjeuner sans restaurant (pique-nique, excursion), par personne. */
const PICNIC_COST: Record<ComfortTier, number> = { eco: 10, standard: 14, confort: 20 };

/** Nombre de journées d'excursion selon la durée du séjour. */
function excursionCount(days: number) {
  if (days >= 9) return 3;
  if (days >= 7) return 2;
  if (days >= 4) return 1;
  return 0;
}

interface PickOptions {
  maxHours?: number;
  bonus?: Partial<Record<ActivityCategory, number>>;
  minScore?: number;
  avoid?: ActivityCategory[];
  only?: ActivityCategory[];
  exclude?: ActivityCategory[];
}

export function buildItinerary(input: BuildInput): ItineraryResult {
  const { profile, prefs, tier, request, neighborhood, transport } = input;

  // Copies locales : on y inscrit la place de chaque élément dans le programme.
  const activities = input.activities.map((a) => ({ ...a, schedule: [...a.schedule] }));
  const restaurants = input.restaurants.map((r) => ({ ...r, schedule: [...r.schedule] }));
  const usage = new Map<string, number>();
  const restaurantUsage = new Map<string, number>();

  // --- Sélection ------------------------------------------------------------
  function pickActivity(moment: ActivityMoment, options: PickOptions = {}): PlanActivity | null {
    const { maxHours, bonus = {}, minScore = 0.4, avoid = [], only, exclude = [] } = options;
    // On ne refait une activité (plage, parc, bar…) que sur un séjour assez long.
    const maxRepeats = prefs.days >= 8 ? 3 : prefs.days >= 5 ? 2 : 1;
    let best: { activity: PlanActivity; score: number } | null = null;

    for (const activity of activities) {
      if (activity.fullDay || !activity.moments.includes(moment)) continue;
      if (only && !only.includes(activity.category)) continue;
      if (exclude.includes(activity.category)) continue;
      if (maxHours !== undefined && activity.durationHours > maxHours) continue;
      const times = usage.get(activity.id) ?? 0;
      if (times > 0 && !activity.repeatable) continue;
      if (times >= maxRepeats) continue;

      let score = activity.relevance + (bonus[activity.category] ?? 0) - times * 1.5;
      if (avoid.includes(activity.category)) score -= 1.2;
      if (!best || score > best.score) best = { activity, score };
    }
    if (!best || best.score < minScore) return null;
    return best.activity;
  }

  function pickRestaurant(meal: Meal): PlanRestaurant | null {
    let best: { restaurant: PlanRestaurant; score: number } | null = null;
    for (const restaurant of restaurants) {
      if (!restaurant.meals.includes(meal)) continue;
      let score = restaurant.relevance - (restaurantUsage.get(restaurant.id) ?? 0) * 1.5;
      // Le midi, on reste simple ; le soir, on se fait plaisir.
      if (meal === "lunch" && restaurant.priceLevel === 3) score -= 1;
      if (
        meal === "dinner" &&
        prefs.styles.includes("romantique") &&
        restaurant.tags.includes("romantique")
      ) {
        score += 0.5;
      }
      if (!best || score > best.score) best = { restaurant, score };
    }
    return best?.restaurant ?? null;
  }

  function schedule(item: PlanActivity | PlanRestaurant, dayNumber: number, period: DayPeriod) {
    item.schedule.push({ dayNumber, period });
    if ("theme" in item) usage.set(item.id, (usage.get(item.id) ?? 0) + 1);
    else restaurantUsage.set(item.id, (restaurantUsage.get(item.id) ?? 0) + 1);
  }

  // --- Créneaux -------------------------------------------------------------
  const activitySlot = (period: DayPeriod, activity: PlanActivity): ItinerarySlot => ({
    period,
    title: activity.name,
    description: activity.description,
    activity,
    estimatedCostPerPerson: activity.estimatedCostPerPerson,
  });

  const freeSlot = (period: DayPeriod, title: string, description: string, cost = 0): ItinerarySlot => ({
    period,
    title,
    description,
    estimatedCostPerPerson: cost,
  });

  const restaurantSlot = (period: DayPeriod, restaurant: PlanRestaurant): ItinerarySlot => ({
    period,
    title: restaurant.name,
    description: `${restaurant.cuisine} — ${restaurant.description}`,
    restaurant,
    estimatedCostPerPerson: restaurant.estimatedCostPerPerson,
  });

  // --- Excursions -----------------------------------------------------------
  const excursions = activities
    .filter((a) => a.fullDay && a.relevance >= (prefs.days >= 7 ? 2 : 2.5))
    .slice(0, excursionCount(prefs.days));
  // Réparties au milieu du séjour, jamais le jour d'arrivée ou de départ.
  const excursionDays = new Map<number, PlanActivity>();
  excursions.forEach((excursion, index) => {
    const day = Math.round(((index + 1) * prefs.days) / (excursions.length + 1)) + 1;
    if (day > 1 && day < prefs.days && !excursionDays.has(day)) excursionDays.set(day, excursion);
  });

  // --- Jour par jour --------------------------------------------------------
  const days: ItineraryDay[] = [];
  const wantsNightlife = prefs.nightlife >= 2.5 && prefs.children === 0;
  const arrival = ARRIVAL_LABELS[transport.mode];
  const startDate = request.dates.mode === "fixed" ? request.dates.departureDate : null;
  let previousNightOut = false;

  for (let day = 1; day <= prefs.days; day++) {
    const isArrival = day === 1;
    const isDeparture = day === prefs.days;
    const excursion = excursionDays.get(day);
    const slots: ItinerarySlot[] = [];
    const dayCategories: ActivityCategory[] = [];

    const addActivity = (period: DayPeriod, activity: PlanActivity) => {
      schedule(activity, day, period);
      dayCategories.push(activity.category);
      slots.push(activitySlot(period, activity));
    };

    // 🌅 Matin
    if (isArrival) {
      slots.push(
        freeSlot(
          "morning",
          `Arrivée à ${profile.name}`,
          `${arrival.trip} depuis ${transport.from} (${transport.durationLabel}), puis installation dans le quartier ${neighborhood.name}.`,
        ),
      );
    } else if (excursion) {
      addActivity("morning", excursion);
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
      const morning = pickActivity("morning", { maxHours: isDeparture ? 2.5 : undefined });
      if (morning) addActivity("morning", morning);
      else slots.push(freeSlot("morning", "Matinée libre", "Temps libre pour flâner à ton rythme."));
    }

    // 🍽️ Midi
    const lunch = excursion ? null : pickRestaurant("lunch");
    if (lunch) {
      schedule(lunch, day, "lunch");
      slots.push(restaurantSlot("lunch", lunch));
    } else {
      slots.push(
        freeSlot(
          "lunch",
          excursion ? "Déjeuner pendant l'excursion" : "Déjeuner sur le pouce",
          "Pique-nique ou petite adresse sur la route.",
          PICNIC_COST[tier],
        ),
      );
    }

    // 🌆 Après-midi
    if (isDeparture) {
      slots.push(freeSlot("afternoon", "Retour", `Dernier café, ${arrival.back}.`));
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
      const afternoon = pickActivity("afternoon", {
        bonus,
        maxHours: isArrival ? 3 : undefined,
        avoid: dayCategories,
        minScore: prefs.pace === "relaxed" ? 1 : 0.4,
      });
      if (afternoon) addActivity("afternoon", afternoon);
      else
        slots.push(
          freeSlot("afternoon", "Temps libre", "Repos, shopping ou sieste : c'est toi qui décides."),
        );
    }

    // 🍴 Soir (dîner, éventuellement précédé d'un coucher de soleil ou d'un spectacle)
    previousNightOut = false;
    if (!isDeparture) {
      const dinner = pickRestaurant("dinner");
      const eveningActivity = pickActivity("evening", {
        exclude: ["nightlife"],
        minScore: wantsNightlife ? 2.4 : 1.8,
      });
      if (eveningActivity) schedule(eveningActivity, day, "evening");
      if (dinner) schedule(dinner, day, "evening");
      if (eveningActivity) dayCategories.push(eveningActivity.category);

      slots.push({
        period: "evening",
        title: eveningActivity?.name ?? dinner?.name ?? "Dîner libre",
        description: eveningActivity
          ? `${eveningActivity.description}${dinner ? ` Puis dîner chez ${dinner.name} (${dinner.cuisine.toLowerCase()}).` : ""}`
          : dinner
            ? `${dinner.cuisine} — ${dinner.description}`
            : "Soirée libre.",
        activity: eveningActivity ?? undefined,
        restaurant: dinner ?? undefined,
        estimatedCostPerPerson:
          (eveningActivity?.estimatedCostPerPerson ?? 0) + (dinner?.estimatedCostPerPerson ?? 0),
      });

      // 🌙 Nuit (sortie) — seulement si la fête fait partie du voyage.
      if (wantsNightlife) {
        const night = pickActivity("evening", {
          only: ["nightlife", "evenement"],
          bonus: { nightlife: 2 },
          minScore: 1,
        });
        if (night) {
          addActivity("night", night);
          previousNightOut = night.category === "nightlife";
        }
      }
    }

    // Titre, description et coûts de la journée
    const dayActivities = slots.filter((s) => s.activity).map((s) => s.activity!);
    const main = excursion ?? dayActivities.find((a) => a.category !== "nightlife");
    const title = isArrival
      ? "Arrivée & premiers pas"
      : isDeparture
        ? `Derniers moments à ${profile.name}`
        : excursion
          ? excursion.name
          : main
            ? `${DAY_TITLES[main.category]}${main.area ? ` · ${main.area}` : ""}`
            : "Journée libre";

    const names = dayActivities.map((a) => a.name);
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

  // --- Totaux pour le budget ------------------------------------------------
  const allSlots = days.flatMap((d) => d.slots);
  const activitiesCostPerPerson = allSlots.reduce(
    (sum, s) => sum + (s.activity?.estimatedCostPerPerson ?? 0),
    0,
  );
  const paidActivitiesCount = allSlots.filter((s) => (s.activity?.estimatedCostPerPerson ?? 0) > 0).length;
  const mealSlots = allSlots.filter((s) => s.period === "lunch" || (s.period === "evening" && s.restaurant));
  const mealsCostPerPerson = mealSlots.reduce(
    (sum, s) => sum + (s.restaurant?.estimatedCostPerPerson ?? s.estimatedCostPerPerson),
    0,
  );

  return {
    days,
    activities,
    restaurants,
    activitiesCostPerPerson,
    paidActivitiesCount,
    mealsCostPerPerson,
    mealsCount: mealSlots.length,
  };
}
