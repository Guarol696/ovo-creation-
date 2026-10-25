import type { Access } from "@/types/academy";

/**
 * Offres affichées sur /pricing. Prix, libellés et avantages se modifient ici.
 * Les avantages ne citent que des fonctionnalités qui existent réellement.
 * Les identifiants de prix Stripe restent côté serveur (STRIPE_PRICE_PRO, STRIPE_PRICE_PREMIUM).
 */
export type PlanId = Access;

export interface Plan {
  id: PlanId;
  name: string;
  /** Prix affiché, en euros TTC par mois (null = gratuit). Doit correspondre au prix Stripe. */
  monthlyPrice: number | null;
  pitch: string;
  features: string[];
  highlight?: boolean;
}

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: null,
    pitch: "Découvrir la plateforme et les formations gratuites.",
    features: [
      "Accès aux formations gratuites",
      "Les 5 parcours entrepreneuriaux",
      "Lecteur de formation et notes personnelles",
      "Suivi de progression",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 19,
    pitch: "Les formations de l'offre Pro pour construire vos projets.",
    features: [
      "Tout Free",
      "Formations marquées « Pro »",
      "Tableau de bord des projets personnels",
      "Assistant IA (si activé sur la plateforme)",
    ],
    highlight: true,
  },
  {
    id: "premium",
    name: "Premium",
    monthlyPrice: 39,
    pitch: "Les contenus avancés, pour aller jusqu'au lancement.",
    features: ["Tout Pro", "Formations avancées marquées « Premium »", "Accès prioritaire aux nouveaux contenus"],
  },
];

export const planById = (id: PlanId) => plans.find((plan) => plan.id === id)!;

const rank: Record<PlanId, number> = { free: 0, pro: 1, premium: 2 };

/** Règle d'accès unique, utilisée côté serveur (pages et actions). */
export const canAccess = (userPlan: PlanId, required: Access) => rank[userPlan] >= rank[required];
