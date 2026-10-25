import type { Category, CategorySlug, Level, Access } from "@/types/academy";

export const categories: Category[] = [
  {
    slug: "sites-web",
    index: "01",
    label: "Création de sites",
    motif: "grille",
    description: "Structurer, écrire et mettre en ligne des sites qui servent un objectif précis.",
  },
  {
    slug: "intelligence-artificielle",
    index: "02",
    label: "Intelligence artificielle",
    motif: "réseau",
    description: "Utiliser l'IA comme copilote, puis l'intégrer dans un produit ou une activité.",
  },
  {
    slug: "entrepreneuriat",
    index: "03",
    label: "Entrepreneuriat",
    motif: "pyramide",
    description: "Passer d'une idée à une offre claire, testée auprès de vrais clients.",
  },
  {
    slug: "applications",
    index: "04",
    label: "Applications & logiciels",
    motif: "modules",
    description: "Concevoir une application : besoin, parcours, maquettes, périmètre de V1.",
  },
  {
    slug: "e-commerce",
    index: "05",
    label: "E-commerce",
    motif: "orbite",
    description: "Lancer une boutique : catalogue, paiement, logistique, premières ventes.",
  },
  {
    slug: "marketing",
    index: "06",
    label: "Marketing",
    motif: "onde",
    description: "Construire une stratégie d'acquisition mesurable, canal par canal.",
  },
  {
    slug: "freelancing",
    index: "07",
    label: "Freelancing",
    motif: "trajectoire",
    description: "Positionnement, prospection, devis : vivre de ses compétences.",
  },
];

export const categoryBySlug = (slug: string) => categories.find((category) => category.slug === slug);

export const isCategorySlug = (value: string): value is CategorySlug =>
  categories.some((category) => category.slug === value);

export const levels: { value: Level; label: string }[] = [
  { value: "debutant", label: "Débutant" },
  { value: "intermediaire", label: "Intermédiaire" },
  { value: "avance", label: "Avancé" },
];

export const levelLabel = (level: Level) => levels.find((item) => item.value === level)?.label ?? level;

export const accessLabel: Record<Access, string> = {
  free: "Gratuit",
  pro: "Inclus dans Pro",
  premium: "Inclus dans Premium",
};
