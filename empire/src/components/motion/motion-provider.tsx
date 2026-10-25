"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  applyPreferences,
  defaultPreferences,
  readPreferences,
  writePreferences,
  type DisplayPreferences,
} from "./preferences";

interface MotionContextValue {
  preferences: DisplayPreferences;
  /** Mouvement effectif (préférence utilisateur + réglage système). */
  reduced: boolean;
  update: (patch: Partial<DisplayPreferences>) => void;
}

const MotionContext = createContext<MotionContextValue>({
  preferences: defaultPreferences,
  reduced: false,
  update: () => {},
});

export function MotionProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<DisplayPreferences>(defaultPreferences);
  const [systemTick, setSystemTick] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    // Lecture après montage : l'état serveur (défauts) et le client restent cohérents à l'hydratation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreferences(readPreferences());
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setSystemTick((tick) => tick + 1);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    applyPreferences(preferences);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(document.documentElement.dataset.motion === "reduced");
  }, [preferences, systemTick]);

  const update = useCallback((patch: Partial<DisplayPreferences>) => {
    setPreferences((current) => {
      const next = { ...current, ...patch };
      writePreferences(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ preferences, reduced, update }), [preferences, reduced, update]);

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export const useMotion = () => useContext(MotionContext);

/** Lecture synchrone de l'état appliqué sur <html> (hors React, ex. gestionnaires d'événements). */
export const isMotionReduced = () =>
  typeof document !== "undefined" && document.documentElement.dataset.motion === "reduced";
