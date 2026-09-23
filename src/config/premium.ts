/**
 * OVO Premium — configuration centrale.
 *
 * Tout ce qui distingue Gratuit et Premium se règle ici :
 * - `PREMIUM_PRICING` : prix indicatif affiché (aucun paiement n'est branché) ;
 * - `FEATURES` : chaque fonctionnalité déclare le plan minimum requis ;
 * - `PLAN_LIMITS` : limites chiffrées par plan.
 *
 * Passer une fonctionnalité de Premium à Gratuit (ou l'inverse) = changer `plan`
 * ci-dessous, sans toucher au reste de l'application. Les droits réels sont
 * toujours vérifiés côté serveur (voir src/features/premium/server).
 */

export type PlanId = "free" | "premium";

export const PLANS: Record<PlanId, { name: string; shortName: string; emoji: string; tagline: string }> = {
  free: {
    name: "OVO Gratuit",
    shortName: "Gratuit",
    emoji: "🆓",
    tagline: "Tout pour imaginer, organiser et partager tes voyages.",
  },
  premium: {
    name: "OVO Premium",
    shortName: "Premium",
    emoji: "✨",
    tagline: "Va plus loin dans la préparation de tes voyages.",
  },
};

/** Prix indicatif (en euros, TTC). Modifiable ici uniquement. */
export const PREMIUM_PRICING = {
  monthly: 4.99,
  yearly: 39.99,
  currency: "EUR",
  /** Aucun paiement n'est encore disponible : le prix est affiché à titre indicatif. */
  paymentAvailable: false,
} as const;

/** Limites par plan (`null` = pas de limite). */
export const PLAN_LIMITS: Record<PlanId, { savedTrips: number | null }> = {
  free: { savedTrips: 20 },
  premium: { savedTrips: 200 },
};

export type FeatureId =
  | "trip_creation"
  | "itinerary"
  | "budget"
  | "map"
  | "saved_trips"
  | "share_link"
  | "pdf_export"
  | "pdf_travel_book"
  | "saved_trips_plus"
  | "detailed_trips"
  | "personalized_itinerary"
  | "more_recommendations"
  | "share_advanced";

export interface FeatureDefinition {
  label: string;
  description: string;
  emoji: string;
  /** Plan minimum requis. */
  plan: PlanId;
  /** « soon » : annoncée sur la page Premium, pas encore construite. */
  availability: "available" | "soon";
}

export const FEATURES: Record<FeatureId, FeatureDefinition> = {
  trip_creation: {
    label: "Création de voyages",
    description: "Questionnaire, destination adaptée et voyage complet en deux minutes.",
    emoji: "🧭",
    plan: "free",
    availability: "available",
  },
  itinerary: {
    label: "Itinéraire jour par jour",
    description: "Matin, midi, après-midi, soir, avec horaires et trajets indicatifs.",
    emoji: "📅",
    plan: "free",
    availability: "available",
  },
  budget: {
    label: "Budget détaillé",
    description: "Transport, hébergement, nourriture et activités, estimés pour ton groupe.",
    emoji: "💰",
    plan: "free",
    availability: "available",
  },
  map: {
    label: "Carte interactive",
    description: "Tous les lieux de ton voyage, jour par jour.",
    emoji: "🗺️",
    plan: "free",
    availability: "available",
  },
  saved_trips: {
    label: "Voyages enregistrés",
    description: "Retrouve tes voyages dans ton compte, sur tous tes appareils.",
    emoji: "💾",
    plan: "free",
    availability: "available",
  },
  share_link: {
    label: "Partage par lien",
    description: "Un lien privé à envoyer à tes amis, désactivable à tout moment.",
    emoji: "📤",
    plan: "free",
    availability: "available",
  },
  pdf_export: {
    label: "Export PDF",
    description: "Ton voyage complet dans un PDF propre, à garder ou imprimer.",
    emoji: "📄",
    plan: "free",
    availability: "available",
  },
  pdf_travel_book: {
    label: "Carnet de voyage PDF",
    description:
      "Export PDF avancé : toutes les alternatives de transport et d'hébergement, une checklist de départ adaptée à ta destination et des pages de notes.",
    emoji: "📘",
    plan: "premium",
    availability: "available",
  },
  saved_trips_plus: {
    label: "Plus de voyages enregistrés",
    description: `Jusqu'à ${PLAN_LIMITS.premium.savedTrips} voyages enregistrés au lieu de ${PLAN_LIMITS.free.savedTrips}.`,
    emoji: "🗂️",
    plan: "premium",
    availability: "available",
  },
  detailed_trips: {
    label: "Voyages plus détaillés",
    description: "Plus d'étapes, de conseils et d'infos pratiques pour chaque journée.",
    emoji: "🔍",
    plan: "premium",
    availability: "soon",
  },
  personalized_itinerary: {
    label: "Itinéraires personnalisés",
    description: "Réorganise ton programme, échange des activités, ajuste le rythme.",
    emoji: "🎛️",
    plan: "premium",
    availability: "soon",
  },
  more_recommendations: {
    label: "Plus de recommandations",
    description: "Davantage d'activités et d'adresses sélectionnées pour ton profil.",
    emoji: "🎯",
    plan: "premium",
    availability: "soon",
  },
  share_advanced: {
    label: "Partage avancé",
    description: "Choisis ce que tu partages (budget masqué, programme seul…).",
    emoji: "🔗",
    plan: "premium",
    availability: "soon",
  },
};

/** Le plan donne-t-il accès à cette fonctionnalité ? */
export function planIncludes(plan: PlanId, feature: FeatureId) {
  return FEATURES[feature].plan === "free" || plan === "premium";
}

/** Fonctionnalités d'un plan (pour les cartes comparatives). */
export function featuresOf(plan: PlanId) {
  return (Object.entries(FEATURES) as [FeatureId, FeatureDefinition][])
    .filter(([, f]) => f.plan === plan)
    .map(([id, f]) => ({ id, ...f }));
}
