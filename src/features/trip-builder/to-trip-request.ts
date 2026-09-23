import { nightsBetween } from "@/lib/dates";
import { durationIdFromDays } from "@/lib/trip/options";
import type { TripRequest } from "@/types/trip";
import { getVisibleSteps } from "./steps";
import type { TripDraft } from "./types";
import { parseAmount, validateStep } from "./validation";

/**
 * Convertit le brouillon en demande de voyage structurée.
 * Retourne null si une étape obligatoire est encore invalide.
 */
export function toTripRequest(draft: TripDraft): TripRequest | null {
  const invalid = getVisibleSteps(draft).some((step) => validateStep(step.id, draft) !== null);
  if (invalid) return null;

  const destination: TripRequest["destination"] =
    draft.destinationMode === "known" && draft.destination
      ? { mode: "known", place: draft.destination }
      : { mode: "open" };

  let dates: TripRequest["dates"];
  let duration: TripRequest["duration"];
  if (draft.datesMode === "fixed") {
    dates = { mode: "fixed", departureDate: draft.departureDate, returnDate: draft.returnDate };
    const days = (nightsBetween(draft.departureDate, draft.returnDate) ?? 0) + 1;
    duration = { id: durationIdFromDays(days), days };
  } else {
    dates = { mode: "flexible", preferredMonth: draft.preferredMonth };
    if (!draft.durationId) return null;
    duration = { id: draft.durationId, days: null };
  }

  const count = draft.travelersCount ?? 1;
  const travelers = { adults: count - draft.children, children: draft.children };

  let budget: TripRequest["budget"];
  if (draft.budgetMode === "custom") {
    const amount = parseAmount(draft.customBudget);
    if (amount === null) return null;
    budget = { mode: "custom", amount, scope: draft.budgetScope };
  } else {
    if (!draft.budgetRangeId) return null;
    budget = { mode: "range", rangeId: draft.budgetRangeId, scope: draft.budgetScope };
  }

  const wishes = draft.wishes.trim();

  return {
    destination,
    dates,
    duration,
    travelers,
    budget,
    styles: draft.styles,
    ambiances: draft.ambiances,
    priorities: draft.priorities,
    wishes: wishes || null,
  };
}
