import type {
  AccommodationOption,
  AccommodationType,
  ComfortTier,
  PlanAccommodation,
} from "@/types/travel-plan";
import type { DestinationProfile, Neighborhood } from "../data-source/types";
import type { Preferences } from "../preferences";

/**
 * Service hébergement.
 *
 *   coûts moyens du catalogue (démo)
 *     → type d'hébergement adapté (groupe, budget, durée, style)
 *     → PlanAccommodation (option recommandée + alternatives)
 *
 * Établissements FICTIFS : noms préfixés « OVO », notes de démonstration.
 * Une vraie API d'hôtels implémentera simplement `AccommodationProvider`.
 */

export interface AccommodationContext {
  profile: DestinationProfile;
  prefs: Preferences;
  tier: ComfortTier;
  neighborhood: Neighborhood;
}

export interface AccommodationProvider {
  readonly id: string;
  getAccommodation(context: AccommodationContext): Promise<PlanAccommodation>;
}

export const ACCOMMODATION_LABELS: Record<AccommodationType, { label: string; emoji: string }> = {
  hotel: { label: "Hôtel", emoji: "🏨" },
  appartement: { label: "Appartement", emoji: "🏠" },
  auberge: { label: "Auberge de jeunesse", emoji: "🛏️" },
};

/** Les enfants partagent la chambre des adultes. */
const CHILD_ROOM_FACTOR = 0.5;

/** Pays où la climatisation est un vrai plus en été. */
const WARM_COUNTRIES = new Set([
  "PT",
  "ES",
  "IT",
  "MA",
  "GR",
  "HR",
  "TR",
  "AE",
  "TH",
  "ID",
  "MX",
  "BR",
  "EG",
  "TN",
]);

const roundTo5 = (value: number) => Math.round(value / 5) * 5;

/** Type d'hébergement le plus adapté au voyage. */
export function accommodationTypeFor(prefs: Preferences, tier: ComfortTier): AccommodationType {
  if (prefs.travelers >= 4) return "appartement";
  if (prefs.days >= 7 && prefs.travelers >= 2) return "appartement";
  if (tier === "eco" && prefs.travelers === 1) return "auberge";
  return "hotel";
}

/** Prix indicatif d'une nuit pour tout le groupe. Fonction pure, partagée avec le budget. */
export function accommodationNightlyPrice(
  profile: DestinationProfile,
  prefs: Preferences,
  tier: ComfortTier,
  type: AccommodationType,
): number {
  const sleepers = prefs.adults + prefs.children * CHILD_ROOM_FACTOR;
  const base = profile.costs.accommodationPerNight;
  const perSleeper =
    type === "auberge"
      ? base.eco * 0.75
      : type === "appartement"
        ? base[tier] * (prefs.travelers >= 4 ? 0.85 : 1.05)
        : base[tier];
  return Math.max(15, roundTo5(perSleeper * sleepers));
}

