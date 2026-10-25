"use client";

import { useEffect, useState } from "react";
import { readAllLocal } from "@/features/progress/local-store";
import type { CourseProgress } from "@/features/progress/types";
import { DashboardView } from "./dashboard-view";

/** Mode démonstration (aucun backend) : tableau de bord alimenté par le stockage du navigateur. */
export function LocalDashboard() {
  const [progress, setProgress] = useState<Record<string, CourseProgress> | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(readAllLocal());
  }, []);
  if (!progress) return <div className="min-h-dvh" aria-busy="true" />;
  return <DashboardView name="visiteur" mode="local" progress={progress} planLabel="Free (démo)" />;
}
