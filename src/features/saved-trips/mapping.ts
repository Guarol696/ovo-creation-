import { formatMonthFr, parseIsoDate } from "@/lib/dates";
import type { TravelPlan } from "@/types/travel-plan";
import type { TripRequest } from "@/types/trip";

/**
 * Conversion TravelPlan ⇄ ligne `saved_trips`.
 * Les colonnes d'affichage (titre, dates, budget…) sont dérivées du plan côté
 * serveur : la liste « Mes voyages » s'affiche sans charger les plans complets.
 */

export interface SavedTripRow {
  id: string;
  title: string;
  destination: string;
  country: string | null;
  country_code: string | null;
  start_date: string | null;
  end_date: string | null;
  duration: number | null;
  travelers: number | null;
  budget: number | null;
  request: TripRequest;
  travel_plan: unknown;
  is_public: boolean;
  share_token: string | null;
  shared_at: string | null;
  share_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export type SavedTripInsert = Pick<
  SavedTripRow,
  | "title"
  | "destination"
  | "country"
  | "country_code"
  | "start_date"
  | "end_date"
  | "duration"
  | "travelers"
  | "budget"
  | "request"
> & { request_hash: string; travel_plan: TravelPlan };

export interface SavedTripSummary {
  id: string;
  title: string;
  destination: string;
  country: string | null;
  flag: string;
  dates: string;
  duration: number | null;
  travelers: number | null;
  budget: number | null;
  createdAt: string;
  isPublic: boolean;
}

export function planToRow(plan: TravelPlan, requestHash: string): SavedTripInsert {
  const code = plan.destination.countryCode?.toUpperCase();
  return {
    title: `Voyage à ${plan.destination.name}`.slice(0, 120),
    destination: plan.destination.name,
    country: plan.destination.country || null,
    country_code: code && /^[A-Z]{2}$/.test(code) ? code : null,
    start_date: plan.dates.departureDate,
    end_date: plan.dates.returnDate,
    duration: plan.duration.days,
    travelers: plan.travelers.total,
    budget: Math.round(plan.estimatedBudget.total),
    request: plan.request,
    request_hash: requestHash,
    travel_plan: withoutPrivateNotes(plan),
  };
}

/**
 * Le texte libre « envie particulière » peut être personnel : il n'est jamais
 * enregistré dans le TravelPlan (seulement dans la colonne privée `request`),
 * ni affiché sur une page partagée.
 */
export function withoutPrivateNotes(plan: TravelPlan): TravelPlan {
  return plan.request.wishes === null ? plan : { ...plan, request: { ...plan.request, wishes: null } };
}

/** Drapeau emoji à partir du code pays ISO (« PT » → 🇵🇹). */
export function flagEmoji(countryCode: string | null | undefined) {
  if (!countryCode || !/^[A-Za-z]{2}$/.test(countryCode)) return "🌍";
  return String.fromCodePoint(...[...countryCode.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

const dayMonth = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
const dayOnly = new Intl.DateTimeFormat("fr-FR", { day: "numeric" });

/** « 12 → 17 juin », « 28 juin → 3 juil. », avec l'année si ce n'est pas l'année en cours. */
export function formatDateRange(start: string, end: string, now = new Date()) {
  const a = parseIsoDate(start);
  const b = parseIsoDate(end);
  if (!a || !b) return "Dates à définir";
  const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  const year = b.getFullYear() !== now.getFullYear() ? ` ${b.getFullYear()}` : "";
  const from = sameMonth ? dayOnly.format(a) : dayMonth.format(a);
  return `${from} → ${dayMonth.format(b)}${year}`;
}

export function formatTripDates(
  row: Pick<SavedTripRow, "start_date" | "end_date" | "request">,
  now = new Date(),
) {
  if (row.start_date && row.end_date) return formatDateRange(row.start_date, row.end_date, now);
  const dates = row.request?.dates;
  if (dates?.mode === "flexible" && dates.preferredMonth)
    return `Dates flexibles · ${formatMonthFr(dates.preferredMonth)}`;
  return "Dates flexibles";
}

export function rowToSummary(row: SavedTripRow, now = new Date()): SavedTripSummary {
  return {
    id: row.id,
    title: row.title,
    destination: row.destination,
    country: row.country,
    flag: flagEmoji(row.country_code),
    dates: formatTripDates(row, now),
    duration: row.duration,
    travelers: row.travelers,
    budget: row.budget,
    createdAt: row.created_at,
    // Un lien expiré ne fonctionne plus : le voyage n'est plus considéré comme partagé.
    isPublic:
      row.is_public && !(row.share_expires_at && new Date(row.share_expires_at).getTime() <= now.getTime()),
  };
}

/** Le plan enregistré a-t-il la forme attendue par l'affichage actuel ? */
export function isUsablePlan(value: unknown): value is TravelPlan {
  if (!value || typeof value !== "object") return false;
  const plan = value as Partial<TravelPlan>;
  return (
    plan.version === 1 &&
    typeof plan.destination?.name === "string" &&
    Array.isArray(plan.itinerary) &&
    Array.isArray(plan.activities) &&
    Array.isArray(plan.restaurants) &&
    typeof plan.estimatedBudget?.total === "number" &&
    typeof plan.map === "object" &&
    plan.map !== null &&
    typeof plan.accommodation?.main === "object" &&
    typeof plan.transport?.main === "object"
  );
}
