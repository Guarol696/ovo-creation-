import "server-only";
import { cache } from "react";
import { tripRequestBaseSchema, tripRequestSchema } from "@/features/trip-builder/schema";
import { generateTravelPlan } from "@/features/trip-engine";
import { decodeTripRequestParam } from "@/lib/trip/request-codec";
import type { TravelPlan } from "@/types/travel-plan";
import type { TripRequest } from "@/types/trip";

export type LoadPlanResult =
  | { status: "ok"; plan: TravelPlan }
  /** Structure valide mais réponses à revoir (ex. dates passées). */
  | { status: "outdated"; request: TripRequest }
  | { status: "invalid" };

/**
 * Décode la demande transmise dans l'URL, la valide (jamais de confiance
 * au client) puis lance le moteur. Mis en cache pour la durée de la requête
 * (métadonnées + page).
 */
export const loadTravelPlan = cache(async (encoded: string | undefined): Promise<LoadPlanResult> => {
  if (!encoded) return { status: "invalid" };
  const raw = decodeTripRequestParam(encoded);

  const strict = tripRequestSchema.safeParse(raw);
  if (strict.success) return { status: "ok", plan: await generateTravelPlan(strict.data) };

  const base = tripRequestBaseSchema.safeParse(raw);
  return base.success ? { status: "outdated", request: base.data } : { status: "invalid" };
});
