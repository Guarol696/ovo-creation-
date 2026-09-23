import type { TravelPlan } from "@/types/travel-plan";
import type { TripRequest } from "@/types/trip";
import { buildTravelBudget, estimateBudget, selectTier } from "./budget";
import { demoDataSource } from "./data-source/demo";
import { buildGenericProfile } from "./data-source/generic";
import type { DestinationProfile, TravelDataSource } from "./data-source/types";
import { buildHighlights, buildReasons, buildSummary, buildWarnings } from "./explain";
import { buildItinerary } from "./itinerary";
import { annotateItinerary, buildTripMap } from "./locations";
import { chooseNeighborhood } from "./logistics";
import { analyzePreferences } from "./preferences";
import { rankDestinations } from "./scoring";
import { demoAccommodationProvider, type AccommodationProvider } from "./services/accommodation";
import { demoActivityProvider, type ActivityProvider } from "./services/activities";
import { demoRestaurantProvider, type RestaurantProvider } from "./services/restaurants";
import { demoTransportProvider, type TransportProvider } from "./services/transport";

/**
 * Moteur de génération OVO.
 *
 *   réponses validées
 *     → analyse des préférences
 *     → sélection de la destination (choisie ou recommandée par score)
 *     → niveau de confort adapté au budget
 *     → transport, hébergement, activités et restaurants (un service chacun)
 *     → programme jour par jour, construit à partir de ces activités et restaurants
 *     → lieux de la carte, horaires et trajets estimés entre étapes
 *     → budget détaillé, explications et moments forts
 *
 * Déterministe : les mêmes réponses donnent toujours le même voyage.
 * Chaque source est injectable (démo par défaut) : destinations, transport,
 * hébergement, activités et restaurants pourront être branchés sur de vraies
 * API indépendamment.
 */

export interface GenerateOptions {
  dataSource?: TravelDataSource;
  transportProvider?: TransportProvider;
  accommodationProvider?: AccommodationProvider;
  activityProvider?: ActivityProvider;
  restaurantProvider?: RestaurantProvider;
}

export async function generateTravelPlan(
  request: TripRequest,
  {
    dataSource = demoDataSource,
    transportProvider = demoTransportProvider,
    accommodationProvider = demoAccommodationProvider,
    activityProvider = demoActivityProvider,
    restaurantProvider = demoRestaurantProvider,
  }: GenerateOptions = {},
): Promise<TravelPlan> {
  const prefs = analyzePreferences(request);
  const candidates = await dataSource.listDestinations();

  // 1. Destination
  let profile: DestinationProfile;
  let recommended = false;
  let alternatives: DestinationProfile[] = [];
  if (request.destination.mode === "known") {
    const place = request.destination.place;
    profile = (await dataSource.findDestination(place)) ?? buildGenericProfile(place);
  } else {
    const ranking = rankDestinations(candidates, prefs);
    profile = ranking[0]!.profile;
    recommended = true;
    alternatives = ranking
      .slice(1, 4)
      .filter((s) => !s.excluded)
      .map((s) => s.profile);
  }

  // 2. Niveau de confort, transport et hébergement
  const tier = selectTier(profile, prefs);
  const neighborhood = chooseNeighborhood(profile, prefs, tier);
  const [transport, accommodation, activityCandidates, restaurantCandidates] = await Promise.all([
    transportProvider.getTransport({ profile, prefs }),
    accommodationProvider.getAccommodation({ profile, prefs, tier, neighborhood }),
    activityProvider.getActivities({ profile, prefs, tier }),
    restaurantProvider.getRestaurants({ profile, prefs, tier }),
  ]);

  // 3. Programme jour par jour
  const itinerary = buildItinerary({
    profile,
    prefs,
    tier,
    request,
    neighborhood,
    transport: transport.main,
    activities: activityCandidates,
    restaurants: restaurantCandidates,
  });

  // 4. Lieux de la carte, horaires indicatifs et trajets entre étapes
  const map = buildTripMap({ profile, itinerary, accommodation });
  const days = annotateItinerary(itinerary.days, map);

  // 5. Budget : reprend exactement les options retenues
  const estimatedBudget = buildTravelBudget({
    profile,
    prefs,
    tier,
    transport,
    accommodation,
    itinerary,
  });

  // Destination choisie mais hors budget : suggérer des options plus abordables.
  if (!recommended && estimatedBudget.status === "over") {
    // Comparaison sur la même base d'estimation que le classement.
    const reference = estimateBudget({ profile, prefs, tier }).total;
    const ranking = rankDestinations(candidates, prefs).filter(
      (s) => s.profile.id !== profile.id && s.estimatedTotal < reference,
    );
    // Dans le budget si possible ; sinon, simplement moins chères que le choix actuel.
    const affordable = ranking.filter((s) => !s.excluded);
    const pool =
      affordable.length > 0 ? affordable : ranking.sort((a, b) => a.estimatedTotal - b.estimatedTotal);
    alternatives = pool.slice(0, 3).map((s) => s.profile);
  }

  return {
    id: planId(request),
    version: 1,
    request,
    destination: {
      id: profile.id,
      name: profile.name,
      country: profile.country,
      countryCode: profile.countryCode,
      tagline: profile.tagline,
      description: profile.description,
      image: profile.image,
      fallbackGradient: profile.fallbackGradient,
      recommended,
      isGeneric: profile.source === "generic",
    },
    dates: {
      mode: request.dates.mode,
      departureDate: request.dates.mode === "fixed" ? request.dates.departureDate : null,
      returnDate: request.dates.mode === "fixed" ? request.dates.returnDate : null,
      preferredMonth: request.dates.mode === "flexible" ? request.dates.preferredMonth : null,
    },
    duration: { days: prefs.days, nights: prefs.nights },
    travelers: { adults: prefs.adults, children: prefs.children, total: prefs.travelers },
    travelStyle: request.styles,
    atmosphere: request.ambiances,
    summary: buildSummary(profile, prefs),
    reasons: buildReasons(profile, prefs, estimatedBudget, recommended, transport.main),
    warnings: buildWarnings(profile, prefs, estimatedBudget),
    highlights: buildHighlights(itinerary),
    itinerary: days,
    accommodation,
    transport,
    activities: itinerary.activities,
    restaurants: itinerary.restaurants,
    estimatedBudget,
    map,
    alternatives: alternatives.map((a) => ({ id: a.id, name: a.name, country: a.country })),
  };
}

/** Empreinte courte et stable de la demande (djb2). */
function planId(request: TripRequest) {
  const text = JSON.stringify(request);
  let hash = 5381;
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0;
  return `plan_${(hash >>> 0).toString(36)}`;
}
