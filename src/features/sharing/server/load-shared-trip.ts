import "server-only";
import { unstable_rethrow } from "next/navigation";
import { cache } from "react";
import { z } from "zod";
import { isUsablePlan, withoutPrivateNotes } from "@/features/saved-trips/mapping";
import { isSupabaseConfigured } from "@/lib/env";
import { createAnonClient } from "@/lib/supabase/anon";
import type { TravelPlan } from "@/types/travel-plan";

/** En-tête lu par la politique RLS « Lecture d'un voyage partagé avec son lien ». */
export const SHARE_TOKEN_HEADER = "x-ovo-share-token";

/** Colonnes publiques uniquement (voir la migration 20260924090000). */
const PUBLIC_COLUMNS = "share_token, title, travel_plan, shared_at";

export interface SharedTrip {
  token: string;
  title: string;
  plan: TravelPlan;
}

/**
 * Voyage partagé par lien, lu en tant que visiteur anonyme : la base ne renvoie
 * la ligne que si le partage est actif et que le jeton est le bon (RLS).
 * Aucune information du compte (identifiant, email, prénom…) n'est lue.
 */
export const loadSharedTrip = cache(async (token: string): Promise<SharedTrip | null> => {
  if (!isSupabaseConfigured() || !z.uuid().safeParse(token).success) return null;
  try {
    const { data, error } = await createAnonClient({ [SHARE_TOKEN_HEADER]: token })
      .from("saved_trips")
      .select(PUBLIC_COLUMNS)
      .eq("share_token", token)
      .maybeSingle<{ share_token: string; title: string; travel_plan: unknown }>();
    if (error) throw error;
    if (!data || !isUsablePlan(data.travel_plan)) return null;
    return { token: data.share_token, title: data.title, plan: withoutPrivateNotes(data.travel_plan) };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[partage] lecture du voyage partagé impossible", error);
    throw error;
  }
});
