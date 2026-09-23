"use client";

import { Globe, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTripPage } from "@/features/trip-results/components/save-trip-button";

const shortDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });

/** Lien arrivé à échéance (plus accessible, voir la politique RLS). */
export const isExpired = (expiresAt: string | null) =>
  expiresAt !== null && new Date(expiresAt).getTime() <= Date.now();

/** État de partage d'un voyage enregistré (mis à jour en direct). */
export function SharingBadge() {
  const { config, sharing } = useTripPage();
  if (config.mode !== "saved" || !sharing) return null;
  const expired = sharing.isPublic && isExpired(sharing.expiresAt);
  const label = !sharing.isPublic
    ? "Privé"
    : expired
      ? "Lien de partage expiré"
      : sharing.expiresAt
        ? `Partagé jusqu'au ${shortDate.format(new Date(sharing.expiresAt))}`
        : "Partagé par lien";
  return (
    <Badge tone="light" className="animate-fade-up">
      {sharing.isPublic && !expired ? (
        <Globe className="size-3.5 text-emerald-300" />
      ) : (
        <Lock className="size-3.5" />
      )}
      {label}
    </Badge>
  );
}
