import type {
  Ambiance,
  BudgetRangeId,
  BudgetScope,
  DestinationPlace,
  DurationId,
  Priority,
  TravelStyle,
} from "@/types/trip";

/**
 * État « brouillon » du questionnaire : tous les champs peuvent être
 * incomplets. Converti en `TripRequest` validé à la fin du parcours.
 */
export interface TripDraft {
  destinationMode: "known" | "open" | null;
  destination: DestinationPlace | null;

  datesMode: "fixed" | "flexible" | null;
  departureDate: string;
  returnDate: string;
  preferredMonth: string | null;

  durationId: DurationId | null;

  /** Nombre total de voyageurs (adultes + enfants). */
  travelersCount: number | null;
  children: number;

  budgetMode: "range" | "custom" | null;
  budgetRangeId: BudgetRangeId | null;
  /** Saisie brute du budget personnalisé (validée à la sortie de l'étape). */
  customBudget: string;
  budgetScope: BudgetScope;

  styles: TravelStyle[];
  ambiances: Ambiance[];
  priorities: Priority[];
  wishes: string;
}

/** Champs à choix multiples, modifiables par l'action « toggle ». */
export type MultiChoiceField = "styles" | "ambiances" | "priorities";

export type StepId =
  | "destination"
  | "dates"
  | "duration"
  | "travelers"
  | "budget"
  | "styles"
  | "ambiance"
  | "priorities"
  | "wishes";
