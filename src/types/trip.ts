/**
 * Types métier partagés autour du voyage.
 * Servira de contrat entre le questionnaire, le moteur de génération
 * et les futures intégrations (vols, hébergements, activités, IA).
 */

export const TRAVEL_STYLES = [
  "city-break",
  "fete",
  "culture",
  "nature",
  "plage",
  "aventure",
  "food",
  "detente",
] as const;

export type TravelStyle = (typeof TRAVEL_STYLES)[number];

export const TRAVEL_STYLE_LABELS: Record<TravelStyle, string> = {
  "city-break": "City break",
  fete: "Fête",
  culture: "Culture",
  nature: "Nature",
  plage: "Plage",
  aventure: "Aventure",
  food: "Food",
  detente: "Détente",
};

/** Critères saisis par l'utilisateur dans le futur questionnaire. */
export interface TripRequest {
  departureCity: string;
  startDate: string; // ISO 8601 (YYYY-MM-DD)
  endDate: string; // ISO 8601 (YYYY-MM-DD)
  travelers: number;
  budgetPerPerson: number; // en euros
  styles: TravelStyle[];
  wishes?: string;
}
