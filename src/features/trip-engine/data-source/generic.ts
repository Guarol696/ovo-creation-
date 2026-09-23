import type { ComfortTier } from "@/types/travel-plan";
import type { DestinationPlace } from "@/types/trip";
import { normalizeText } from "@/features/trip-builder/lib/destination-search";
import type { ActivityTemplate, DestinationProfile, RestaurantTemplate } from "./types";

/**
 * Profil « programme type » pour une destination absente du catalogue
 * (ex. Tokyo, Tbilissi). Les activités sont génériques et clairement
 * présentées comme telles : aucune adresse n'est inventée.
 */

type Region =
  | "europe"
  | "north-africa"
  | "middle-east"
  | "north-america"
  | "latin-america"
  | "asia"
  | "oceania"
  | "africa";

const REGION_BY_COUNTRY: Record<string, Region> = {
  FR: "europe",
  GB: "europe",
  IE: "europe",
  PT: "europe",
  ES: "europe",
  IT: "europe",
  NL: "europe",
  BE: "europe",
  DE: "europe",
  CZ: "europe",
  HU: "europe",
  AT: "europe",
  DK: "europe",
  GR: "europe",
  HR: "europe",
  IS: "europe",
  CH: "europe",
  PL: "europe",
  SE: "europe",
  NO: "europe",
  TR: "europe",
  MA: "north-africa",
  TN: "north-africa",
  EG: "north-africa",
  AE: "middle-east",
  US: "north-america",
  CA: "north-america",
  MX: "latin-america",
  BR: "latin-america",
  JP: "asia",
  KR: "asia",
  TH: "asia",
  ID: "asia",
};

const ACCESS_BY_REGION: Record<Region, { roundTrip: number; hours: number; label: string }> = {
  europe: { roundTrip: 170, hours: 2.5, label: "environ 2 à 3 h" },
  "north-africa": { roundTrip: 220, hours: 3.5, label: "environ 3 à 4 h" },
  "middle-east": { roundTrip: 450, hours: 6.5, label: "environ 6 à 7 h" },
  "north-america": { roundTrip: 650, hours: 8.5, label: "environ 8 à 9 h" },
  "latin-america": { roundTrip: 850, hours: 11.5, label: "environ 11 à 12 h" },
  asia: { roundTrip: 850, hours: 12, label: "environ 12 h ou plus" },
  oceania: { roundTrip: 1400, hours: 22, label: "plus de 20 h" },
  africa: { roundTrip: 600, hours: 7, label: "environ 6 à 8 h" },
};

/** Niveau de coût sur place (1 = abordable, 4 = cher). */
const COST_LEVEL_BY_COUNTRY: Record<string, 1 | 2 | 3 | 4> = {
  GB: 4,
  CH: 4,
  IS: 4,
  NO: 4,
  DK: 4,
  US: 4,
  CA: 3,
  AE: 4,
  JP: 3,
  KR: 3,
  FR: 3,
  NL: 4,
  IE: 4,
  AT: 3,
  SE: 4,
  DE: 3,
  IT: 3,
  ES: 3,
  BE: 3,
  PT: 2,
  GR: 2,
  HR: 2,
  CZ: 2,
  PL: 1,
  HU: 1,
  TR: 1,
  MA: 1,
  TN: 1,
  EG: 1,
  TH: 1,
  ID: 1,
  MX: 2,
  BR: 2,
};

const COSTS_BY_LEVEL: Record<
  1 | 2 | 3 | 4,
  { acc: Record<ComfortTier, number>; food: Record<ComfortTier, number>; local: number }
> = {
  1: { acc: { eco: 18, standard: 40, confort: 90 }, food: { eco: 15, standard: 28, confort: 55 }, local: 5 },
  2: { acc: { eco: 25, standard: 55, confort: 110 }, food: { eco: 22, standard: 38, confort: 65 }, local: 6 },
  3: { acc: { eco: 35, standard: 70, confort: 140 }, food: { eco: 30, standard: 48, confort: 85 }, local: 8 },
  4: {
    acc: { eco: 50, standard: 95, confort: 180 },
    food: { eco: 38, standard: 60, confort: 100 },
    local: 11,
  },
};

