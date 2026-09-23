import type { Ambiance, BudgetRangeId, BudgetScope, DurationId, Priority, TravelStyle } from "@/types/trip";

export interface ChoiceOption<T extends string> {
  id: T;
  label: string;
  emoji: string;
  description?: string;
}

export const travelStyleOptions: ChoiceOption<TravelStyle>[] = [
  { id: "plage", label: "Plage", emoji: "🏖️" },
  { id: "ville", label: "Ville", emoji: "🏙️" },
  { id: "fete", label: "Fête / nightlife", emoji: "🎉" },
  { id: "nature", label: "Nature", emoji: "🌿" },
  { id: "aventure", label: "Aventure", emoji: "🏔️" },
  { id: "romantique", label: "Romantique", emoji: "❤️" },
  { id: "gastronomie", label: "Gastronomie", emoji: "🍜" },
  { id: "culture", label: "Culture", emoji: "🎭" },
  { id: "shopping", label: "Shopping", emoji: "🛍️" },
  { id: "detente", label: "Détente", emoji: "😌" },
  { id: "festivals", label: "Festivals / événements", emoji: "🎶" },
];

export const ambianceOptions: ChoiceOption<Ambiance>[] = [
  { id: "calme", label: "Calme", emoji: "🌙", description: "Loin de la foule" },
  { id: "festive", label: "Festive", emoji: "🪩", description: "Ça bouge jusqu'au bout de la nuit" },
  { id: "aventureuse", label: "Aventureuse", emoji: "🧭", description: "Sortir des sentiers battus" },
  { id: "romantique", label: "Romantique", emoji: "🌹", description: "À deux, en douceur" },
  { id: "luxueuse", label: "Luxueuse", emoji: "✨", description: "Se faire plaisir" },
  { id: "economique", label: "Économique", emoji: "💸", description: "Malin et pas cher" },
  { id: "sociale", label: "Sociale", emoji: "🤝", description: "Rencontrer du monde" },
  { id: "authentique", label: "Authentique", emoji: "🏡", description: "Vivre comme un local" },
];

export const priorityOptions: ChoiceOption<Priority>[] = [
  { id: "prix", label: "Prix", emoji: "💰" },
  { id: "confort", label: "Confort", emoji: "🛏️" },
  { id: "rapidite", label: "Rapidité", emoji: "⚡" },
  { id: "activites", label: "Activités", emoji: "🎯" },
  { id: "vie-nocturne", label: "Vie nocturne", emoji: "🌃" },
  { id: "plages", label: "Plages", emoji: "🌊" },
  { id: "culture", label: "Culture", emoji: "🏛️" },
  { id: "gastronomie", label: "Gastronomie", emoji: "🍝" },
  { id: "nature", label: "Nature", emoji: "🌲" },
  { id: "securite", label: "Sécurité", emoji: "🛡️" },
];

export interface DurationOption extends ChoiceOption<DurationId> {
  minDays: number;
  maxDays: number | null;
}

export const durationOptions: DurationOption[] = [
  { id: "weekend", label: "Week-end", emoji: "⚡", description: "2 à 3 jours", minDays: 2, maxDays: 3 },
  { id: "3-4-jours", label: "3–4 jours", emoji: "🎒", description: "Court séjour", minDays: 3, maxDays: 4 },
  { id: "5-7-jours", label: "5–7 jours", emoji: "🧳", description: "Une semaine", minDays: 5, maxDays: 7 },
  {
    id: "1-2-semaines",
    label: "1–2 semaines",
    emoji: "✈️",
    description: "Grand voyage",
    minDays: 8,
    maxDays: 14,
  },
  {
    id: "plus-2-semaines",
    label: "Plus de 2 semaines",
    emoji: "🌍",
    description: "L'aventure au long cours",
    minDays: 15,
    maxDays: null,
  },
];

/** Durée correspondant à un nombre de jours exact (dates fixées). */
export function durationIdFromDays(days: number): DurationId {
  if (days <= 3) return "weekend";
  if (days <= 4) return "3-4-jours";
  if (days <= 7) return "5-7-jours";
  if (days <= 14) return "1-2-semaines";
  return "plus-2-semaines";
}

export interface BudgetRangeOption {
  id: BudgetRangeId;
  label: string;
  description: string;
  /** Bornes en euros (max null = illimité). */
  min: number;
  max: number | null;
}

export const budgetRangeOptions: BudgetRangeOption[] = [
  { id: "moins-300", label: "Moins de 300 €", description: "Petit budget, grandes idées", min: 0, max: 300 },
  { id: "300-500", label: "300 – 500 €", description: "Le bon plan", min: 300, max: 500 },
  { id: "500-800", label: "500 – 800 €", description: "Confortable", min: 500, max: 800 },
  { id: "800-1200", label: "800 – 1 200 €", description: "On se fait plaisir", min: 800, max: 1200 },
  { id: "1200-2000", label: "1 200 – 2 000 €", description: "Grand voyage", min: 1200, max: 2000 },
  { id: "plus-2000", label: "2 000 € ou plus", description: "Sans compter", min: 2000, max: null },
];

export const budgetScopeLabels: Record<BudgetScope, string> = {
  "per-person": "par personne",
  total: "pour tout le groupe",
};

/** Limites acceptées pour un budget personnalisé (en euros). */
export const CUSTOM_BUDGET_LIMITS = { minPerPerson: 50, max: 100_000 } as const;

export const TRAVELERS_LIMITS = { min: 1, max: 20 } as const;

export const WISHES_MAX_LENGTH = 500;

/** Retrouve le libellé d'une option à partir de son id. */
export function labelOf<T extends string>(options: ChoiceOption<T>[], id: T) {
  const option = options.find((o) => o.id === id);
  return option ? `${option.emoji} ${option.label}` : id;
}
