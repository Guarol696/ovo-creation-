import { emptyProgress, type CourseProgress } from "./types";

/**
 * Mode démonstration : progression, notes et projets dans le stockage du
 * navigateur (aucun serveur). Signalé comme tel dans l'interface.
 */
const KEY = "empire:progress";

export function readAllLocal(): Record<string, CourseProgress> {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, CourseProgress>) : {};
  } catch {
    return {};
  }
}

export function readLocal(course: string): CourseProgress {
  return { ...emptyProgress(), ...readAllLocal()[course] };
}

export function writeLocal(course: string, progress: CourseProgress) {
  try {
    const all = readAllLocal();
    all[course] = { ...progress, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Stockage plein ou indisponible : la progression vaut pour la session.
  }
}
