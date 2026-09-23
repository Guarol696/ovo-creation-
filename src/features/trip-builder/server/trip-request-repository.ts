import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { TripRequest } from "@/types/trip";

/** Nom de la table (voir supabase/migrations). */
const TABLE = "trip_requests";

/** Enregistre une demande de voyage pour un utilisateur connecté. */
export async function insertTripRequest(supabase: SupabaseClient, userId: string, request: TripRequest) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ user_id: userId, payload: request })
    .select("id")
    .single<{ id: string }>();

  if (error) throw error;
  return data.id;
}
