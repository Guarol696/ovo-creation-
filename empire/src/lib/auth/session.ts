import "server-only";
import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import type { PlanId } from "@/config/plans";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/** Utilisateur authentifié (vérifié auprès de Supabase Auth), ou null. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("[auth] lecture de la session impossible", error);
    return null;
  }
});

const ACTIVE = new Set(["active", "trialing"]);

/**
 * Offre effective d'un utilisateur, lue dans `subscriptions` (écrite
 * uniquement par le webhook Stripe signé). Toute erreur = offre gratuite.
 */
export const getUserPlan = cache(async (userId: string | undefined): Promise<PlanId> => {
  if (!userId || !isSupabaseConfigured()) return "free";
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    if (!data || !ACTIVE.has(data.status)) return "free";
    return data.plan === "premium" || data.plan === "pro" ? data.plan : "free";
  } catch (error) {
    console.error("[billing] lecture de l'offre impossible", error);
    return "free";
  }
});

export const displayName = (user: User) =>
  (typeof user.user_metadata?.display_name === "string" && user.user_metadata.display_name) ||
  user.email?.split("@")[0] ||
  "Membre";
