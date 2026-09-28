import { normalizeText } from "@/features/trip-builder/lib/destination-search";
import type { DestinationProfile, TravelDataSource } from "../types";
import { DEMO_GEO } from "./geo";
import { amsterdam } from "./destinations/amsterdam";
import { athenes } from "./destinations/athenes";
import { barcelone } from "./destinations/barcelone";
import { budapest } from "./destinations/budapest";
import { lisbonne } from "./destinations/lisbonne";
import { londres } from "./destinations/londres";
import { marrakech } from "./destinations/marrakech";
import { prague } from "./destinations/prague";
import { rome } from "./destinations/rome";
import { split } from "./destinations/split";
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
].map((profile) => {
  const real = realRestaurants(profile.id);
  const geo = DEMO_GEO[profile.id];
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
