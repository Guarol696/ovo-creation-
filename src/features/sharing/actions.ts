"use server";

import { z } from "zod";
import { updateTripSharing } from "@/features/saved-trips/server/repository";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { sharedTripPath } from "./paths";

export type SharingResult =
  { status: "ok"; isPublic: boolean; sharePath: string | null } | { status: "error"; message: string };

/**
 * Rend un voyage enregistré partageable (ou privé). Réservé à son propriétaire :
 * session vérifiée ici, et la base (RLS) refuse toute modification du voyage d'un autre.
 */
export async function setTripSharing(tripId: string, enabled: boolean): Promise<SharingResult> {
  if (!isSupabaseConfigured() || !z.uuid().safeParse(tripId).success) {
    return { status: "error", message: "Ce voyage est introuvable." };
  }
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return { status: "error", message: "Ta session a expiré. Reconnecte-toi pour partager ce voyage." };

    const updated = await updateTripSharing(supabase, tripId, enabled);
    if (!updated) return { status: "error", message: "Ce voyage n'existe plus ou a été supprimé." };
    return {
      status: "ok",
      isPublic: updated.is_public,
      sharePath: updated.is_public && updated.share_token ? sharedTripPath(updated.share_token) : null,
    };
  } catch (error) {
    console.error("[partage] modification impossible", error);
    return {
      status: "error",
      message: enabled
        ? "Impossible d'activer le partage pour le moment. Réessaie dans un instant."
        : "Impossible de désactiver le partage pour le moment. Réessaie dans un instant.",
    };
  }
}
