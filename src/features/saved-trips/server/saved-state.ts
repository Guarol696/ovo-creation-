import "server-only";
import { unstable_rethrow } from "next/navigation";
import { getCurrentUser } from "@/features/auth/server/session";
import { createClient } from "@/lib/supabase/server";
import type { TripRequest } from "@/types/trip";
import { findSavedTripId, requestHash } from "./repository";

/** Identifiant du voyage enregistré correspondant à cette demande (utilisateur connecté), sinon null. */
export async function savedTripIdFor(request: TripRequest): Promise<string | null> {
  if (!(await getCurrentUser())) return null;
  try {
    return await findSavedTripId(await createClient(), requestHash(request));
  } catch (error) {
    unstable_rethrow(error);
    console.error("[saved-trips] lecture de l'état d'enregistrement", error);
    return null;
  }
}