function genericActivities(city: string): ActivityTemplate[] {
  const g = (a: Omit<ActivityTemplate, "id"> & { key: string }): ActivityTemplate => {
    const { key, ...rest } = a;
    return { id: `generic-${key}`, ...rest };
  };
  return [
    g({
      key: "centre",
      name: `Balade dans le centre historique de ${city}`,
      description: "Premier contact avec la ville, ses places et ses ruelles.",
      category: "quartier",
      emoji: "🏘️",
      cost: 0,
      hours: 2.5,
      moments: ["morning", "afternoon"],
      tags: ["ville", "culture"],
    }),
    g({
      key: "monument",
      name: `Le monument emblématique de ${city}`,
      description: "L'incontournable que tout le monde vient voir.",
      category: "monument",
      emoji: "🏛️",
      cost: 15,
      hours: 2,
      moments: ["morning"],
      tags: ["culture"],
      highlight: `Le monument emblématique de ${city}`,
    }),
    g({
      key: "musee",
      name: "Le grand musée de la ville",
      description: "Art, histoire ou culture locale : de quoi comprendre la destination.",
      category: "musee",
      emoji: "🖼️",
      cost: 15,
      hours: 2.5,
      moments: ["morning", "afternoon"],
      tags: ["culture"],
    }),
    g({
      key: "marche",
      name: "Marché local & street food",
      description: "Goûter les spécialités là où mangent les habitants.",
      category: "food",
      emoji: "🥘",
      cost: 15,
      hours: 1.5,
      moments: ["morning", "afternoon"],
      tags: ["gastronomie"],
      highlight: "Street food au marché local",
      repeatable: true,
    }),
    g({
      key: "panorama",
      name: "Point de vue au coucher du soleil",
      description: "Le spot en hauteur pour voir la ville s'illuminer.",
      category: "panorama",
      emoji: "🌅",
      cost: 0,
      hours: 1.5,
      moments: ["evening"],
      tags: ["romantique", "detente"],
      highlight: "Coucher de soleil sur la ville",
      repeatable: true,
    }),
    g({
      key: "quartier-branche",
      name: "Le quartier branché et ses boutiques",
      description: "Créateurs, cafés et friperies.",
      category: "shopping",
      emoji: "🛍️",
      cost: 10,
      hours: 2.5,
      moments: ["afternoon"],
      tags: ["shopping", "ville"],
    }),
    g({
      key: "parc",
      name: "Pause dans un parc ou au bord de l'eau",
      description: "Souffler un peu entre deux visites.",
      category: "detente",
      emoji: "🌳",
      cost: 0,
      hours: 2,
      moments: ["afternoon"],
      tags: ["detente", "nature"],
      repeatable: true,
    }),
    g({
      key: "eau",
      name: "Après-midi détente au bord de l'eau",
      description: "Plage, lac ou rivière selon la destination.",
      category: "plage",
      emoji: "🌊",
      cost: 5,
      hours: 3,
      moments: ["afternoon"],
      tags: ["plage", "detente"],
      repeatable: true,
    }),
    g({
      key: "nature",
      name: "Balade nature aux alentours",
      description: "Grand air et paysages à quelques kilomètres du centre.",
      category: "nature",
      emoji: "🥾",
      cost: 10,
      hours: 3,
      moments: ["morning"],
      tags: ["nature", "aventure"],
    }),
    g({
      key: "outdoor",
      name: "Activité outdoor encadrée",
      description: "Vélo, kayak ou randonnée selon la saison.",
      category: "aventure",
      emoji: "🚴",
      cost: 40,
      hours: 3,
      moments: ["morning", "afternoon"],
      tags: ["aventure"],
    }),
    g({
      key: "spectacle",
      name: "Spectacle ou concert local",
      description: "Musique, danse ou théâtre typique.",
      category: "evenement",
      emoji: "🎶",
      cost: 30,
      hours: 2,
      moments: ["evening"],
      tags: ["culture", "festivals"],
    }),
    g({
      key: "bars",
      name: "Soirée dans le quartier le plus animé",
      description: "Bars et terrasses où sortent les locaux.",
      category: "nightlife",
      emoji: "🍹",
      cost: 20,
      hours: 3,
      moments: ["evening"],
      tags: ["fete"],
      highlight: "Soirée dans le quartier animé",
      repeatable: true,
    }),
    g({
      key: "club",
      name: "Club ou bar à cocktails avec vue",
      description: "Pour prolonger la nuit.",
      category: "nightlife",
      emoji: "🎉",
      cost: 25,
      hours: 3.5,
      moments: ["evening"],
      tags: ["fete"],
    }),
    g({
      key: "excursion",
      name: "Excursion d'une journée dans la région",
      description: "Village, site naturel ou côte à proximité.",
      category: "excursion",
      emoji: "🚌",
      cost: 35,
      hours: 7,
      moments: ["morning"],
      tags: ["nature", "culture", "aventure"],
      fullDay: true,
    }),
  ];
}

