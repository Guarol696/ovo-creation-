"use server";

import { z } from "zod";
import { tripRequestSchema } from "@/features/trip-builder/schema";
import { generateTravelPlan } from "@/features/trip-engine";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { decodeTripRequestParam } from "@/lib/trip/request-codec";
import { getEntitlements } from "@/features/premium/server/entitlements";
import { planToRow } from "./mapping";
import {
  countSavedTrips,
  deleteSavedTrip,
  findSavedTripId,
  insertSavedTrip,
  requestHash,
} from "./server/repository";

export type SaveTripResult =
  | { status: "saved"; id: string; alreadySaved: boolean }
  | { status: "unauthenticated" }
  | { status: "error"; message: string };

export type DeleteTripResult = { status: "deleted" } | { status: "error"; message: string };

const SAVE_FAILED = "Impossible d'enregistrer ton voyage pour le moment. Réessaie dans un instant.";
const DELETE_FAILED = "Impossible de supprimer ce voyage pour le moment. Réessaie dans un instant.";

/**
 * Enregistre le voyage affiché. Le client n'envoie que la demande encodée
 * (celle de l'URL) : le serveur la valide et recalcule lui-même le TravelPlan,
 * sans jamais faire confiance à un plan fourni par le navigateur.
 */
export async function saveTrip(encodedRequest: string): Promise<SaveTripResult> {
  if (!isSupabaseConfigured()) return { status: "error", message: "Les comptes ne sont pas encore activés." };
  const parsed = tripRequestSchema.safeParse(decodeTripRequestParam(encodedRequest));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Ce voyage n'est plus valide (dates passées ?). Modifie-le puis réessaie.",
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { status: "unauthenticated" };

    const hash = requestHash(parsed.data);
    const existing = await findSavedTripId(supabase, hash);
    if (existing) return { status: "saved", id: existing, alreadySaved: true };

    // Limite du plan (config/premium.ts), décidée côté serveur.
    const { isPremium, limits } = await getEntitlements();
    if (limits.savedTrips !== null && (await countSavedTrips(supabase)) >= limits.savedTrips) {
      return {
        status: "error",
        message: isPremium
          ? `Tu as atteint la limite de ${limits.savedTrips} voyages enregistrés. Supprimes-en un pour en ajouter un nouveau.`
          : `Tu as atteint la limite de ${limits.savedTrips} voyages enregistrés avec OVO Gratuit. Supprimes-en un, ou découvre OVO Premium pour en garder davantage.`,
      };
    }

    const plan = await generateTravelPlan(parsed.data);
    const saved = await insertSavedTrip(supabase, user.id, planToRow(plan, hash));
    return { status: "saved", ...saved };
  } catch (error) {
    console.error("[saved-trips] enregistrement impossible", error);
    return { status: "error", message: SAVE_FAILED };
  }
}

export async function deleteTrip(id: string): Promise<DeleteTripResult> {
  if (!isSupabaseConfigured() || !z.uuid().safeParse(id).success) {
    return { status: "error", message: "Ce voyage est introuvable." };
  }
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return { status: "error", message: "Ta session a expiré. Reconnecte-toi pour supprimer ce voyage." };

    const deleted = await deleteSavedTrip(supabase, id);
    if (!deleted) return { status: "error", message: "Ce voyage n'existe plus ou a déjà été supprimé." };
    return { status: "deleted" };
  } catch (error) {
    console.error("[saved-trips] suppression impossible", error);
    return { status: "error", message: DELETE_FAILED };
  }
}
