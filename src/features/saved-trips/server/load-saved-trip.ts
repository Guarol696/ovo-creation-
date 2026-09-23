import "server-only";
import { cache } from "react";
import { z } from "zod";
import { tripRequestBaseSchema } from "@/features/trip-builder/schema";
import { generateTravelPlan } from "@/features/trip-engine";
import { createClient } from "@/lib/supabase/server";
import type { TravelPlan } from "@/types/travel-plan";
import { isUsablePlan, type SavedTripRow } from "../mapping";
import { getSavedTrip } from "./repository";

export interface SavedTripView {
  trip: SavedTripRow;
  plan: TravelPlan;
  /** true si le plan enregistré était incomplet et a dû être recalculé. */
  regenerated: boolean;
}

/**
 * Voyage enregistré de l'utilisateur connecté (RLS : `null` s'il appartient à quelqu'un d'autre).
 * Le TravelPlan enregistré est réaffiché tel quel ; il n'est recalculé depuis la
 * demande que s'il manque ou n'a plus le format attendu (ancienne version).
 */
export const loadSavedTrip = cache(async (id: string): Promise<SavedTripView | null> => {
  if (!z.uuid().safeParse(id).success) return null;
  const supabase = await createClient();
  const trip = await getSavedTrip(supabase, id);
  if (!trip) return null;

  if (isUsablePlan(trip.travel_plan)) return { trip, plan: trip.travel_plan, regenerated: false };
  const request = tripRequestBaseSchema.safeParse(trip.request);
  if (!request.success) return null;
  return { trip, plan: await generateTravelPlan(request.data), regenerated: true };
});
