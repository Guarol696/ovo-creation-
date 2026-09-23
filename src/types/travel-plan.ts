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

/** Moments de la journée (« night » = sortie après le dîner). */
export type DayPeriod = "morning" | "lunch" | "afternoon" | "evening" | "night";

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

/** Catégories affichées à l'utilisateur (filtres « Que faire ? »). */
export type ActivityTheme =
  "culture" | "nature" | "sorties" | "aventure" | "shopping" | "gastronomie" | "evenements" | "detente";

/** Moments où une activité peut être programmée. */
export type ActivityMoment = "morning" | "afternoon" | "evening";

/** 0 = gratuit, 1 = petit prix, 2 = intermédiaire, 3 = plaisir. */
export type PriceLevel = 0 | 1 | 2 | 3;

/** Moment conseillé pour une activité. */
export type RecommendedMoment = "morning" | "afternoon" | "evening" | "night" | "day";

/** Place d'une activité ou d'un restaurant dans le programme. */
export interface ScheduleRef {
  dayNumber: number;
  period: DayPeriod;
}

/** Activité proposée (catalogue de démo aujourd'hui, API demain). */
export interface PlanActivity {
  id: string;
  name: string;
  description: string;
  category: ActivityCategory;
  theme: ActivityTheme;
  emoji: string;
  /** Incontournable de la destination. */
  mustSee: boolean;
  /** Texte « moment fort » si l'activité en est un. */
  highlight?: string;
  /** Coût estimé par personne, en euros (0 = gratuit). */
  estimatedCostPerPerson: number;
  priceLevel: PriceLevel;
  durationHours: number;
  durationLabel: string;
  moments: ActivityMoment[];
  bestMoment: RecommendedMoment;
  area?: string;
  tags: TravelStyle[];
  fullDay: boolean;
  repeatable: boolean;
  /** Pertinence pour ce voyage (interne, jamais affichée). */
  relevance: number;
  /** Mise en avant pour ce profil. */
  recommended: boolean;
  /** Jours du programme où l'activité apparaît. */
  schedule: ScheduleRef[];
  source: DataSource;
}

export type RestaurantKind = "street-food" | "local" | "bistrot" | "gastronomique" | "bar";

export type Meal = "lunch" | "dinner";

/** Restaurant proposé (fictif tant que la source est « demo »). */
export interface PlanRestaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  emoji: string;
  kind: RestaurantKind;
  /** Spécialités locales. */
  isLocal: boolean;
  /** 1 = petit prix, 2 = intermédiaire, 3 = plaisir. */
  priceLevel: 1 | 2 | 3;
  estimatedCostPerPerson: number;
  /** Fourchette indicative par personne. */
  priceRange: { min: number; max: number };
  /** Note sur 5 — fictive tant que la source n'est pas une API. */
  rating: number;
  meals: Meal[];
  area?: string;
  tags: TravelStyle[];
  relevance: number;
  recommended: boolean;
  schedule: ScheduleRef[];
  source: DataSource;
}

/**
 * Élément du programme (« ItineraryItem ») : un moment de la journée avec
 * une activité et/ou un restaurant du TravelPlan, ou un temps libre.
 */
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

/**
 * Budget global du voyage, pour tout le groupe.
 * Les postes transport et hébergement reprennent exactement les options
 * retenues (`PlanTransport.main`, `PlanAccommodation.main`).
 */
export interface TravelBudget {
  currency: "EUR";
  breakdown: Record<BudgetCategory, number>;
  /** Total pour tout le groupe. */
  total: number;
  perPerson: number;
  tier: ComfortTier;
  /** Budget indiqué par l'utilisateur, pour tout le groupe. */
  userBudget: { min: number; max: number | null };
  status: BudgetStatus;
  /** Détail des postes calculés à partir du programme. */
  details: {
    /** Repas au restaurant prévus dans le programme. */
    mealsCount: number;
    mealsPerPerson: number;
    /** Petits-déjeuners et en-cas (0 si inclus dans l'hébergement). */
    snacksPerPerson: number;
    paidActivitiesCount: number;
    activitiesPerPerson: number;
  };
  source: DataSource;
}

// --- Transport ---------------------------------------------------------------

export type TransportMode = "avion" | "train" | "voiture" | "bus";

/** Une façon de rejoindre la destination (aller-retour). */
export interface TransportOption {
  id: string;
  mode: TransportMode;
  from: string;
  to: string;
  durationLabel: string;
  durationHours: number;
  /** Prix indicatif aller-retour par personne, en euros. */
  estimatedRoundTripPerPerson: number;
  /** Prix indicatif aller-retour pour tout le groupe, en euros. */
  estimatedRoundTripTotal: number;
  /** Pourquoi cette option (ex. « Centre-ville à centre-ville »). */
  highlight: string;
  details?: string;
  source: DataSource;
}

export type LocalMobilityMode = "metro" | "tram" | "bus" | "marche" | "taxi" | "velo" | "ferry";

/** Recommandation pour se déplacer sur place. */
export interface LocalMobilityOption {
  mode: LocalMobilityMode;
  label: string;
  description: string;
}

export interface PlanTransport {
  /** Option recommandée par OVO (utilisée dans le budget). */
  main: TransportOption;
  alternatives: TransportOption[];
  local: {
    options: LocalMobilityOption[];
    estimatedCostPerDayPerPerson: number;
  };
  source: DataSource;
}

// --- Hébergement -------------------------------------------------------------

export type AccommodationType = "hotel" | "appartement" | "auberge";

/** Un hébergement proposé (fictif tant que la source est « demo »). */
export interface AccommodationOption {
  id: string;
  name: string;
  type: AccommodationType;
  area: string;
  areaDescription: string;
  /** Note sur 5 — fictive tant que la source n'est pas une API. */
  rating: number;
  estimatedPricePerNight: number;
  nights: number;
  /** Prix pour tout le séjour et tout le groupe. */
  estimatedTotal: number;
  guests: number;
  /** Ex. « 2 chambres », « Logement entier ». */
  capacityLabel: string;
  amenities: string[];
  /** Pourquoi cette option (ex. « Idéal en solo à petit prix »). */
  highlight: string;
  tier: ComfortTier;
  source: DataSource;
}

export interface PlanAccommodation {
  /** Option recommandée par OVO (utilisée dans le budget). */
  main: AccommodationOption;
  alternatives: AccommodationOption[];
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
  estimatedBudget: TravelBudget;
  /** Autres destinations compatibles (si OVO a choisi). */
  alternatives: { id: string; name: string; country: string }[];
}