const genericRestaurants: RestaurantTemplate[] = [
  {
    id: "generic-cantine",
    name: "Cantine de quartier",
    description: "Plats du jour simples et locaux.",
    priceLevel: 1,
    cost: 12,
    meals: ["lunch"],
    tags: [],
  },
  {
    id: "generic-street",
    name: "Street food locale",
    description: "Les spécialités à emporter.",
    priceLevel: 1,
    cost: 9,
    meals: ["lunch", "dinner"],
    tags: ["gastronomie"],
  },
  {
    id: "generic-typique",
    name: "Restaurant typique",
    description: "La cuisine traditionnelle de la région.",
    priceLevel: 2,
    cost: 28,
    meals: ["lunch", "dinner"],
    tags: ["gastronomie", "romantique"],
  },
  {
    id: "generic-bar",
    name: "Bar à tapas ou petites assiettes",
    description: "À partager dans une ambiance animée.",
    priceLevel: 2,
    cost: 25,
    meals: ["dinner"],
    tags: ["fete"],
  },
  {
    id: "generic-gastro",
    name: "Table gastronomique",
    description: "Pour un dîner d'exception.",
    priceLevel: 3,
    cost: 70,
    meals: ["dinner"],
    tags: ["gastronomie", "romantique"],
  },
];

export function buildGenericProfile(place: DestinationPlace): DestinationProfile {
  const region = (place.countryCode && REGION_BY_COUNTRY[place.countryCode]) || "europe";
  const access = ACCESS_BY_REGION[region];
  const costLevel = (place.countryCode && COST_LEVEL_BY_COUNTRY[place.countryCode]) || 3;
  const costs = COSTS_BY_LEVEL[costLevel];
  const isLongHaul = access.hours > 5;

  return {
    id: `generic:${normalizeText(place.name).replace(/\s+/g, "-")}`,
    name: place.name,
    country: place.country,
    countryCode: place.countryCode,
    tagline: "Un programme type, à personnaliser selon tes envies.",
    description: `OVO n'a pas encore d'adresses détaillées pour ${place.name} : voici un programme type construit à partir de tes préférences.`,
    fallbackGradient: "from-night-400 via-night-600 to-night-900",
    type: "mixte",
    costLevel,
    costs: {
      accommodationPerNight: costs.acc,
      foodPerDay: costs.food,
      localTransportPerDay: costs.local,
    },
    access: {
      mode: "avion",
      from: "France",
      durationLabel: access.label,
      durationHours: access.hours,
      roundTripPerPerson: access.roundTrip,
    },
    localTransport: "Transports en commun et marche",
    idealDays: isLongHaul ? { min: 7, max: 16 } : { min: 3, max: 7 },
    bestMonths: [],
    styles: {},
    ambiances: {},
    strengths: {},
    neighborhoods: [
      {
        name: "le centre-ville",
        vibe: "pratique pour tout faire à pied",
        tiers: ["eco", "standard", "confort"],
        tags: [],
      },
    ],
    activities: genericActivities(place.name),
    restaurants: genericRestaurants,
    source: "generic",
  };
}
