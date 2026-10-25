import type { Course, Lesson } from "@/types/academy";
import { buildCourses } from "./build";
import { growCourses } from "./grow";

/**
 * Catalogue de démonstration. Pour brancher une vraie source (Supabase, CMS),
 * remplacer ces fonctions par des lectures asynchrones : les pages ne
 * consomment que `getCourses` / `getCourse`.
 */
export const courses: Course[] = [...buildCourses, ...growCourses];

export const getCourses = () => courses;

export const getCourse = (slug: string) => courses.find((course) => course.slug === slug);

export const courseLessons = (course: Course): Lesson[] => course.modules.flatMap((module) => module.lessons);

export const courseMinutes = (course: Course) =>
  courseLessons(course).reduce((total, lesson) => total + lesson.minutes, 0);

export function findLesson(course: Course, lessonSlug: string) {
  const lessons = courseLessons(course);
  const index = lessons.findIndex((lesson) => lesson.slug === lessonSlug);
  if (index === -1) return null;
  const courseModule = course.modules.find((item) => item.lessons.some((lesson) => lesson.slug === lessonSlug))!;
  return {
    lesson: lessons[index],
    module: courseModule,
    index,
    total: lessons.length,
    previous: lessons[index - 1] ?? null,
    next: lessons[index + 1] ?? null,
  };
}

export const coursesByCategory = (category: string) => courses.filter((course) => course.category === category);
