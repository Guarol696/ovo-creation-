/**
 * Offres OVO — configuration centrale (Gratuit, Medium, Premium).
 *
 * Tout ce qui distingue les offres se règle ici :
 * - `PLANS` : nom, accroche et prix mensuel affiché de chaque offre ;
 * - `FEATURES` : chaque fonctionnalité déclare l'offre minimum requise ;
 * - `PLAN_LIMITS` : limites chiffrées par offre.
 *
 * Les prix réellement facturés sont ceux des « Prices » Stripe (identifiants dans
 * les variables d'environnement STRIPE_MEDIUM_PRICE_ID / STRIPE_PREMIUM_PRICE_ID) :
 * garder les montants ci-dessous identiques à ceux configurés dans Stripe.
 *
 * Les droits réels sont toujours décidés côté serveur à partir de l'abonnement
 * synchronisé avec Stripe (voir src/features/premium/server et src/features/billing).
 */

export type PlanId = "free" | "medium" | "premium";
export type PaidPlanId = Exclude<PlanId, "free">;

/** Ordre des offres : une offre inclut tout ce que contiennent les offres inférieures. */
export const PLAN_ORDER: PlanId[] = ["free", "medium", "premium"];
export const PAID_PLANS: PaidPlanId[] = ["medium", "premium"];

export interface PlanDefinition {
  name: string;
  shortName: string;
  emoji: string;
  tagline: string;
  /** Prix mensuel affiché (TTC, en euros) ; `0` pour l'offre gratuite. */
  monthlyPrice: number;
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    name: "OVO Gratuit",
    shortName: "Gratuit",
    emoji: "🆓",
    tagline: "Tout pour imaginer, organiser et partager tes voyages.",
    monthlyPrice: 0,
  },
  medium: {
    name: "OVO Medium",
    shortName: "Medium",
    emoji: "⭐",
    tagline: "Pour préparer tes voyages plus sereinement.",
    monthlyPrice: 5.99,
  },
  premium: {
    name: "OVO Premium",
    shortName: "Premium",
    emoji: "✨",
    tagline: "Va plus loin dans la préparation de tes voyages.",
    monthlyPrice: 9.99,
  },
};

export const CURRENCY = "EUR";

/** Limites par offre (`null` = pas de limite). */
export const PLAN_LIMITS: Record<PlanId, { savedTrips: number | null }> = {
  free: { savedTrips: 20 },
  medium: { savedTrips: 60 },
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
  | "share_expiring_links";

export interface FeatureDefinition {
  label: string;
  description: string;
  emoji: string;
  /** Offre minimum requise. */
  plan: PlanId;
}

/**
 * Uniquement des fonctionnalités qui existent réellement : aucune promesse
 * « à venir » n'est affichée aux utilisateurs.
 */
export const FEATURES: Record<FeatureId, FeatureDefinition> = {
  trip_creation: {
    label: "Création de voyages",
    description: "Questionnaire, destination adaptée et voyage complet en deux minutes.",
    emoji: "🧭",
    plan: "free",
  },
  itinerary: {
    label: "Itinéraire jour par jour",
    description: "Matin, midi, après-midi, soir, avec horaires et trajets indicatifs.",
    emoji: "📅",
    plan: "free",
  },
  budget: {
    label: "Budget détaillé",
    description: "Transport, hébergement, nourriture et activités, estimés pour ton groupe.",
    emoji: "💰",
    plan: "free",
  },
  map: {
    label: "Carte interactive",
    description: "Tous les lieux de ton voyage, jour par jour.",
    emoji: "🗺️",
    plan: "free",
  },
  saved_trips: {
    label: "Voyages enregistrés",
    description: "Retrouve tes voyages dans ton compte, sur tous tes appareils.",
    emoji: "💾",
    plan: "free",
  },
  share_link: {
    label: "Partage par lien",
    description: "Un lien privé à envoyer à tes amis, désactivable à tout moment.",
    emoji: "📤",
    plan: "free",
  },
  pdf_export: {
    label: "Export PDF",
    description: "Ton voyage complet dans un PDF propre, à garder ou imprimer.",
    emoji: "📄",
    plan: "free",
  },
  pdf_travel_book: {
    label: "Carnet de voyage PDF",
    description:
      "Export PDF avancé : toutes les alternatives de transport et d'hébergement, une checklist de départ adaptée à ta destination et des pages de notes.",
    emoji: "📘",
    plan: "medium",
  },
  share_expiring_links: {
    label: "Liens de partage à durée limitée",
    description:
      "Choisis combien de temps ton lien de partage reste actif : 7 jours, 30 jours ou sans limite.",
    emoji: "⏳",
    plan: "premium",
  },
};

const rank = (plan: PlanId) => PLAN_ORDER.indexOf(plan);

export const isPaidPlan = (plan: PlanId): plan is PaidPlanId => plan !== "free";

/** L'offre donne-t-elle accès à cette fonctionnalité ? (Premium ⊃ Medium ⊃ Gratuit) */
export function planIncludes(plan: PlanId, feature: FeatureId) {
  return rank(plan) >= rank(FEATURES[feature].plan);
}

/** Fonctionnalités apportées par une offre (en plus des offres inférieures). */
export function featuresOf(plan: PlanId) {
  return (Object.entries(FEATURES) as [FeatureId, FeatureDefinition][])
    .filter(([, f]) => f.plan === plan)
    .map(([id, f]) => ({ id, ...f }));
}

/** « OVO Medium et OVO Premium » : offres donnant accès à une fonctionnalité. */
export function plansIncluding(feature: FeatureId) {
  return PLAN_ORDER.filter((p) => isPaidPlan(p) && planIncludes(p, feature)).map((p) => PLANS[p].name);
}
