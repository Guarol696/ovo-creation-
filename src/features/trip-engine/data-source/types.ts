import type {
  ActivityCategory,
  ActivityMoment,
  ComfortTier,
  DataSource,
  GeoPoint,
  LocalMobilityMode,
  Meal,
  RestaurantKind,
  TransportMode,
} from "@/types/travel-plan";
import type { Ambiance, DestinationPlace, Priority, TravelStyle } from "@/types/trip";

/**
 * Contrat entre le moteur OVO et ses sources de données.
 *
 * Aujourd'hui : un catalogue de démonstration en mémoire.
 * Demain : une base Supabase, puis des API (vols, hôtels, activités…).
 * Le moteur ne dépend que de ces types, jamais d'une source précise.
 */

export type Affinity = 1 | 2 | 3;
export type Moment = ActivityMoment;

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
  /** Nom FICTIF (préfixé « OVO ») : aucun établissement réel. */
  name: string;
  description: string;
  cuisine: string;
  emoji: string;
  kind: RestaurantKind;
  isLocal: boolean;
  priceLevel: 1 | 2 | 3;
  /** Prix moyen par personne, en euros. */
  cost: number;
  area?: string;
  meals: Meal[];
  tags: TravelStyle[];
}

export interface TransportRoute {
  mode: TransportMode;
  durationLabel: string;
  /** Durée du trajet porte à porte hors attente (heures). */
  durationHours: number;
  /** Aller-retour par personne (avion, train, bus). */
  roundTripPerPerson?: number;
  /** Aller-retour par véhicule : carburant + péages (voiture). */
  roundTripPerVehicle?: number;
  details?: string;
}

export interface LocalMobilityHint {
  mode: LocalMobilityMode;
  description: string;
}

export interface Neighborhood {
  name: string;
  vibe: string;
  tiers: ComfortTier[];
  tags: TravelStyle[];
}

/**
 * Coordonnées de DÉMONSTRATION d'une destination (approximatives).
 * Remplaçables plus tard par un service de géocodage.
 */
export interface DestinationGeo {
  center: GeoPoint;
  zoom: number;
  /** Clé = nom du quartier (`Neighborhood.name`). */
  neighborhoods: Record<string, GeoPoint>;
  /** Clé = identifiant d'activité : lieux connus (monuments, plages…). */
  places: Record<string, GeoPoint>;
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
    localTransportPerDay: number;
  };
  /** Trajets aller-retour depuis la ville de départ (prix moyens indicatifs). */
  access: {
    from: string;
    routes: TransportRoute[];
  };
  /** Façons conseillées de se déplacer sur place. */
  localMobility: LocalMobilityHint[];
  idealDays: { min: number; max: number };
  /** Mois conseillés (1 = janvier). */
  bestMonths: number[];
  styles: Partial<Record<TravelStyle, Affinity>>;
  ambiances: Partial<Record<Ambiance, Affinity>>;
  strengths: Partial<Record<Priority, Affinity>>;
  neighborhoods: Neighborhood[];
  activities: ActivityTemplate[];
  restaurants: RestaurantTemplate[];
  /** Absent pour une destination sans coordonnées (programme type). */
  geo?: DestinationGeo;
  source: DataSource;
}

export interface TravelDataSource {
  readonly id: string;
  /** Destinations candidates pour une recommandation. */
  listDestinations(): Promise<DestinationProfile[]>;
  /** Profil d'une destination choisie par l'utilisateur (null si inconnue). */
  findDestination(place: DestinationPlace): Promise<DestinationProfile | null>;
}
