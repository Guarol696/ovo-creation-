/**
 * Types métier partagés autour du voyage.
 * Contrat entre le questionnaire, le futur moteur de génération
 * et les intégrations externes (vols, hébergements, activités, IA).
 */

export const TRAVEL_STYLES = [
  "plage",
  "ville",
  "fete",
  "nature",
  "aventure",
  "romantique",
  "gastronomie",
  "culture",
  "shopping",
  "detente",
  "festivals",
] as const;
export type TravelStyle = (typeof TRAVEL_STYLES)[number];

/** Libellés courts (badges, cartes). */
export const TRAVEL_STYLE_LABELS: Record<TravelStyle, string> = {
  plage: "Plage",
  ville: "Ville",
  fete: "Fête",
  nature: "Nature",
  aventure: "Aventure",
  romantique: "Romantique",
  gastronomie: "Gastronomie",
  culture: "Culture",
  shopping: "Shopping",
  detente: "Détente",
  festivals: "Festivals",
};

export const AMBIANCES = [
  "calme",
  "festive",
  "aventureuse",
  "romantique",
  "luxueuse",
  "economique",
  "sociale",
  "authentique",
] as const;
export type Ambiance = (typeof AMBIANCES)[number];

export const PRIORITIES = [
  "prix",
  "confort",
  "rapidite",
  "activites",
  "vie-nocturne",
  "plages",
  "culture",
  "gastronomie",
  "nature",
  "securite",
] as const;
export type Priority = (typeof PRIORITIES)[number];

export const DURATION_IDS = ["weekend", "3-4-jours", "5-7-jours", "1-2-semaines", "plus-2-semaines"] as const;
export type DurationId = (typeof DURATION_IDS)[number];

export const BUDGET_RANGE_IDS = [
  "moins-300",
  "300-500",
  "500-800",
  "800-1200",
  "1200-2000",
  "plus-2000",
] as const;
export type BudgetRangeId = (typeof BUDGET_RANGE_IDS)[number];

/** Le budget est-il exprimé par personne ou pour tout le groupe ? */
export type BudgetScope = "per-person" | "total";

export interface DestinationPlace {
  /** Identifiant stable (slug du catalogue ou `custom:<texte>`). */
  id: string;
  name: string;
  /** Vide pour une saisie libre. */
  country: string;
  /** Code ISO 3166-1 alpha-2, si connu. */
  countryCode?: string;
  /** true si l'utilisateur a saisi une destination hors catalogue. */
  isCustom?: boolean;
}

export type TripDestination = { mode: "known"; place: DestinationPlace } | { mode: "open" };

export type TripDates =
  | { mode: "fixed"; departureDate: string; returnDate: string } // ISO YYYY-MM-DD
  | { mode: "flexible"; preferredMonth: string | null }; // YYYY-MM

export interface TripDuration {
  id: DurationId;
  /** Nombre exact de jours si les dates sont fixées. */
  days: number | null;
}

export interface TripTravelers {
  adults: number;
  children: number;
}

export type TripBudget =
  | { mode: "range"; rangeId: BudgetRangeId; scope: BudgetScope }
  | { mode: "custom"; amount: number; scope: BudgetScope };

/** Demande de voyage complète et validée, issue du questionnaire. */
export interface TripRequest {
  destination: TripDestination;
  dates: TripDates;
  duration: TripDuration;
  travelers: TripTravelers;
  budget: TripBudget;
  styles: TravelStyle[];
  ambiances: Ambiance[];
  priorities: Priority[];
  wishes: string | null;
}
