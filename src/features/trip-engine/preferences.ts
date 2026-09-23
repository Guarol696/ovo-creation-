import { normalizeText } from "@/features/trip-builder/lib/destination-search";
import { getTotalBudgetBounds } from "@/lib/trip/budget";
import { durationOptions } from "@/lib/trip/options";
import type { ActivityCategory } from "@/types/travel-plan";
import {
  TRAVEL_STYLES,
  type Ambiance,
  type Priority,
  type TravelStyle,
  type TripRequest,
} from "@/types/trip";

/**
 * Étape 1 du moteur : transformer les réponses brutes en préférences
 * exploitables (poids par style et par type d'activité, rythme, budget…).
 */

export type Pace = "relaxed" | "balanced" | "intense";

export interface Preferences {
  styles: TravelStyle[];
  /** Poids de chaque style (choix explicite = 1, mention dans l'envie = 0,5). */
  styleWeights: Record<TravelStyle, number>;
  ambiances: Set<Ambiance>;
  priorities: Set<Priority>;
  categoryWeights: Record<ActivityCategory, number>;
  pace: Pace;
  /** Importance de la vie nocturne (0 = aucune). */
  nightlife: number;
  prefersEconomy: boolean;
  prefersComfort: boolean;
  /** Styles détectés dans l'envie particulière. */
  wishStyles: TravelStyle[];
  days: number;
  nights: number;
  adults: number;
  children: number;
  travelers: number;
  /** Budget total du groupe (max = Infinity si illimité). */
  budget: { min: number; max: number };
  /** Mois du voyage (1-12) si connu. */
  month: number | null;
}

const CATEGORY_BY_STYLE: Record<TravelStyle, Partial<Record<ActivityCategory, number>>> = {
  plage: { plage: 3, detente: 1 },
  ville: { quartier: 2, panorama: 1, shopping: 1, monument: 1 },
  fete: { nightlife: 3, evenement: 1 },
  nature: { nature: 3, excursion: 1, panorama: 1 },
  aventure: { aventure: 3, nature: 1, excursion: 1 },
  romantique: { panorama: 2, detente: 1, evenement: 1 },
  gastronomie: { food: 3 },
  culture: { musee: 3, monument: 2, quartier: 1 },
  shopping: { shopping: 3 },
  detente: { detente: 3, plage: 1 },
  festivals: { evenement: 3, nightlife: 1 },
};

const WISH_KEYWORDS: Record<TravelStyle, string[]> = {
  plage: ["plage", "mer", "sable", "baignade", "beach", "crique", "piscine"],
  ville: ["ville", "urbain", "city"],
  fete: ["fete", "soiree", "boite", "club", "nightlife", "bar", "danser", "teuf"],
  nature: ["nature", "rando", "montagne", "foret", "parc", "lac", "paysage"],
  aventure: ["aventure", "sport", "surf", "kayak", "plongee", "quad", "adrenaline"],
  romantique: ["romantique", "couple", "amoureux", "lune de miel", "a deux"],
  gastronomie: ["resto", "restaurant", "manger", "gastronomie", "food", "cuisine", "vegetarien", "vegan"],
  culture: ["musee", "histoire", "monument", "culture", "architecture", "art"],
  shopping: ["shopping", "boutique", "vintage", "friperie"],
  detente: ["calme", "repos", "detente", "spa", "hammam", "chill", "reposer"],
  festivals: ["festival", "concert", "spectacle", "musique"],
};

const FLEXIBLE_DAYS: Record<TripRequest["duration"]["id"], number> = {
  weekend: 3,
  "3-4-jours": 4,
  "5-7-jours": 6,
  "1-2-semaines": 10,
  "plus-2-semaines": 16,
};

export function detectWishStyles(wishes: string | null): TravelStyle[] {
  if (!wishes) return [];
  const text = ` ${normalizeText(wishes)} `;
  return TRAVEL_STYLES.filter((style) =>
    WISH_KEYWORDS[style].some((keyword) => new RegExp(`\\b${keyword}`).test(text)),
  );
}

