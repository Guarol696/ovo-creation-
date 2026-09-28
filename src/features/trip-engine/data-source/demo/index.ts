import { normalizeText } from "@/features/trip-builder/lib/destination-search";
import type { DestinationProfile, TravelDataSource } from "../types";
import { DEMO_GEO } from "./geo";
import { agadir } from "./destinations/agadir";
import { amsterdam } from "./destinations/amsterdam";
import { athenes } from "./destinations/athenes";
import { bali } from "./destinations/bali";
import { bangkok } from "./destinations/bangkok";
import { barcelone } from "./destinations/barcelone";
import { berlin } from "./destinations/berlin";
import { bordeaux } from "./destinations/bordeaux";
import { bruxelles } from "./destinations/bruxelles";
import { budapest } from "./destinations/budapest";
import { copenhague } from "./destinations/copenhague";
import { cracovie } from "./destinations/cracovie";
import { dubai } from "./destinations/dubai";
import { dublin } from "./destinations/dublin";
import { edimbourg } from "./destinations/edimbourg";
import { florence } from "./destinations/florence";
import { hanoi } from "./destinations/hanoi";
import { ibiza } from "./destinations/ibiza";
import { istanbul } from "./destinations/istanbul";
import { le_caire } from "./destinations/le-caire";
import { lisbonne } from "./destinations/lisbonne";
import { londres } from "./destinations/londres";
import { madrid } from "./destinations/madrid";
import { malte } from "./destinations/malte";
import { marrakech } from "./destinations/marrakech";
import { marseille } from "./destinations/marseille";
import { mexico } from "./destinations/mexico";
import { milan } from "./destinations/milan";
import { montreal } from "./destinations/montreal";
import { naples } from "./destinations/naples";
import { new_york } from "./destinations/new-york";
import { nice } from "./destinations/nice";
import { porto } from "./destinations/porto";
import { prague } from "./destinations/prague";
import { reykjavik } from "./destinations/reykjavik";
import { rio } from "./destinations/rio";
import { rome } from "./destinations/rome";
import { santorin } from "./destinations/santorin";
import { seoul } from "./destinations/seoul";
import { seville } from "./destinations/seville";
import { split } from "./destinations/split";
import { tokyo } from "./destinations/tokyo";
import { valence } from "./destinations/valence";
import { venise } from "./destinations/venise";
import { vienne } from "./destinations/vienne";
import { realRestaurantPoints, realRestaurants } from "./restaurants";

/**
 * Catalogue OVO rédigé à la main : vrais lieux et restaurants, prix moyens
 * indicatifs. Pourra être remplacé par une vraie source (Supabase, API…).
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
  agadir,
  bali,
  bangkok,
  berlin,
  bordeaux,
  bruxelles,
  copenhague,
  cracovie,
  dubai,
  dublin,
  edimbourg,
  florence,
  hanoi,
  ibiza,
  istanbul,
  le_caire,
  madrid,
  malte,
  marseille,
  mexico,
  milan,
  montreal,
  naples,
  new_york,
  nice,
  porto,
  reykjavik,
  rio,
  santorin,
  seoul,
  seville,
  tokyo,
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
