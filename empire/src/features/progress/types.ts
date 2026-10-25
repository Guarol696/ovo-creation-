export interface CourseProgress {
  completed: string[];
  lastLesson?: string;
  /** Position de reprise par leçon, en secondes. */
  positions: Record<string, number>;
  notes: Record<string, string>;
  updatedAt?: string;
}

export const emptyProgress = (): CourseProgress => ({ completed: [], positions: {}, notes: {} });

/** « remote » : compte connecté (Supabase). « local » : mode démo, stockage du navigateur. */
export type ProgressMode = "remote" | "local";

export const progressRatio = (progress: CourseProgress | undefined, totalLessons: number) =>
  totalLessons ? Math.min(1, (progress?.completed.length ?? 0) / totalLessons) : 0;
