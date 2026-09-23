import { routes } from "@/config/site";
import type { TripRequest } from "@/types/trip";
import { encodeTripRequest } from "./request-codec";

/** URL de la page de résultats pour une demande donnée. */
export const tripResultUrl = (request: TripRequest) => `${routes.tripResult}?v=${encodeTripRequest(request)}`;

/** URL du questionnaire pré-rempli avec une demande (« Modifier mon voyage »). */
export const editTripUrl = (request: TripRequest) =>
  `${routes.createTrip}?modifier=${encodeTripRequest(request)}`;
