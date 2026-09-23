import type { ActivityCategory, ComfortTier, DataSource } from "@/types/travel-plan";
import type { Ambiance, DestinationPlace, Priority, TravelStyle } from "@/types/trip";

/**
 * Contrat entre le moteur OVO et ses sources de données.
 *
 * Aujourd'hui : un catalogue de démonstration en mémoire.
 * Demain : une base Supabase, puis des API (vols, hôtels, activités…).
 * Le moteur ne dépend que de ces types, jamais d'une source précise.
 */

export type Affinity = 1 | 2 | 3;
export type Moment = "morning" | "afternoon" | "evening";

export interface ActivityTemplate {
  id: string;
  name: string;
  description: string;
  category: ActivityCategory;
  emoji: string;
  /** Coût indicatif par personne, en euros. */
  cost: number;
  hours: number;
  area?: string;
  moments: Moment[];
  /** Styles de voyage auxquels l'activité correspond. */
  tags: TravelStyle[];
  /** Texte court si l'activité mérite d'être un « moment fort ». */
  highlight?: string;
  /** Occupe toute la journée (excursion). */
  fullDay?: boolean;
  /** Peut apparaître plusieurs fois dans un long séjour. */
  repeatable?: boolean;
}

export interface RestaurantTemplate {
  id: string;
  name: string;
  description: string;
  priceLevel: 1 | 2 | 3;
  /** Prix moyen par personne, en euros. */
  cost: number;
  area?: string;
  meals: ("lunch" | "dinner")[];
  tags: TravelStyle[];
}

export interface Neighborhood {
  name: string;
  vibe: string;
  tiers: ComfortTier[];
  tags: TravelStyle[];
}

export interface DestinationProfile {
  id: string;
  name: string;
  country: string;
  countryCode?: string;
  tagline: string;
  description: string;
  image?: { src: string; alt: string };
  fallbackGradient: string;
  type: "ville" | "balneaire" | "mixte";
  /** 1 = très abordable … 4 = cher. */
  costLevel: 1 | 2 | 3 | 4;
  costs: {
    /** Par personne et par nuit, base chambre partagée à deux. */
    accommodationPerNight: Record<ComfortTier, number>;
    /** Repas par personne et par jour. */
    foodPerDay: Record<ComfortTier, number>;
    localTransportPerDay: number;
  };
  access: {
    mode: "avion" | "train";
    from: string;
    durationLabel: string;
    durationHours: number;
    roundTripPerPerson: number;
  };
  localTransport: string;
  idealDays: { min: number; max: number };
  /** Mois conseillés (1 = janvier). */
  bestMonths: number[];
  styles: Partial<Record<TravelStyle, Affinity>>;
  ambiances: Partial<Record<Ambiance, Affinity>>;
  strengths: Partial<Record<Priority, Affinity>>;
  neighborhoods: Neighborhood[];
  activities: ActivityTemplate[];
  restaurants: RestaurantTemplate[];
  source: DataSource;
}

export interface TravelDataSource {
  readonly id: string;
  /** Destinations candidates pour une recommandation. */
  listDestinations(): Promise<DestinationProfile[]>;
  /** Profil d'une destination choisie par l'utilisateur (null si inconnue). */
  findDestination(place: DestinationPlace): Promise<DestinationProfile | null>;
}
