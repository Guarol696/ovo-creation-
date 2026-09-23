import type { LocalMobilityMode, PlanTransport, TransportMode, TransportOption } from "@/types/travel-plan";
import type { DestinationProfile, TransportRoute } from "../data-source/types";
import type { Preferences } from "../preferences";

/**
 * Service transport.
 *
 *   données de démo (trajets moyens du catalogue)
 *     → classement des options selon le groupe et les priorités
 *     → PlanTransport (option recommandée + alternatives + mobilité locale)
 *
 * Pour brancher une vraie API (vols, trains…), il suffit d'implémenter
 * `TransportProvider` et de le passer à `generateTravelPlan`.
 */

export interface TransportContext {
  profile: DestinationProfile;
  prefs: Preferences;
}

export interface TransportProvider {
  readonly id: string;
  getTransport(context: TransportContext): Promise<PlanTransport>;
}

/** Places par véhicule (voiture). */
const SEATS_PER_CAR = 5;

/** Temps « perdu » autour du trajet : aéroport, gare… (heures). */
const OVERHEAD_HOURS: Record<TransportMode, number> = { avion: 2, train: 0.5, bus: 0.5, voiture: 0 };

/** Pénibilité relative d'une heure de trajet (le train se vit mieux que la route). */
const COMFORT_FACTOR: Record<TransportMode, number> = { avion: 1, train: 0.6, bus: 1, voiture: 1.2 };

export const TRANSPORT_LABELS: Record<TransportMode, { label: string; emoji: string }> = {
  avion: { label: "Avion", emoji: "✈️" },
  train: { label: "Train", emoji: "🚆" },
  voiture: { label: "Voiture", emoji: "🚗" },
  bus: { label: "Bus", emoji: "🚌" },
};

export const LOCAL_MOBILITY_LABELS: Record<LocalMobilityMode, { label: string; emoji: string }> = {
  metro: { label: "Métro", emoji: "🚇" },
  tram: { label: "Tram", emoji: "🚋" },
  bus: { label: "Bus", emoji: "🚌" },
  marche: { label: "À pied", emoji: "🚶" },
  taxi: { label: "Taxi / VTC", emoji: "🚕" },
  velo: { label: "Vélo", emoji: "🚲" },
  ferry: { label: "Bateau", emoji: "⛴️" },
};

export interface RankedRoute {
  route: TransportRoute;
  costPerPerson: number;
  total: number;
  /** Plus c'est bas, mieux c'est (coût + temps valorisé). */
  score: number;
}

function isEligible(route: TransportRoute, prefs: Preferences) {
  if (route.mode === "voiture") return prefs.travelers >= 2 && route.durationHours <= 9;
  if (route.mode === "bus") return route.durationHours <= 15;
  return true;
}

/**
 * Classe les trajets possibles. Fonction pure : utilisée aussi par le budget
 * et le score des destinations (sans appel au fournisseur).
 */
export function rankRoutes(profile: DestinationProfile, prefs: Preferences): RankedRoute[] {
  const people = Math.max(1, prefs.travelers);
  const vehicles = Math.ceil(people / SEATS_PER_CAR);
  // Valeur d'une heure de trajet selon les priorités.
  const hourValue = prefs.priorities.has("rapidite") ? 40 : prefs.prefersEconomy ? 6 : 15;

  const eligible = profile.access.routes.filter((r) => isEligible(r, prefs));
  const routes = eligible.length > 0 ? eligible : profile.access.routes;

  return routes
    .map((route) => {
      const total =
        route.roundTripPerVehicle !== undefined
          ? route.roundTripPerVehicle * vehicles
          : (route.roundTripPerPerson ?? 0) * people;
      const costPerPerson = Math.round(total / people);
      const hours = (route.durationHours + OVERHEAD_HOURS[route.mode]) * COMFORT_FACTOR[route.mode];
      return { route, costPerPerson, total: Math.round(total), score: costPerPerson + hourValue * hours };
    })
    .sort((a, b) => a.score - b.score);
}

export function recommendedRoute(profile: DestinationProfile, prefs: Preferences): RankedRoute {
  return rankRoutes(profile, prefs)[0]!;
}

/** Durée la plus courte vers la destination (pour la priorité « rapidité »). */
export function fastestDuration(profile: DestinationProfile) {
  return Math.min(...profile.access.routes.map((r) => r.durationHours));
}

function mainHighlight(main: RankedRoute, all: RankedRoute[]) {
  if (all.length === 1) return "L'option la plus logique pour cette distance";
  const cheapest = all.every((r) => r.costPerPerson >= main.costPerPerson);
  const fastest = all.every((r) => r.route.durationHours >= main.route.durationHours);
  if (cheapest && fastest) return "Le plus rapide et le moins cher";
  switch (main.route.mode) {
    case "train":
      return "De centre-ville à centre-ville, sans attente à l'aéroport";
    case "voiture":
      return "Économique à plusieurs, et libre de tes arrêts";
    case "bus":
      return "Le moins cher, idéal pour ton budget";
    default:
      return fastest ? "Le plus rapide pour cette distance" : "Le meilleur compromis temps / prix";
  }
}

function alternativeHighlight(option: RankedRoute, main: RankedRoute) {
  const diff = main.costPerPerson - option.costPerPerson;
  if (diff >= 10) return `Moins cher : environ ${diff} € d'économie par personne`;
  if (option.route.durationHours < main.route.durationHours) return "Plus rapide, un peu plus cher";
  switch (option.route.mode) {
    case "train":
      return "Plus confortable, de centre-ville à centre-ville";
    case "bus":
      return "Sans conduire, mais plus long";
    case "voiture":
      return "Plus de liberté sur place";
    default:
      return "Une autre option possible";
  }
}

function toOption(ranked: RankedRoute, profile: DestinationProfile, highlight: string): TransportOption {
  const { route } = ranked;
  return {
    id: `${profile.id}-${route.mode}`,
    mode: route.mode,
    from: profile.access.from,
    to: profile.name,
    durationLabel: route.durationLabel,
    durationHours: route.durationHours,
    estimatedRoundTripPerPerson: ranked.costPerPerson,
    estimatedRoundTripTotal: ranked.total,
    highlight,
    details: route.details,
    source: profile.source,
  };
}

/** Fournisseur de DÉMONSTRATION : trajets moyens du catalogue, sans disponibilités réelles. */
export const demoTransportProvider: TransportProvider = {
  id: "ovo-demo-transport",
  async getTransport({ profile, prefs }) {
    const ranked = rankRoutes(profile, prefs);
    const [main, ...others] = ranked;
    return {
      main: toOption(main!, profile, mainHighlight(main!, ranked)),
      alternatives: others.map((r) => toOption(r, profile, alternativeHighlight(r, main!))),
      local: {
        options: profile.localMobility.map((hint) => ({
          mode: hint.mode,
          label: LOCAL_MOBILITY_LABELS[hint.mode].label,
          description: hint.description,
        })),
        estimatedCostPerDayPerPerson: profile.costs.localTransportPerDay,
      },
      source: profile.source,
    };
  },
};
