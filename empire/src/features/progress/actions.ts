"use server";

import { z } from "zod";
import { getCourse } from "@/data/courses";
import { findLesson } from "@/data/courses";
import { canViewLesson } from "@/features/academy/access";
import { getCurrentUser, getUserPlan } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

const target = z.object({ course: z.string().max(120), lesson: z.string().max(120) });

/** Vérifie la session, l'existence de la leçon et le droit d'y accéder (côté serveur). */
async function authorize(input: unknown) {
  const parsed = target.safeParse(input);
  if (!parsed.success) return { error: "Requête invalide." } as const;
  const user = await getCurrentUser();
  if (!user) return { error: "Connecte-toi pour enregistrer ta progression." } as const;
  const course = getCourse(parsed.data.course);
  if (!course || !findLesson(course, parsed.data.lesson)) return { error: "Leçon introuvable." } as const;
  if (!canViewLesson(course, parsed.data.lesson, await getUserPlan(user.id))) return { error: "Leçon non incluse dans ton offre." } as const;
  return { user, course: parsed.data.course, lesson: parsed.data.lesson } as const;
}

const fail = (context: string, error: unknown): ActionResult => {
  console.error(`[progression] ${context}`, error);
  return { ok: false, error: "Enregistrement impossible pour le moment. Réessaie." };
};

export async function setLessonCompleted(input: { course: string; lesson: string; completed: boolean }): Promise<ActionResult> {
  const auth = await authorize(input);
  if ("error" in auth) return { ok: false, error: auth.error! };
  try {
    const supabase = await createClient();
    const now = new Date().toISOString();
    const { error } = await supabase.from("lesson_progress").upsert(
      { user_id: auth.user.id, course_slug: auth.course, lesson_slug: auth.lesson, completed_at: input.completed ? now : null, updated_at: now },
      { onConflict: "user_id,course_slug,lesson_slug" },
    );
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return fail("leçon terminée", error);
  }
}

/** Dernière leçon ouverte + position de lecture (reprise). */
export async function touchLesson(input: { course: string; lesson: string; position?: number }): Promise<ActionResult> {
  const auth = await authorize(input);
  if ("error" in auth) return { ok: false, error: auth.error! };
  const position = Math.max(0, Math.min(86_400, Math.round(Number(input.position) || 0)));
  try {
    const supabase = await createClient();
    const now = new Date().toISOString();
    const [enrollment, progress] = await Promise.all([
      supabase
        .from("enrollments")
        .upsert({ user_id: auth.user.id, course_slug: auth.course, last_lesson_slug: auth.lesson, updated_at: now }, { onConflict: "user_id,course_slug" }),
      input.position === undefined
        ? Promise.resolve({ error: null })
        : supabase
            .from("lesson_progress")
            .upsert(
              { user_id: auth.user.id, course_slug: auth.course, lesson_slug: auth.lesson, position_seconds: position, updated_at: now },
              { onConflict: "user_id,course_slug,lesson_slug" },
            ),
    ]);
    if (enrollment.error) throw enrollment.error;
    if (progress.error) throw progress.error;
    return { ok: true };
  } catch (error) {
    return fail("reprise", error);
  }
}

export async function saveLessonNote(input: { course: string; lesson: string; body: string }): Promise<ActionResult> {
  const auth = await authorize(input);
  if ("error" in auth) return { ok: false, error: auth.error! };
  const body = String(input.body ?? "").slice(0, 10_000);
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("lesson_notes")
      .upsert(
        { user_id: auth.user.id, course_slug: auth.course, lesson_slug: auth.lesson, body, updated_at: new Date().toISOString() },
        { onConflict: "user_id,course_slug,lesson_slug" },
      );
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return fail("note", error);
  }
}
