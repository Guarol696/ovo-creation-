import type { TripRequest } from "@/types/trip";
import { initialDraft } from "./state";
import type { TripDraft } from "./types";

/** Reconstruit le brouillon du questionnaire à partir d'une demande (« Modifier mon voyage »). */
export function fromTripRequest(request: TripRequest): TripDraft {
  const { destination, dates, duration, travelers, budget } = request;
  return {
    ...initialDraft,
    destinationMode: destination.mode,
    destination: destination.mode === "known" ? destination.place : null,
    datesMode: dates.mode,
    departureDate: dates.mode === "fixed" ? dates.departureDate : "",
    returnDate: dates.mode === "fixed" ? dates.returnDate : "",
    preferredMonth: dates.mode === "flexible" ? dates.preferredMonth : null,
    durationId: dates.mode === "flexible" ? duration.id : null,
    travelersCount: travelers.adults + travelers.children,
    children: travelers.children,
    budgetMode: budget.mode,
    budgetRangeId: budget.mode === "range" ? budget.rangeId : null,
    customBudget: budget.mode === "custom" ? String(budget.amount) : "",
    budgetScope: budget.scope,
    styles: [...request.styles],
    ambiances: [...request.ambiances],
    priorities: [...request.priorities],
    wishes: request.wishes ?? "",
  };
}
