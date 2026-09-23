"use client";

import { Globe, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTripPage } from "@/features/trip-results/components/save-trip-button";

/** État de partage d'un voyage enregistré (mis à jour en direct). */
export function SharingBadge() {
  const { config, sharing } = useTripPage();
  if (config.mode !== "saved" || !sharing) return null;
  return (
    <Badge tone="light" className="animate-fade-up">
      {sharing.isPublic ? <Globe className="size-3.5 text-emerald-300" /> : <Lock className="size-3.5" />}
      {sharing.isPublic ? "Partagé par lien" : "Privé"}
    </Badge>
  );
}
