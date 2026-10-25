import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { videoFor } from "@/config/media";
import { planById } from "@/config/plans";
import { routes } from "@/config/site";
import { courseLessons, findLesson, getCourse } from "@/data/courses";
import { canViewLesson, isPreviewLesson } from "@/features/academy/access";
import { LessonBody } from "@/features/player/lesson-body";
import { LessonWorkspace } from "@/features/player/lesson-workspace";
import { getRemoteProgress } from "@/features/progress/server";
import { getCurrentUser, getUserPlan } from "@/lib/auth/session";
import { loginUrl } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { robots: { index: false } };

export default async function LessonPage({ params }: PageProps<"/learn/[course]/[lesson]">) {
  const { course: courseSlug, lesson: lessonSlug } = await params;
  const course = getCourse(courseSlug);
  const found = course ? findLesson(course, lessonSlug) : null;
  if (!course || !found) notFound();

  const user = await getCurrentUser();
  const plan = await getUserPlan(user?.id);
  const allowed = canViewLesson(course, lessonSlug, plan);

  if (!allowed) {
    const required = planById(course.access);
    return (
      <section className="shell flex min-h-[80dvh] flex-col justify-center gap-6 pt-[var(--header-h)]">
        <Lock aria-hidden className="size-6 text-mist" />
        <p className="meta text-mist">{course.title}</p>
        <h1 className="font-expanded display-md max-w-3xl">Leçon réservée à l&apos;offre {required.name}.</h1>
        <p className="max-w-md text-silver">
          « {found.lesson.title} » fait partie de la formation complète. La première leçon reste accessible librement.
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={`${routes.pricing}?offre=${course.access}`}>Voir l&apos;offre {required.name}</ButtonLink>
          {!user && isSupabaseConfigured() && (
            <ButtonLink href={loginUrl(routes.lesson(course.slug, lessonSlug))} variant="outline">
              J&apos;ai déjà un compte
            </ButtonLink>
          )}
          <ButtonLink href={routes.course(course.slug)} variant="ghost">
            Retour au programme
          </ButtonLink>
        </div>
      </section>
    );
  }

  const mode = user ? "remote" : "local";
  let initial;
  let loadError = false;
  if (user) {
    try {
      initial = (await getRemoteProgress(user.id, course.slug))[course.slug];
    } catch (error) {
      console.error("[progression] lecture impossible", error);
      loadError = true;
    }
  }

  const outline = courseLessons(course).map((lesson) => ({
    slug: lesson.slug,
    title: lesson.title,
    minutes: lesson.minutes,
    module: course.modules.find((module) => module.lessons.includes(lesson))!.title,
    locked: !canViewLesson(course, lesson.slug, plan),
  }));

  return (
    <LessonWorkspace
      key={lessonSlug}
      course={{ slug: course.slug, title: course.title }}
      lesson={{ slug: found.lesson.slug, title: found.lesson.title }}
      outline={outline}
      video={videoFor(found.lesson.video)}
      mode={mode}
      initial={initial}
      previous={found.previous?.slug}
      next={found.next?.slug ?? null}
    >
      {loadError && (
        <Notice tone="error" title="Progression indisponible" className="mb-6">
          Impossible de charger ta progression enregistrée. Tu peux continuer la leçon ; réessaie plus tard.
        </Notice>
      )}
      {isPreviewLesson(course, lessonSlug) && (
        <Notice tone="info" title="Leçon d'aperçu" className="mb-6">
          Cette leçon est offerte. La suite de la formation est incluse dans l&apos;offre {planById(course.access).name}.
        </Notice>
      )}
      <p className="meta mb-6 text-mist">
        Leçon {found.index + 1} / {found.total} — {found.module.title} — {found.lesson.minutes} min
      </p>
      <LessonBody body={found.lesson.body} />
    </LessonWorkspace>
  );
}
