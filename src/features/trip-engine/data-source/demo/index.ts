import { normalizeText } from "@/features/trip-builder/lib/destination-search";
import type { DestinationProfile, TravelDataSource } from "../types";
import { DEMO_GEO } from "./geo";
import { amsterdam } from "./destinations/amsterdam";
import { athenes } from "./destinations/athenes";
import { barcelone } from "./destinations/barcelone";
import { berlin } from "./destinations/berlin";
import { bordeaux } from "./destinations/bordeaux";
import { budapest } from "./destinations/budapest";
import { copenhague } from "./destinations/copenhague";
import { dublin } from "./destinations/dublin";
import { edimbourg } from "./destinations/edimbourg";
import { florence } from "./destinations/florence";
import { ibiza } from "./destinations/ibiza";
import { lisbonne } from "./destinations/lisbonne";
import { londres } from "./destinations/londres";
import { madrid } from "./destinations/madrid";
import { marrakech } from "./destinations/marrakech";
import { marseille } from "./destinations/marseille";
import { naples } from "./destinations/naples";
import { nice } from "./destinations/nice";
import { porto } from "./destinations/porto";
import { prague } from "./destinations/prague";
import { rome } from "./destinations/rome";
import { seville } from "./destinations/seville";
import { split } from "./destinations/split";
import { valence } from "./destinations/valence";
import { venise } from "./destinations/venise";
import { vienne } from "./destinations/vienne";
import { realRestaurantPoints, realRestaurants } from "./restaurants";

/**
 * Catalogue de DÉMONSTRATION : prix et contenus indicatifs, rédigés à la main
 * pour tester le moteur. À remplacer par une vraie source (Supabase, API…).
 */
export const demoDestinations: DestinationProfile[] = [
  lisbonne,
  barcelone,
  rome,
  amsterdam,
  marrakech,
  londres,
  prague,
  budapest,
  athenes,
  split,
  berlin,
  bordeaux,
  copenhague,
  dublin,
  edimbourg,
  florence,
  ibiza,
  madrid,
  marseille,
  naples,
  nice,
  porto,
  seville,
  valence,
  venise,
  vienne,
].map((profile) => {
  const real = realRestaurants(profile.id);
  const geo = profile.geo ?? DEMO_GEO[profile.id];
  return {
    ...profile,
    restaurants: real.length > 0 ? real : profile.restaurants,
    geo: geo && { ...geo, places: { ...geo.places, ...realRestaurantPoints(profile.id) } },
  };
});

export const demoDataSource: TravelDataSource = {
  id: "ovo-demo",
  async listDestinations() {
    return demoDestinations;
  },
  async findDestination(place) {
    const byId = demoDestinations.find((d) => d.id === place.id);
    if (byId) return byId;
    const name = normalizeText(place.name);
    return demoDestinations.find((d) => normalizeText(d.name) === name) ?? null;
  },
};
