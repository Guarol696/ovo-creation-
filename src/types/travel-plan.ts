import type { Ambiance, TravelStyle, TripRequest } from "./trip";

/**
 * Proposition de voyage générée par le moteur OVO.
 *
 * Chaque bloc (transport, hébergement, activités, restaurants, prix) est
 * indépendant et porte sa propre `source`, afin de pouvoir être remplacé
 * progressivement par des données réelles (API de vols, d'hôtels, etc.).
 */

/** Origine d'une donnée : démonstration interne aujourd'hui, API demain. */
export type DataSource = "demo" | "generic" | "api";

export type DayPeriod = "morning" | "lunch" | "afternoon" | "evening";

export type ActivityCategory =
  | "monument"
  | "musee"
  | "quartier"
  | "panorama"
  | "plage"
  | "nature"
  | "aventure"
  | "nightlife"
  | "food"
  | "shopping"
  | "detente"
  | "evenement"
  | "excursion";

export interface PlanActivity {
  id: string;
  name: string;
  description: string;
  category: ActivityCategory;
  emoji: string;
  /** Coût estimé par personne, en euros (0 = gratuit). */
  estimatedCostPerPerson: number;
  durationHours: number;
  area?: string;
  source: DataSource;
}

export interface PlanRestaurant {
  id: string;
  name: string;
  description: string;
  /** 1 = petit prix, 2 = intermédiaire, 3 = plaisir. */
  priceLevel: 1 | 2 | 3;
  estimatedCostPerPerson: number;
  area?: string;
  source: DataSource;
}

export interface ItinerarySlot {
  period: DayPeriod;
  title: string;
  description: string;
  activity?: PlanActivity;
  restaurant?: PlanRestaurant;
  /** Coût estimé par personne pour ce créneau. */
  estimatedCostPerPerson: number;
}

export interface ItineraryDay {
  dayNumber: number;
  /** Date ISO si les dates sont fixées. */
  date: string | null;
  title: string;
  description: string;
  slots: ItinerarySlot[];
  estimatedCostPerPerson: number;
  estimatedCostTotal: number;
}

export interface PlanHighlight {
  emoji: string;
  title: string;
  description: string;
}

export type BudgetCategory = "transport" | "accommodation" | "food" | "activities" | "other";

export type ComfortTier = "eco" | "standard" | "confort";

export type BudgetStatus = "within" | "tight" | "over";

export interface EstimatedBudget {
  currency: "EUR";
  breakdown: Record<BudgetCategory, number>;
  total: number;
  perPerson: number;
  tier: ComfortTier;
  /** Budget indiqué par l'utilisateur, pour tout le groupe. */
  userBudget: { min: number; max: number | null };
  status: BudgetStatus;
  source: DataSource;
}

export interface PlanAccommodation {
  type: string;
  area: string;
  description: string;
  estimatedPricePerNight: number;
  nights: number;
  tier: ComfortTier;
  source: DataSource;
}

export interface PlanTransport {
  toDestination: {
    mode: "avion" | "train";
    from: string;
    durationLabel: string;
    estimatedCostPerPerson: number;
  };
  local: {
    description: string;
    estimatedCostPerDayPerPerson: number;
  };
  source: DataSource;
}

export interface PlanDestination {
  id: string;
  name: string;
  country: string;
  countryCode?: string;
  tagline: string;
  description: string;
  image?: { src: string; alt: string };
  fallbackGradient: string;
  /** true si OVO a choisi la destination (l'utilisateur était ouvert). */
  recommended: boolean;
  /** Programme type sans adresses précises (destination hors catalogue). */
  isGeneric: boolean;
}

export interface TravelPlan {
  /** Identifiant déterministe dérivé de la demande. */
  id: string;
  version: 1;
  request: TripRequest;
  destination: PlanDestination;
  dates: {
    mode: "fixed" | "flexible";
    departureDate: string | null;
    returnDate: string | null;
    preferredMonth: string | null;
  };
  duration: { days: number; nights: number };
  travelers: { adults: number; children: number; total: number };
  travelStyle: TravelStyle[];
  atmosphere: Ambiance[];
  summary: string;
  /** « Pourquoi OVO te recommande ce voyage » */
  reasons: string[];
  /** Avertissements (budget serré, saison…). */
  warnings: string[];
  highlights: PlanHighlight[];
  itinerary: ItineraryDay[];
  accommodation: PlanAccommodation;
  transport: PlanTransport;
  activities: PlanActivity[];
  restaurants: PlanRestaurant[];
  estimatedBudget: EstimatedBudget;
  /** Autres destinations compatibles (si OVO a choisi). */
  alternatives: { id: string; name: string; country: string }[];
}
