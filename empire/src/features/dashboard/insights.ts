import { courseLessons, courses } from "@/data/courses";
import type { Course } from "@/types/academy";
import type { CourseProgress } from "@/features/progress/types";

export interface CourseStatus {
  course: Course;
  progress: CourseProgress;
  done: number;
  total: number;
  ratio: number;
  /** Leçon à reprendre : la dernière ouverte, sinon la première non terminée. */
  resume: string;
}

/** Calculs du tableau de bord (fonctions pures, testées). */
export function summarize(progressByCourse: Record<string, CourseProgress>) {
  const statuses: CourseStatus[] = [];
  for (const course of courses) {
    const progress = progressByCourse[course.slug];
    if (!progress || (!progress.lastLesson && progress.completed.length === 0)) continue;
    const lessons = courseLessons(course);
    const done = lessons.filter((lesson) => progress.completed.includes(lesson.slug)).length;
    const firstOpen = lessons.find((lesson) => !progress.completed.includes(lesson.slug))?.slug;
    statuses.push({
      course,
      progress,
      done,
      total: lessons.length,
      ratio: lessons.length ? done / lessons.length : 0,
      resume: progress.lastLesson && !progress.completed.includes(progress.lastLesson) ? progress.lastLesson : (firstOpen ?? lessons[0].slug),
    });
  }
  const byRecent = (a: CourseStatus, b: CourseStatus) => (b.progress.updatedAt ?? "").localeCompare(a.progress.updatedAt ?? "");
  const inProgress = statuses.filter((status) => status.ratio < 1).sort(byRecent);
  const completed = statuses.filter((status) => status.ratio === 1).sort(byRecent);
  const lessonsDone = statuses.reduce((total, status) => total + status.done, 0);
  return { inProgress, completed, lessonsDone, last: inProgress[0] ?? null };
}

/** Recommandations : mêmes domaines que les formations commencées, puis formations gratuites. */
export function recommend(progressByCourse: Record<string, CourseProgress>, limit = 3): Course[] {
  const started = new Set(Object.keys(progressByCourse));
  const categories = new Set(courses.filter((course) => started.has(course.slug)).map((course) => course.category));
  const candidates = courses.filter((course) => !started.has(course.slug));
  const ranked = [
    ...candidates.filter((course) => categories.has(course.category)),
    ...candidates.filter((course) => !categories.has(course.category) && course.access === "free"),
    ...candidates.filter((course) => !categories.has(course.category) && course.access !== "free"),
  ];
  return ranked.slice(0, limit);
}
