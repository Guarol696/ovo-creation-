"use server";

import type { TripRequest } from "@/types/trip";
import { tripRequestSchema } from "./schema";

export type PrepareTripResult = { ok: true; request: TripRequest } | { ok: false; error: string };

/**
 * Valide la demande de voyage côté serveur et la prépare pour la génération.
 * Aucun compte n'est requis. L'enregistrement est désormais un choix explicite
 * (« Enregistrer mon voyage » sur la page de résultat, voir features/saved-trips).
 */
export async function prepareTripRequest(input: unknown): Promise<PrepareTripResult> {
  const parsed = tripRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Certaines réponses sont invalides. Vérifie ton récapitulatif." };
  }
  return { ok: true, request: parsed.data };
}
