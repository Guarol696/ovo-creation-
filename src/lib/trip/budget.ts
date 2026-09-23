import type { TripBudget, TripTravelers } from "@/types/trip";
import { budgetRangeOptions } from "./options";

export interface BudgetBounds {
  min: number;
  max: number | null;
}

export function travelersCount(travelers: TripTravelers) {
  return travelers.adults + travelers.children;
}

/** Bornes du budget pour tout le groupe, en euros. */
export function getTotalBudgetBounds(budget: TripBudget, travelers: TripTravelers): BudgetBounds {
  const people = Math.max(1, travelersCount(travelers));
  const perPerson = budget.scope === "per-person";

  if (budget.mode === "custom") {
    const total = perPerson ? budget.amount * people : budget.amount;
    return { min: total, max: total };
  }

  const range = budgetRangeOptions.find((r) => r.id === budget.rangeId);
  if (!range) return { min: 0, max: null };
  const factor = perPerson ? people : 1;
  return { min: range.min * factor, max: range.max === null ? null : range.max * factor };
}

/** Bornes du budget par personne, en euros (base de calcul du futur moteur). */
export function getPerPersonBudgetBounds(budget: TripBudget, travelers: TripTravelers): BudgetBounds {
  const people = Math.max(1, travelersCount(travelers));
  const total = getTotalBudgetBounds(budget, travelers);
  return {
    min: Math.round(total.min / people),
    max: total.max === null ? null : Math.round(total.max / people),
  };
}
