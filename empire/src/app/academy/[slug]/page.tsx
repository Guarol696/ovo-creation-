import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Lock, PlayCircle } from "lucide-react";
import { CategoryGlyph } from "@/components/art/category-glyph";
import { RevealLines } from "@/components/motion/reveal-text";
import { ButtonLink } from "@/components/ui/button";
import { DemoBadge, Tag } from "@/components/ui/badges";
import { Notice } from "@/components/ui/notice";
import { planById } from "@/config/plans";
import { routes } from "@/config/site";
import { accessLabel, categoryBySlug, levelLabel } from "@/data/categories";
import { courseLessons, courseMinutes, courses, getCourse } from "@/data/courses";
import { canViewLesson } from "@/features/academy/access";
import { getCurrentUser, getUserPlan } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";
import { formatMinutes } from "@/lib/utils";

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: PageProps<"/academy/[slug]">): Promise<Metadata> {
  const course = getCourse((await params).slug);
  return course ? { title: course.title, description: course.tagline } : {};
}

export default async function CoursePage({ params }: PageProps<"/academy/[slug]">) {
  const course = getCourse((await params).slug);
  if (!course) notFound();

  const user = await getCurrentUser();
  const plan = await getUserPlan(user?.id);
  const category = categoryBySlug(course.category);
  const lessons = courseLessons(course);
  const first = lessons[0];
  const unlocked = canViewLesson(course, lessons[lessons.length - 1].slug, plan);
  const requiredPlan = planById(course.access);

  return (
    <article>
      <header className="relative overflow-hidden border-b hairline">
        <div className="shell grid gap-10 pt-[calc(var(--header-h)+3rem)] pb-14 lg:grid-cols-12 lg:pb-20">
          <div className="lg:col-span-7">
            <nav aria-label="Fil d'Ariane" className="meta flex flex-wrap items-center gap-2 text-mist">
              <Link href={routes.academy} className="inline-flex min-h-11 items-center hover:text-paper">
                Academy
              </Link>
              <span aria-hidden>/</span>
              <Link href={`${routes.academy}?categorie=${course.category}`} className="inline-flex min-h-11 items-center hover:text-paper">
                {category?.label}
              </Link>
            </nav>
            <RevealLines as="h1" className="font-display mt-6 text-[clamp(2.2rem,5.4vw,4.75rem)] leading-[0.95] font-extrabold tracking-[-0.03em] [font-stretch:118%]" lines={[course.title]} />
            <p data-reveal="up" className="mt-6 max-w-xl text-lg text-silver">
              {course.tagline}
            </p>
            <dl data-reveal="up" className="mt-8 grid max-w-xl grid-cols-2 gap-px border hairline bg-steel/40 sm:grid-cols-4">
              {[
                ["Niveau", levelLabel(course.level)],
                ["Durée", formatMinutes(courseMinutes(course))],
                ["Leçons", String(lessons.length)],
                ["Accès", course.access === "free" ? "Gratuit" : requiredPlan.name],
              ].map(([term, value]) => (
                <div key={term} className="bg-void p-4">
                  <dt className="meta text-mist">{term}</dt>
                  <dd className="mt-1 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            <div data-reveal="up" className="mt-8 flex flex-wrap items-center gap-3">
              {unlocked ? (
                <ButtonLink href={routes.lesson(course.slug, first.slug)} size="lg" magnetic transition="portal" transitionLabel="Play" data-cursor-label="Play">
                  Commencer la formation
                </ButtonLink>
              ) : (
                <>
                  <ButtonLink href={`${routes.pricing}?offre=${course.access}`} size="lg" magnetic>
                    Débloquer avec {requiredPlan.name}
                  </ButtonLink>
                  <ButtonLink href={routes.lesson(course.slug, first.slug)} size="lg" variant="outline">
                    Voir la leçon d&apos;aperçu
                  </ButtonLink>
                </>
              )}
            </div>
          </div>
          <div className="relative lg:col-span-5">
            <div className="relative aspect-square border hairline bg-abyss">
              <CategoryGlyph category={course.category} className="absolute inset-0 m-auto size-[82%]" />
              <DemoBadge className="absolute top-3 right-3 bg-void/80">Formation de démonstration</DemoBadge>
              <span className="meta absolute bottom-3 left-3 text-mist">{category?.index} — {category?.label}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="shell grid gap-16 py-16 md:py-24 lg:grid-cols-12">
        <div className="grid content-start gap-16 lg:col-span-7">
          <section aria-labelledby="about-title">
            <h2 id="about-title" className="meta text-mist">À propos</h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-paper">{course.description}</p>
          </section>

          <section aria-labelledby="objectives-title">
            <h2 id="objectives-title" className="meta text-mist">Objectifs pédagogiques</h2>
            <ul className="mt-6 grid gap-3">
              {course.objectives.map((objective) => (
                <li key={objective} className="flex gap-4 border-b hairline pb-3">
                  <Check aria-hidden className="mt-1 size-4 shrink-0 text-volt" />
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="program-title">
            <h2 id="program-title" className="meta text-mist">Programme</h2>
            <ol className="mt-6 grid gap-3">
              {course.modules.map((module, moduleIndex) => (
                <li key={module.slug}>
                  <details open={moduleIndex === 0} className="group border hairline bg-abyss">
                    <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 px-5 [&::-webkit-details-marker]:hidden">
                      <span className="meta text-mist">M{moduleIndex + 1}</span>
                      <span className="font-display flex-1 text-lg font-bold [font-stretch:110%]">{module.title}</span>
                      <span className="meta text-mist">{module.lessons.length} leçon{module.lessons.length > 1 ? "s" : ""}</span>
                      <span aria-hidden className="text-mist transition-transform duration-[var(--dur-base)] group-open:rotate-45">+</span>
                    </summary>
                    <ul className="border-t hairline">
                      {module.lessons.map((lesson) => {
                        const open = canViewLesson(course, lesson.slug, plan);
                        return (
                          <li key={lesson.slug} className="border-b hairline last:border-b-0">
                            <Link
                              href={routes.lesson(course.slug, lesson.slug)}
                              className="flex min-h-14 items-center gap-4 px-5 py-3 transition-colors hover:bg-graphite/60"
                            >
                              {open ? <PlayCircle aria-hidden className="size-4 shrink-0 text-silver" /> : <Lock aria-hidden className="size-4 shrink-0 text-mist" />}
                              <span className="flex-1">
                                <span className="block">{lesson.title}</span>
                                <span className="block text-sm text-mist">{lesson.summary}</span>
                              </span>
                              <span className="meta shrink-0 text-mist">{lesson.minutes} min</span>
                              <span className="sr-only">{open ? "Accessible" : "Verrouillée"}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="grid content-start gap-6 lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:col-span-4 lg:col-start-9">
          <div className="border hairline p-6">
            <p className="meta text-mist">Conditions d&apos;accès</p>
            <p className="font-expanded mt-3 text-3xl">{accessLabel[course.access]}</p>
            <p className="mt-3 text-sm text-silver">
              {course.access === "free"
                ? "Formation entièrement gratuite. Crée un compte pour enregistrer ta progression sur tous tes appareils."
                : `La première leçon est en accès libre. La suite est incluse dans l'offre ${requiredPlan.name}${
                    requiredPlan.monthlyPrice ? ` (${requiredPlan.monthlyPrice} € / mois)` : ""
                  }.`}
            </p>
            {!unlocked && (
              <ButtonLink href={`${routes.pricing}?offre=${course.access}`} className="mt-6 w-full">
                Voir l&apos;offre {requiredPlan.name}
              </ButtonLink>
            )}
          </div>
          <div className="border hairline p-6">
            <p className="meta text-mist">Formateur</p>
            <p className="mt-3 font-medium">{course.instructor.name}</p>
            <p className="text-sm text-mist">{course.instructor.role}</p>
          </div>
          {!isSupabaseConfigured() && (
            <Notice tone="demo" title="Mode démonstration">
              Comptes et paiements ne sont pas encore connectés : ta progression est enregistrée dans ce navigateur.
            </Notice>
          )}
          <div className="flex flex-wrap gap-2">
            <Tag>{category?.label}</Tag>
            <Tag>Mis à jour le {new Date(course.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</Tag>
          </div>
        </aside>
      </div>
    </article>
  );
}
