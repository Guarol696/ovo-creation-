import "server-only";
import { createHash, randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { TripRequest } from "@/types/trip";
import type { SavedTripInsert, SavedTripRow } from "../mapping";

/**
 * Accès à la table `saved_trips` (voir supabase/migrations).
 * Toujours appelé avec le client Supabase de l'utilisateur connecté :
 * les règles RLS limitent chaque requête à SES voyages, même en cas d'erreur de code.
 */
const TABLE = "saved_trips";
const SUMMARY_COLUMNS =
  "id, title, destination, country, country_code, start_date, end_date, duration, travelers, budget, request, is_public, share_token, shared_at, created_at, updated_at";

/** Empreinte stable d'une demande validée : un même voyage n'est enregistré qu'une fois. */
export function requestHash(request: TripRequest) {
  return createHash("sha256").update(JSON.stringify(request)).digest("hex");
}

export async function listSavedTrips(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from(TABLE)
    .select(SUMMARY_COLUMNS)
    .order("created_at", { ascending: false })
    .returns<Omit<SavedTripRow, "travel_plan">[]>();
  if (error) throw error;
  return data.map((row) => ({ ...row, travel_plan: null }) satisfies SavedTripRow);
}

export async function countSavedTrips(supabase: SupabaseClient) {
  const { count, error } = await supabase.from(TABLE).select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

export async function getSavedTrip(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`${SUMMARY_COLUMNS}, travel_plan`)
    .eq("id", id)
    .maybeSingle<SavedTripRow>();
  if (error) throw error;
  return data;
}

export async function findSavedTripId(supabase: SupabaseClient, hash: string) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id")
    .eq("request_hash", hash)
    .maybeSingle<{ id: string }>();
  if (error) throw error;
  return data?.id ?? null;
}

/** Enregistre le voyage ; s'il l'était déjà, renvoie l'existant. */
export async function insertSavedTrip(supabase: SupabaseClient, userId: string, row: SavedTripInsert) {
  const { data, error } = await supabase
    .from(TABLE)
    .upsert({ ...row, user_id: userId }, { onConflict: "user_id,request_hash", ignoreDuplicates: true })
    .select("id")
    .returns<{ id: string }[]>();
  if (error) throw error;
  if (data[0]) return { id: data[0].id, alreadySaved: false };
  const existing = await findSavedTripId(supabase, row.request_hash);
  if (!existing) throw new Error("Voyage enregistré introuvable après insertion");
  return { id: existing, alreadySaved: true };
}

/**
 * Active ou désactive le partage par lien. Activer crée un jeton secret
 * aléatoire ; désactiver l'efface (l'ancien lien ne fonctionne plus).
 * Renvoie `null` si le voyage n'existe pas (ou n'appartient pas à l'utilisateur).
 */
export async function updateTripSharing(supabase: SupabaseClient, id: string, enabled: boolean) {
  const current = await supabase
    .from(TABLE)
    .select("share_token")
    .eq("id", id)
    .maybeSingle<{ share_token: string | null }>();
  if (current.error) throw current.error;
  if (!current.data) return null;

  const changes = enabled
    ? {
        is_public: true,
        share_token: current.data.share_token ?? randomUUID(),
        shared_at: new Date().toISOString(),
      }
    : { is_public: false, share_token: null, shared_at: null };
  const { data, error } = await supabase
    .from(TABLE)
    .update(changes)
    .eq("id", id)
    .select("is_public, share_token")
    .maybeSingle<{ is_public: boolean; share_token: string | null }>();
  if (error) throw error;
  return data;
}

/** Supprime un voyage ; `false` s'il n'existe pas (ou n'appartient pas à l'utilisateur). */
export async function deleteSavedTrip(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.from(TABLE).delete().eq("id", id).select("id");
  if (error) throw error;
  return data.length > 0;
}
