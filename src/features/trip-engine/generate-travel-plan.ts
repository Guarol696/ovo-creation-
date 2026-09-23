import type { TravelPlan } from "@/types/travel-plan";
import type { TripRequest } from "@/types/trip";
import { buildEstimatedBudget, estimateBudget, selectTier } from "./budget";
import { demoDataSource } from "./data-source/demo";
import { buildGenericProfile } from "./data-source/generic";
import type { DestinationProfile, TravelDataSource } from "./data-source/types";
import { buildHighlights, buildReasons, buildSummary, buildWarnings } from "./explain";
import { buildItinerary } from "./itinerary";
import { buildAccommodation, buildTransport, chooseNeighborhood } from "./logistics";
import { analyzePreferences } from "./preferences";
import { rankDestinations } from "./scoring";

/**
 * Moteur de génération OVO.
 *
 *   réponses validées
 *     → analyse des préférences
 *     → sélection de la destination (choisie ou recommandée par score)
 *     → niveau de confort adapté au budget
 *     → programme jour par jour
 *     → budget détaillé, explications et moments forts
 *
 * Déterministe : les mêmes réponses donnent toujours le même voyage.
 * Les données viennent d'une `TravelDataSource` injectable (démo par défaut).
 */

export interface GenerateOptions {
  dataSource?: TravelDataSource;
}

export async function generateTravelPlan(
  request: TripRequest,
  { dataSource = demoDataSource }: GenerateOptions = {},
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

  // 2. Niveau de confort, quartier et programme
  const tier = selectTier(profile, prefs);
  const neighborhood = chooseNeighborhood(profile, prefs, tier);
  const itinerary = buildItinerary({ profile, prefs, tier, request, neighborhood });

  // 3. Budget détaillé à partir du programme réel
  const estimatedBudget = buildEstimatedBudget({
    profile,
    prefs,
    tier,
    activitiesPerPerson: itinerary.activitiesCostPerPerson,
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
    reasons: buildReasons(profile, prefs, estimatedBudget, recommended),
    warnings: buildWarnings(profile, prefs, estimatedBudget),
    highlights: buildHighlights(itinerary, profile),
    itinerary: itinerary.days,
    accommodation: buildAccommodation(profile, prefs, tier, neighborhood),
    transport: buildTransport(profile),
    activities: itinerary.activities,
    restaurants: itinerary.restaurants,
    estimatedBudget,
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
