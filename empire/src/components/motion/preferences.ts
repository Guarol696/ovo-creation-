/**
 * Préférences d'affichage propres à l'appareil (stockées localement) :
 * mouvement, curseur, taille du texte, contraste. Appliquées sur <html>
 * par un script inline avant le premier rendu (pas de flash).
 */
export type MotionPreference = "auto" | "reduced" | "full";
export type Toggle = "on" | "off";

export interface DisplayPreferences {
  motion: MotionPreference;
  cursor: Toggle;
  text: "normal" | "large";
  contrast: "normal" | "high";
}

export const PREFERENCES_KEY = "empire:display";

export const defaultPreferences: DisplayPreferences = {
  motion: "auto",
  cursor: "on",
  text: "normal",
  contrast: "normal",
};

export function readPreferences(): DisplayPreferences {
  try {
    const raw = window.localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return defaultPreferences;
    const parsed = JSON.parse(raw) as Partial<DisplayPreferences>;
    return {
      motion: parsed.motion === "reduced" || parsed.motion === "full" ? parsed.motion : "auto",
      cursor: parsed.cursor === "off" ? "off" : "on",
      text: parsed.text === "large" ? "large" : "normal",
      contrast: parsed.contrast === "high" ? "high" : "normal",
    };
  } catch {
    return defaultPreferences;
  }
}

export function writePreferences(preferences: DisplayPreferences) {
  try {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch {
    // Stockage indisponible (navigation privée) : la préférence vaut pour la session.
  }
}

export const systemPrefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function effectiveMotion(preference: MotionPreference): "reduced" | "full" {
  if (preference === "auto") return systemPrefersReducedMotion() ? "reduced" : "full";
  return preference;
}

export function applyPreferences(preferences: DisplayPreferences) {
  const root = document.documentElement;
  root.dataset.motion = effectiveMotion(preferences.motion);
  root.dataset.cursor = preferences.cursor;
  root.dataset.text = preferences.text;
  root.dataset.contrast = preferences.contrast;
}

/** Script inline (exécuté avant l'hydratation) : même logique, sans dépendance. */
export const preferencesBootScript = `(function(){var d=document.documentElement;d.classList.add('js');var p={};try{p=JSON.parse(localStorage.getItem('${PREFERENCES_KEY}')||'{}')}catch(e){}var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;var m=p.motion==='reduced'||p.motion==='full'?p.motion:(r?'reduced':'full');d.dataset.motion=m;d.dataset.cursor=p.cursor==='off'?'off':'on';d.dataset.text=p.text==='large'?'large':'normal';d.dataset.contrast=p.contrast==='high'?'high':'normal';})();`;
