import type {
  GeoPoint,
  ItineraryDay,
  ItinerarySlot,
  PlanAccommodation,
  PlanLocation,
  TravelLeg,
  TripMap,
} from "@/types/travel-plan";
import type { DestinationProfile } from "./data-source/types";
import type { ItineraryResult } from "./itinerary";
import { ACTIVITY_THEMES } from "./services/activities";

/**
 * Lieux du voyage et trajets entre étapes.
 *
 *   TravelPlan → itinéraire → lieux (PlanLocation) → marqueurs de carte
 *
 * Coordonnées de DÉMONSTRATION (données du catalogue) : les lieux connus
 * sont placés approximativement, les restaurants fictifs dans leur quartier.
 * Les distances sont calculées à vol d'oiseau et les temps sont estimés :
 * aucun service de calcul d'itinéraire n'est utilisé.
 */

/** Idées hors programme affichées comme « points d'intérêt ». */
const MAX_POIS = 8;
const WALK_KMH = 4.5;
const TRANSIT_KMH = 18;
const ROAD_KMH = 60;

export const HOTEL_LOCATION_ID = "hotel";
export const activityLocationId = (id: string) => `activity:${id}`;
export const restaurantLocationId = (id: string) => `restaurant:${id}`;

function hash(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

/** Décalage stable (≈ 80 à 250 m) pour ne pas superposer les lieux d'un même quartier. */
function jitter(point: GeoPoint, seed: string): GeoPoint {
  const h = hash(seed);
  const angle = ((h % 360) * Math.PI) / 180;
  const radius = 0.0008 + ((h >>> 9) % 100) * 0.000017;
  return {
    lat: Math.round((point.lat + Math.sin(angle) * radius) * 1e5) / 1e5,
    lng: Math.round((point.lng + Math.cos(angle) * radius * 1.3) * 1e5) / 1e5,
  };
}

/** Distance à vol d'oiseau (formule de haversine), en km. */
export function distanceKm(a: GeoPoint, b: GeoPoint) {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Trajet estimé : à pied jusqu'à 2 km, transports en ville, route au-delà de 15 km (excursions). */
export function estimateLeg(from: GeoPoint, to: GeoPoint): TravelLeg {
  const km = distanceKm(from, to);
  const roundTo5 = (v: number) => Math.max(5, Math.round(v / 5) * 5);
  if (km <= 2)
    return { distanceKm: Math.round(km * 10) / 10, minutes: roundTo5((km / WALK_KMH) * 60), mode: "walk" };
  if (km <= 15) {
    return {
      distanceKm: Math.round(km * 10) / 10,
      minutes: roundTo5(8 + (km / TRANSIT_KMH) * 60),
      mode: "transit",
    };
  }
  return { distanceKm: Math.round(km), minutes: roundTo5(15 + (km / ROAD_KMH) * 60), mode: "road" };
}

interface MapInput {
  profile: DestinationProfile;
  itinerary: ItineraryResult;
  accommodation: PlanAccommodation;
}

/** Construit les lieux de la carte à partir du programme. */
export function buildTripMap({ profile, itinerary, accommodation }: MapInput): TripMap {
  const geo = profile.geo;
  if (!geo) return { available: false, center: null, zoom: 12, locations: [], source: profile.source };

  const areaPoint = (area?: string) => (area ? geo.neighborhoods[area] : undefined);
  const days = (schedule: { dayNumber: number }[]) => [...new Set(schedule.map((s) => s.dayNumber))];
  const locations: PlanLocation[] = [];

  // 🏨 Hébergement (fictif) : dans son quartier.
  const hotel = accommodation.main;
  locations.push({
    id: HOTEL_LOCATION_ID,
    name: hotel.name,
    category: "accommodation",
    label: "Hébergement",
    emoji: "🏨",
    point: areaPoint(hotel.area) ?? geo.center,
    precision: "approximate",
    description: `Quartier ${hotel.area} : ${hotel.areaDescription}.`,
    dayNumbers: [],
    estimatedCostPerPerson: null,
    refId: hotel.id,
    source: accommodation.source,
  });

  // 🎯 Activités programmées + 🏛️ idées hors programme (points d'intérêt).
  const pois = itinerary.activities.filter((a) => a.schedule.length === 0).slice(0, MAX_POIS);
  for (const activity of [...itinerary.activities.filter((a) => a.schedule.length > 0), ...pois]) {
    const known = geo.places[activity.id];
    const inArea = areaPoint(activity.area);
    locations.push({
      id: activityLocationId(activity.id),
      name: activity.name,
      category: activity.schedule.length > 0 ? "activity" : "poi",
      label: ACTIVITY_THEMES[activity.theme].label,
      emoji: activity.emoji,
      point: known ?? jitter(inArea ?? geo.center, activity.id),
      precision: known ? "landmark" : "approximate",
      description: activity.description,
      dayNumbers: days(activity.schedule),
      estimatedCostPerPerson: activity.estimatedCostPerPerson,
      refId: activity.id,
      source: activity.source,
    });
  }

  // 🍽️ Restaurants (fictifs) : dans leur quartier, sans adresse.
  for (const restaurant of itinerary.restaurants) {
    locations.push({
      id: restaurantLocationId(restaurant.id),
      name: restaurant.name,
      category: "restaurant",
      label: restaurant.cuisine,
      emoji: restaurant.emoji,
      point: jitter(areaPoint(restaurant.area) ?? geo.center, restaurant.id),
      precision: "approximate",
      description: restaurant.description,
      dayNumbers: days(restaurant.schedule),
      estimatedCostPerPerson: restaurant.estimatedCostPerPerson,
      refId: restaurant.id,
      source: restaurant.source,
    });
  }

  return { available: true, center: geo.center, zoom: geo.zoom, locations, source: profile.source };
}

// --- Horaires indicatifs --------------------------------------------------------

function formatTime(hours: number) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}

function slotTimes(slot: ItinerarySlot, isArrival: boolean): Pick<ItinerarySlot, "startTime" | "endTime"> {
  const hours = slot.activity?.durationHours ?? 0;
  switch (slot.period) {
    case "morning":
      if (isArrival) return {};
      if (slot.activity?.fullDay) return { startTime: formatTime(9), endTime: formatTime(18) };
      return slot.activity
        ? { startTime: formatTime(9.5), endTime: formatTime(Math.min(12.5, 9.5 + Math.max(1, hours))) }
        : { startTime: formatTime(10) };
    case "lunch":
      return { startTime: formatTime(12.5), endTime: formatTime(14) };
    case "afternoon":
      return slot.activity
        ? { startTime: formatTime(14.5), endTime: formatTime(Math.min(18.5, 14.5 + Math.max(1, hours))) }
        : { startTime: formatTime(15) };
    case "evening":
      return { startTime: formatTime(slot.activity ? 19 : 20), endTime: formatTime(22) };
    case "night":
      return { startTime: formatTime(22.5) };
  }
}

/**
 * Ajoute à chaque créneau : horaire indicatif, lieu associé et trajet estimé
 * depuis l'étape précédente (la journée commence à l'hébergement).
 */
export function annotateItinerary(days: ItineraryDay[], map: TripMap): ItineraryDay[] {
  const byId = new Map(map.locations.map((l) => [l.id, l]));
  const hotel = byId.get(HOTEL_LOCATION_ID);

  return days.map((day) => {
    const isArrival = day.dayNumber === 1;
    let previous = hotel?.point;
    const slots = day.slots.map((slot) => {
      const annotated: ItinerarySlot = { ...slot, ...slotTimes(slot, isArrival) };
      const locationId = slot.activity
        ? activityLocationId(slot.activity.id)
        : slot.restaurant
          ? restaurantLocationId(slot.restaurant.id)
          : isArrival && slot.period === "morning"
            ? HOTEL_LOCATION_ID
            : undefined;
      const location = locationId ? byId.get(locationId) : undefined;
      if (location) {
        annotated.locationId = location.id;
        if (previous && location.id !== HOTEL_LOCATION_ID) {
          annotated.legFromPrevious = estimateLeg(previous, location.point);
        }
        // Le soir, après l'activité, on dîne au restaurant : on repart de là.
        const dinner =
          slot.activity && slot.restaurant ? byId.get(restaurantLocationId(slot.restaurant.id)) : null;
        previous = (dinner ?? location).point;
      }
      return annotated;
    });
    return { ...day, slots };
  });
}
