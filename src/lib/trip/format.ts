import { formatDateFr, formatMonthFr } from "@/lib/dates";
import { formatPrice } from "@/lib/utils";
import type { TripRequest } from "@/types/trip";
import { travelersCount } from "./budget";
import { budgetRangeOptions, budgetScopeLabels, durationOptions } from "./options";

/** Mise en forme lisible d'une demande de voyage (récapitulatif, partage…). */

export function formatDestination({ destination }: TripRequest) {
  if (destination.mode === "open") return "Surprends-moi : OVO choisit pour toi";
  const { name, country } = destination.place;
  return country ? `${name}, ${country}` : name;
}

export function formatDates({ dates }: TripRequest) {
  if (dates.mode === "fixed") {
    return `Du ${formatDateFr(dates.departureDate)} au ${formatDateFr(dates.returnDate)}`;
  }
  return dates.preferredMonth
    ? `Flexible, plutôt en ${formatMonthFr(dates.preferredMonth)}`
    : "Flexible sur les dates";
}

export function formatDuration({ duration }: TripRequest) {
  if (duration.days !== null) {
    const nights = duration.days - 1;
    return `${duration.days} jours · ${nights} nuit${nights > 1 ? "s" : ""}`;
  }
  const option = durationOptions.find((o) => o.id === duration.id);
  return option ? `${option.label} (${option.description})` : duration.id;
}

export function formatTravelers({ travelers }: TripRequest) {
  const total = travelersCount(travelers);
  const parts = [`${travelers.adults} adulte${travelers.adults > 1 ? "s" : ""}`];
  if (travelers.children > 0) parts.push(`${travelers.children} enfant${travelers.children > 1 ? "s" : ""}`);
  return `${total} voyageur${total > 1 ? "s" : ""} · ${parts.join(" et ")}`;
}

export function formatBudget({ budget }: TripRequest) {
  const scope = budgetScopeLabels[budget.scope];
  if (budget.mode === "custom") return `${formatPrice(budget.amount)} ${scope}`;
  const range = budgetRangeOptions.find((r) => r.id === budget.rangeId);
  return `${range?.label ?? budget.rangeId} ${scope}`;
}