export function tripDays(request: TripRequest): number {
  if (request.duration.days !== null) return request.duration.days;
  const option = durationOptions.find((o) => o.id === request.duration.id);
  return FLEXIBLE_DAYS[request.duration.id] ?? option?.minDays ?? 4;
}

function tripMonth(request: TripRequest): number | null {
  if (request.dates.mode === "fixed") return Number(request.dates.departureDate.slice(5, 7));
  return request.dates.preferredMonth ? Number(request.dates.preferredMonth.slice(5, 7)) : null;
}

export function analyzePreferences(request: TripRequest): Preferences {
  const ambiances = new Set(request.ambiances);
  const priorities = new Set(request.priorities);
  const wishStyles = detectWishStyles(request.wishes);

  const styleWeights = Object.fromEntries(TRAVEL_STYLES.map((s) => [s, 0])) as Record<TravelStyle, number>;
  for (const style of request.styles) styleWeights[style] += 1;
  for (const style of wishStyles) styleWeights[style] += 0.5;

  const categoryWeights: Record<ActivityCategory, number> = {
    monument: 0.5,
    musee: 0.3,
    quartier: 0.8,
    panorama: 0.8,
    plage: 0,
    nature: 0.2,
    aventure: 0,
    nightlife: 0,
    food: 0.5,
    shopping: 0,
    detente: 0.3,
    evenement: 0.2,
    excursion: 0.3,
  };
  for (const style of TRAVEL_STYLES) {
    const weight = styleWeights[style];
    if (!weight) continue;
    for (const [category, value] of Object.entries(CATEGORY_BY_STYLE[style])) {
      categoryWeights[category as ActivityCategory] += value * weight;
    }
  }

  const bump = (category: ActivityCategory, value: number) => (categoryWeights[category] += value);
  if (ambiances.has("calme")) {
    bump("nightlife", -2);
    bump("detente", 1);
  }
  if (ambiances.has("festive")) bump("nightlife", 2);
  if (ambiances.has("aventureuse")) {
    bump("aventure", 1.5);
    bump("excursion", 1);
  }
  if (ambiances.has("romantique")) bump("panorama", 1);
  if (ambiances.has("sociale")) {
    bump("nightlife", 1);
    bump("food", 0.5);
  }
  if (ambiances.has("authentique")) {
    bump("quartier", 1);
    bump("food", 1);
  }
  if (priorities.has("vie-nocturne")) bump("nightlife", 2);
  if (priorities.has("plages")) bump("plage", 2);
  if (priorities.has("culture")) {
    bump("musee", 1);
    bump("monument", 1);
  }
  if (priorities.has("gastronomie")) bump("food", 2);
  if (priorities.has("nature")) bump("nature", 2);
  if (priorities.has("activites")) {
    bump("aventure", 1);
    bump("excursion", 1);
  }

  const relaxed = request.styles.includes("detente") || ambiances.has("calme");
  const intense =
    priorities.has("activites") || request.styles.includes("aventure") || ambiances.has("aventureuse");
  const pace: Pace = relaxed && !intense ? "relaxed" : intense && !relaxed ? "intense" : "balanced";

  const days = Math.max(2, tripDays(request));
  const { adults, children } = request.travelers;
  const bounds = getTotalBudgetBounds(request.budget, request.travelers);

  return {
    styles: request.styles,
    styleWeights,
    ambiances,
    priorities,
    categoryWeights,
    pace,
    nightlife: Math.max(0, categoryWeights.nightlife),
    prefersEconomy: ambiances.has("economique") || priorities.has("prix"),
    prefersComfort: ambiances.has("luxueuse") || priorities.has("confort"),
    wishStyles,
    days,
    nights: days - 1,
    adults,
    children,
    travelers: adults + children,
    budget: { min: bounds.min, max: bounds.max ?? Number.POSITIVE_INFINITY },
    month: tripMonth(request),
  };
}
