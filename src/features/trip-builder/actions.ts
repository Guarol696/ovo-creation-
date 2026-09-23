"use server";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { TripRequest } from "@/types/trip";
import { tripRequestSchema } from "./schema";
import { insertTripRequest } from "./server/trip-request-repository";

export type PrepareTripResult =
  { ok: true; request: TripRequest; savedId: string | null } | { ok: false; error: string };

/**
 * Valide la demande de voyage côté serveur et la prépare pour la génération.
 * Aucun compte n'est requis : la sauvegarde n'a lieu que si Supabase est
 * configuré ET que l'utilisateur est connecté.
 */
export async function prepareTripRequest(input: unknown): Promise<PrepareTripResult> {
  const parsed = tripRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Certaines réponses sont invalides. Vérifie ton récapitulatif." };
  }

  const request = parsed.data;
  let savedId: string | null = null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) savedId = await insertTripRequest(supabase, user.id, request);
    } catch (error) {
      // La sauvegarde est un bonus : elle ne doit jamais bloquer l'utilisateur.
      console.error("[prepareTripRequest] sauvegarde Supabase impossible", error);
    }
  }

  // Étape suivante : lancer le moteur de génération à partir de `request`.
  return { ok: true, request, savedId };
}
