import { routes } from "@/config/site";
import type { TripRequest } from "@/types/trip";
import { encodeTripRequest } from "./request-codec";

/** URL de la page de résultats pour une demande donnée. */
export const tripResultUrl = (request: TripRequest) => `${routes.tripResult}?v=${encodeTripRequest(request)}`;

/** URL du questionnaire pré-rempli avec une demande (« Modifier mon voyage »). */
export const editTripUrl = (request: TripRequest) =>
  `${routes.createTrip}?modifier=${encodeTripRequest(request)}`;

/** Questionnaire vierge (« Recommencer ») : ignore les réponses sauvegardées. */
export const newTripUrl = `${routes.createTrip}?nouveau=1`;