/** Petit hash stable pour varier les notes de démonstration. */
function hash(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

function demoRating(profile: DestinationProfile, type: AccommodationType, tier: ComfortTier) {
  const base = type === "auberge" ? 4.2 : { eco: 4.1, standard: 4.3, confort: 4.6 }[tier];
  return Math.min(4.9, Math.round((base + (hash(profile.id + type) % 4) * 0.1) * 10) / 10);
}

function demoName(profile: DestinationProfile, type: AccommodationType, tier: ComfortTier) {
  if (type === "auberge") return "OVO Social Hostel";
  if (type === "appartement") return tier === "confort" ? "Loft OVO Signature" : "Appartement OVO Stay";
  if (profile.id === "marrakech") return tier === "confort" ? "Riad OVO Palace & Spa" : "Riad OVO Jasmin";
  return { eco: "OVO Budget Hotel", standard: "OVO City Hotel", confort: "OVO Boutique Hôtel" }[tier];
}

function amenities(
  profile: DestinationProfile,
  prefs: Preferences,
  type: AccommodationType,
  tier: ComfortTier,
  neighborhood: Neighborhood,
) {
  const warm = profile.countryCode ? WARM_COUNTRIES.has(profile.countryCode) : false;
  const list: (string | false)[] =
    type === "auberge"
      ? [
          "Wi-Fi",
          "Casiers sécurisés",
          "Cuisine partagée",
          "Espace commun",
          prefs.styles.includes("fete") && "Soirées organisées",
        ]
      : type === "appartement"
        ? [
            "Wi-Fi",
            "Cuisine équipée",
            "Lave-linge",
            prefs.travelers >= 4 && "Grand salon",
            warm && "Climatisation",
          ]
        : [
            "Wi-Fi",
            tier !== "eco" && "Petit-déjeuner",
            warm && "Climatisation",
            "Réception 24 h/24",
            tier === "confort" && (profile.id === "marrakech" ? "Piscine" : "Spa"),
          ];
  if (neighborhood.tags.includes("plage")) list.push("Plage à pied");
  return list.filter((item): item is string => Boolean(item)).slice(0, 5);
}

function capacityLabel(type: AccommodationType, prefs: Preferences) {
  if (type === "auberge")
    return prefs.travelers === 1 ? "Lit en dortoir ou chambre privée" : "Chambre privée";
  if (type === "appartement") {
    const rooms = Math.max(1, Math.ceil(prefs.travelers / 2));
    return `Logement entier · ${rooms} chambre${rooms > 1 ? "s" : ""}`;
  }
  const rooms = Math.max(1, Math.ceil(prefs.adults / 2));
  return `${rooms} chambre${rooms > 1 ? "s" : ""}${prefs.children > 0 ? " (enfants avec les parents)" : ""}`;
}

function mainHighlight(type: AccommodationType, tier: ComfortTier, prefs: Preferences) {
  if (type === "appartement") {
    return prefs.travelers >= 4
      ? `Parfait à ${prefs.travelers} : de la place et une cuisine pour partager les repas`
      : "Idéal pour un long séjour : cuisine et lave-linge sur place";
  }
  if (type === "auberge") return "Petit prix et ambiance sociale, idéal en solo";
  return {
    eco: "Simple et bien situé, pour garder du budget pour les sorties",
    standard: "Le bon équilibre entre confort, emplacement et prix",
    confort: "Pour te faire plaisir, avec des services premium",
  }[tier];
}

/** Quartier alternatif cohérent avec le type d'hébergement. */
function areaFor(profile: DestinationProfile, type: AccommodationType, main: Neighborhood) {
  if (type === "auberge") {
    return (
      profile.neighborhoods.find((n) => n.tiers.includes("eco") && n.tags.includes("fete")) ??
      profile.neighborhoods.find((n) => n.tiers.includes("eco")) ??
      main
    );
  }
  return profile.neighborhoods.find((n) => n !== main && n.tiers.length > 1) ?? main;
}

function buildOption(
  context: AccommodationContext,
  type: AccommodationType,
  neighborhood: Neighborhood,
  highlight: string,
): AccommodationOption {
  const { profile, prefs, tier } = context;
  const optionTier: ComfortTier = type === "auberge" ? "eco" : tier;
  const pricePerNight = accommodationNightlyPrice(profile, prefs, optionTier, type);
  const nights = Math.max(1, prefs.nights);
  return {
    id: `${profile.id}-${type}`,
    name: demoName(profile, type, optionTier),
    type,
    area: neighborhood.name,
    areaDescription: neighborhood.vibe,
    rating: demoRating(profile, type, optionTier),
    estimatedPricePerNight: pricePerNight,
    nights,
    estimatedTotal: pricePerNight * nights,
    guests: prefs.travelers,
    capacityLabel: capacityLabel(type, prefs),
    amenities: amenities(profile, prefs, type, optionTier, neighborhood),
    highlight,
    tier: optionTier,
    source: profile.source,
  };
}

/** Fournisseur de DÉMONSTRATION : établissements et prix fictifs. */
export const demoAccommodationProvider: AccommodationProvider = {
  id: "ovo-demo-accommodation",
  async getAccommodation(context) {
    const { prefs, tier, neighborhood, profile } = context;
    const mainType = accommodationTypeFor(prefs, tier);
    const main = buildOption(context, mainType, neighborhood, mainHighlight(mainType, tier, prefs));

    const otherTypes = (["hotel", "appartement", "auberge"] as const).filter(
      (type) =>
        type !== mainType &&
        // Pas d'auberge avec des enfants, en grand groupe ou en version confort.
        !(type === "auberge" && (prefs.children > 0 || prefs.travelers > 4 || tier === "confort")),
    );
    const alternatives = otherTypes.map((type) => {
      const option = buildOption(context, type, areaFor(profile, type, neighborhood), "");
      const diff = main.estimatedTotal - option.estimatedTotal;
      option.highlight =
        diff > 0
          ? `Environ ${diff} € de moins sur le séjour`
          : diff < 0
            ? `Plus d'intimité ou de services, environ ${-diff} € de plus`
            : "Un prix similaire, une autre ambiance";
      return option;
    });

    return { main, alternatives, source: profile.source };
  },
};
