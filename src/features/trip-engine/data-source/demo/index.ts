import { normalizeText } from "@/features/trip-builder/lib/destination-search";
import type { DestinationProfile, TravelDataSource } from "../types";
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
];

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
