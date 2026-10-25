import { canAccess, type PlanId } from "@/config/plans";
import { courseLessons } from "@/data/courses";
import type { Course } from "@/types/academy";

/**
 * Règle d'accès à une leçon (fonction pure, testée) :
 *  - formation gratuite : toujours ;
 *  - première leçon de chaque formation : aperçu libre ;
 *  - sinon : l'offre de l'utilisateur doit couvrir celle de la formation.
 * Évaluée côté serveur à partir de l'offre lue en base (jamais du navigateur).
 */
export function canViewLesson(course: Course, lessonSlug: string, plan: PlanId) {
  if (course.access === "free") return true;
  if (courseLessons(course)[0]?.slug === lessonSlug) return true;
  return canAccess(plan, course.access);
}

export const isPreviewLesson = (course: Course, lessonSlug: string) =>
  course.access !== "free" && courseLessons(course)[0]?.slug === lessonSlug;
