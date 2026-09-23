"use server";

import { z } from "zod";
import { PLANS } from "@/config/premium";
import { canUseFeature } from "@/features/premium/server/entitlements";
import { updateTripSharing } from "@/features/saved-trips/server/repository";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { SHARE_DURATIONS, type ShareDuration } from "./durations";
import { sharedTripPath } from "./paths";

export type SharingResult =
  | { status: "ok"; isPublic: boolean; sharePath: string | null; expiresAt: string | null }
  | { status: "error"; message: string };

/**
 * Rend un voyage enregistré partageable (ou privé). Réservé à son propriétaire :
 * session vérifiée ici, et la base (RLS) refuse toute modification du voyage d'un autre.
 * Durée limitée (7 ou 30 jours) : fonctionnalité OVO Premium, vérifiée côté serveur.
 */
export async function setTripSharing(
  tripId: string,
  enabled: boolean,
  duration: ShareDuration = "unlimited",
): Promise<SharingResult> {
  if (!isSupabaseConfigured() || !z.uuid().safeParse(tripId).success) {
    return { status: "error", message: "Ce voyage est introuvable." };
  }
  if (!(duration in SHARE_DURATIONS)) return { status: "error", message: "Durée de partage inconnue." };
  const days = SHARE_DURATIONS[duration].days;
  if (enabled && days !== null && !(await canUseFeature("share_expiring_links"))) {
    return {
      status: "error",
      message: `Les liens à durée limitée sont réservés à ${PLANS.premium.name}.`,
    };
  }
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return { status: "error", message: "Ta session a expiré. Reconnecte-toi pour partager ce voyage." };

    const expiresAt =
      enabled && days !== null ? new Date(Date.now() + days * 86_400_000).toISOString() : null;
    const updated = await updateTripSharing(supabase, tripId, enabled, expiresAt);
    if (!updated) return { status: "error", message: "Ce voyage n'existe plus ou a été supprimé." };
    return {
      status: "ok",
      isPublic: updated.is_public,
      sharePath: updated.is_public && updated.share_token ? sharedTripPath(updated.share_token) : null,
      expiresAt: updated.share_expires_at,
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
