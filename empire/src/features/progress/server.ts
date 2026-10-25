import "server-only";
import { createClient } from "@/lib/supabase/server";
import { emptyProgress, type CourseProgress } from "./types";

/** Progression enregistrée d'un utilisateur (RLS : uniquement ses lignes). */
export async function getRemoteProgress(userId: string, courseSlug?: string): Promise<Record<string, CourseProgress>> {
  const supabase = await createClient();
  let lessonQuery = supabase.from("lesson_progress").select("course_slug, lesson_slug, completed_at, position_seconds").eq("user_id", userId);
  let noteQuery = supabase.from("lesson_notes").select("course_slug, lesson_slug, body").eq("user_id", userId);
  let enrollmentQuery = supabase.from("enrollments").select("course_slug, last_lesson_slug, updated_at").eq("user_id", userId);
  if (courseSlug) {
    lessonQuery = lessonQuery.eq("course_slug", courseSlug);
    noteQuery = noteQuery.eq("course_slug", courseSlug);
    enrollmentQuery = enrollmentQuery.eq("course_slug", courseSlug);
  }
  const [lessons, notes, enrollments] = await Promise.all([lessonQuery, noteQuery, enrollmentQuery]);
  const error = lessons.error ?? notes.error ?? enrollments.error;
  if (error) throw error;

  const result: Record<string, CourseProgress> = {};
  const get = (course: string) => (result[course] ??= emptyProgress());
  for (const row of enrollments.data ?? []) {
    const progress = get(row.course_slug);
    progress.lastLesson = row.last_lesson_slug ?? undefined;
    progress.updatedAt = row.updated_at;
  }
  for (const row of lessons.data ?? []) {
    const progress = get(row.course_slug);
    if (row.completed_at) progress.completed.push(row.lesson_slug);
    if (row.position_seconds) progress.positions[row.lesson_slug] = row.position_seconds;
  }
  for (const row of notes.data ?? []) get(row.course_slug).notes[row.lesson_slug] = row.body;
  return result;
}
