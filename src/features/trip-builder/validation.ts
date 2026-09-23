import { addDays, nightsBetween, parseIsoDate, todayIso } from "@/lib/dates";
import { CUSTOM_BUDGET_LIMITS, TRAVELERS_LIMITS, WISHES_MAX_LENGTH } from "@/lib/trip/options";
import type { StepId, TripDraft } from "./types";

/** Limites de dates acceptées. */
export const DATE_LIMITS = {
  /** Départ au plus tard dans 2 ans. */
  maxDaysAhead: 730,
  /** Séjour de 90 nuits maximum. */
  maxNights: 90,
} as const;

/** Parse un montant saisi (« 1 200 », « 1200€ »…) ; null si invalide. */
export function parseAmount(value: string): number | null {
  const cleaned = value.replace(/[\s €]/g, "").replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  return Math.round(Number(cleaned));
}

export function validateDates(draft: TripDraft, today = todayIso()): string | null {
  if (draft.datesMode === null) return "Choisis des dates précises ou indique que tu es flexible.";
  if (draft.datesMode === "flexible") return null;

  if (!draft.departureDate) return "Indique ta date de départ.";
  if (!parseIsoDate(draft.departureDate)) return "La date de départ n'est pas valide.";
  if (draft.departureDate < today) return "La date de départ ne peut pas être dans le passé.";
  if (draft.departureDate > addDays(today, DATE_LIMITS.maxDaysAhead))
    return "On ne planifie pas encore aussi loin : choisis un départ dans les 2 ans.";

  if (!draft.returnDate) return "Indique ta date de retour.";
  if (!parseIsoDate(draft.returnDate)) return "La date de retour n'est pas valide.";

  const nights = nightsBetween(draft.departureDate, draft.returnDate) ?? 0;
  if (nights <= 0) return "La date de retour doit être après la date de départ.";
  if (nights > DATE_LIMITS.maxNights)
    return `Ton séjour ne peut pas dépasser ${DATE_LIMITS.maxNights} nuits.`;
  return null;
}

export function validateBudget(draft: TripDraft): string | null {
  if (draft.budgetMode === null) return "Choisis une fourchette ou indique ton propre budget.";
  if (draft.budgetMode === "range") return draft.budgetRangeId ? null : "Choisis une fourchette de budget.";

  if (!draft.customBudget.trim()) return "Indique ton budget en euros.";
  const amount = parseAmount(draft.customBudget);
  if (amount === null) return "Ton budget doit être un nombre (ex. 650).";
  if (amount > CUSTOM_BUDGET_LIMITS.max) return "Ce budget dépasse la limite acceptée (100 000 €).";

  const people = draft.budgetScope === "total" ? Math.max(1, draft.travelersCount ?? 1) : 1;
  if (amount / people < CUSTOM_BUDGET_LIMITS.minPerPerson)
    return `Prévois au moins ${CUSTOM_BUDGET_LIMITS.minPerPerson} € par personne pour un voyage réaliste.`;
  return null;
}

const validators: Record<StepId, (draft: TripDraft) => string | null> = {
  destination: (draft) => {
    if (draft.destinationMode === null) return "Dis-nous si tu as déjà une destination en tête.";
    if (draft.destinationMode === "known" && !draft.destination)
      return "Recherche et sélectionne ta destination.";
    return null;
  },
  dates: (draft) => validateDates(draft),
  duration: (draft) => (draft.durationId ? null : "Choisis une durée approximative."),
  travelers: (draft) => {
    const count = draft.travelersCount;
    if (count === null) return "Indique le nombre de voyageurs.";
    if (!Number.isInteger(count) || count < TRAVELERS_LIMITS.min || count > TRAVELERS_LIMITS.max)
      return `Le groupe doit compter entre ${TRAVELERS_LIMITS.min} et ${TRAVELERS_LIMITS.max} personnes.`;
    if (draft.children < 0 || draft.children >= count) return "Il faut au moins un adulte dans le groupe.";
    return null;
  },
  budget: validateBudget,
  styles: (draft) => (draft.styles.length > 0 ? null : "Choisis au moins un style de voyage."),
  ambiance: (draft) => (draft.ambiances.length > 0 ? null : "Choisis au moins une ambiance."),
  priorities: (draft) => (draft.priorities.length > 0 ? null : "Choisis au moins une priorité."),
  wishes: (draft) =>
    draft.wishes.length > WISHES_MAX_LENGTH ? `${WISHES_MAX_LENGTH} caractères maximum.` : null,
};

/** Message d'erreur de l'étape, ou null si elle est valide. */
export function validateStep(stepId: StepId, draft: TripDraft): string | null {
  return validators[stepId](draft);
}
