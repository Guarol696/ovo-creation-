import { affiliate, type TravelpayoutsProgram } from "@/config/affiliate";
import type { ActivityCategory, PlanActivity, TravelPlan } from "@/types/travel-plan";

/**
 * Liens « Voir les prix et réserver » vers les sites partenaires.
 * OVO ne réserve rien : il ouvre une recherche déjà remplie (ville, dates,
 * voyageurs) chez le partenaire, qui affiche ses vrais prix.
 */
export interface PartnerLink {
  href: string;
  label: string;
  partner: string;
}

/** Aéroport de départ (Paris, toutes plateformes : code ville Aviasales). */
const ORIGIN_IATA = "PAR";

/** Activités pour lesquelles des billets ou visites se réservent en ligne. */
const BOOKABLE: ReadonlySet<ActivityCategory> = new Set([
  "monument",
  "musee",
  "excursion",
  "aventure",
  "evenement",
]);

const clampCount = (n: number) => Math.min(9, Math.max(1, n));

/** « 2026-10-09 » → « 0910 » (format des recherches Aviasales). */
const ddmm = (iso: string) => `${iso.slice(8, 10)}${iso.slice(5, 7)}`;

/** Passe par Travelpayouts quand le programme du partenaire est renseigné (commission). */
export function viaTravelpayouts(url: string, program: TravelpayoutsProgram) {
  if (!program.trs || !program.p || !program.campaignId) return url;
  const params = new URLSearchParams({
    marker: affiliate.marker,
    trs: program.trs,
    p: program.p,
    u: url,
    campaign_id: program.campaignId,
  });
  return `https://tp.media/r?${params}`;
}

function fixedDates(plan: TravelPlan) {
  const { departureDate, returnDate } = plan.dates;
  return departureDate && returnDate ? { departureDate, returnDate } : null;
}

/** Vols depuis Paris, seulement si l'avion fait partie des options proposées. */
export function flightsLink(plan: TravelPlan): PartnerLink | null {
  const options = [plan.transport.main, ...plan.transport.alternatives];
  if (!options.some((o) => o.mode === "avion")) return null;
  const city = plan.destination.name;
  const dates = fixedDates(plan);
  const iata = plan.destination.iata;

  if (iata && dates) {
    const search = `${ORIGIN_IATA}${ddmm(dates.departureDate)}${iata}${ddmm(dates.returnDate)}${clampCount(plan.travelers.adults)}`;
    return {
      href: `https://www.aviasales.com/search/${search}?${new URLSearchParams({ marker: affiliate.marker })}`,
      label: `Voir les vols Paris → ${city}`,
      partner: affiliate.flights.partner,
    };
  }
  // Sans dates fixes (ou sans aéroport connu) : recherche flexible.
  const query = `Vols Paris ${city} aller-retour`;
  return {
    href: `https://www.google.com/travel/flights?${new URLSearchParams({ q: query, hl: "fr", curr: "EUR" })}`,
    label: `Voir les vols Paris → ${city}`,
    partner: "Google Vols",
  };
}

/** Hébergements dans la ville, aux dates et pour le nombre de voyageurs du voyage. */
export function hotelsLink(plan: TravelPlan): PartnerLink {
  const { name, country } = plan.destination;
  const { adults, children } = plan.travelers;
  const params = new URLSearchParams({
    ss: `${name}, ${country}`,
    group_adults: String(clampCount(adults)),
    group_children: String(Math.min(9, children)),
    no_rooms: String(Math.max(1, Math.ceil(adults / 2))),
    selected_currency: "EUR",
    lang: "fr",
  });
  const dates = fixedDates(plan);
  if (dates) {
    params.set("checkin", dates.departureDate);
    params.set("checkout", dates.returnDate);
  }
  return {
    href: viaTravelpayouts(
      `https://www.booking.com/searchresults.fr.html?${params}`,
      affiliate.hotels.program,
    ),
    label: `Voir les hébergements à ${name}`,
    partner: affiliate.hotels.partner,
  };
}

function activitiesSearch(query: string) {
  return viaTravelpayouts(
    `https://www.getyourguide.fr/s/?${new URLSearchParams({ q: query })}`,
    affiliate.activities.program,
  );
}

/** Visites et activités à réserver dans la ville. */
export function activitiesLink(plan: TravelPlan): PartnerLink {
  const city = plan.destination.name;
  return {
    href: activitiesSearch(city),
    label: `Réserver des visites à ${city}`,
    partner: affiliate.activities.partner,
  };
}

/** Billets d'une activité précise (payante et réservable), sinon null. */
export function activityTicketLink(activity: PlanActivity, city: string): PartnerLink | null {
  if (activity.estimatedCostPerPerson <= 0 || !BOOKABLE.has(activity.category)) return null;
  return {
    href: activitiesSearch(`${activity.name} ${city}`),
    label: "Billets & visites",
    partner: affiliate.activities.partner,
  };
}

/** Recherche Google Maps d'un lieu réel (horaires, avis, itinéraire). */
export function mapsLink(name: string, city: string) {
  return `https://www.google.com/maps/search/?${new URLSearchParams({ api: "1", query: `${name}, ${city}` })}`;
}

export interface PlanPartnerLinks {
  flights: PartnerLink | null;
  hotels: PartnerLink;
  activities: PartnerLink;
}

export function partnerLinks(plan: TravelPlan): PlanPartnerLinks {
  return { flights: flightsLink(plan), hotels: hotelsLink(plan), activities: activitiesLink(plan) };
}
