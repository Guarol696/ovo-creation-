import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CategoryGlyph } from "@/components/art/category-glyph";
import { DemoBadge } from "@/components/ui/badges";
import { routes } from "@/config/site";
import { accessLabel } from "@/data/categories";
import { courseLessons } from "@/data/courses";
import type { ProgressMode, CourseProgress } from "@/features/progress/types";
import { ProjectsPanel } from "@/features/projects/projects-panel";
import type { Project } from "@/features/projects/types";
import { recommend, summarize } from "./insights";

function Bar({ ratio, label }: { ratio: number; label: string }) {
  return (
    <div className="h-1 bg-graphite" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(ratio * 100)}>
      <div className="h-full origin-left bg-volt" style={{ transform: `scaleX(${ratio})` }} />
    </div>
  );
}

/**
 * Tableau de bord : volontairement sobre (l'expérience immersive s'efface
 * devant la tâche). Partagé par le mode compte (données serveur) et le mode
 * démonstration (données du navigateur).
 */
export function DashboardView({
  name,
  mode,
  progress,
  projects,
  planLabel,
}: {
  name: string;
  mode: ProgressMode;
  progress: Record<string, CourseProgress>;
  projects?: Project[];
  planLabel: string;
}) {
  const { inProgress, completed, lessonsDone, last } = summarize(progress);
  const recommendations = recommend(progress);
  const lessonTitle = (courseSlug: string, slug: string) =>
    courseLessons(inProgress.find((status) => status.course.slug === courseSlug)!.course).find((lesson) => lesson.slug === slug)?.title;

  return (
    <div className="shell grid gap-12 pt-[calc(var(--header-h)+2.5rem)] pb-24">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="meta text-mist">Mon espace</p>
          <h1 className="font-expanded mt-3 text-[clamp(2rem,5vw,3.75rem)]">Bonjour, {name}.</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {mode === "local" && <DemoBadge>Mode démo — données de ce navigateur</DemoBadge>}
          <span className="meta border hairline px-3 py-2 text-silver">Offre : {planLabel}</span>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-px border hairline bg-steel/40 md:grid-cols-4">
        {[
          ["En cours", inProgress.length],
          ["Terminées", completed.length],
          ["Leçons terminées", lessonsDone],
          ["Projets", projects?.length ?? "—"],
        ].map(([label, value]) => (
          <div key={label} className="bg-void p-5">
            <dt className="meta text-mist">{label}</dt>
            <dd className="font-expanded mt-2 text-4xl">{value}</dd>
          </div>
        ))}
      </dl>

      {last ? (
        <section aria-labelledby="resume-title" className="grid gap-6 border hairline p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:p-8">
          <div className="relative size-20 border hairline bg-abyss">
            <CategoryGlyph category={last.course.category} className="absolute inset-0 m-auto size-[80%]" />
          </div>
          <div className="grid gap-2">
            <h2 id="resume-title" className="meta text-mist">Reprendre</h2>
            <p className="font-display text-xl font-bold [font-stretch:110%]">{last.course.title}</p>
            <p className="text-sm text-silver">À reprendre : {lessonTitle(last.course.slug, last.resume)}</p>
            <Bar ratio={last.ratio} label={`Progression ${last.course.title}`} />
          </div>
          <Link href={routes.lesson(last.course.slug, last.resume)} className="meta inline-flex min-h-12 items-center justify-center gap-2 bg-paper px-5 text-void hover:bg-volt">
            Continuer <ArrowUpRight aria-hidden className="size-4" />
          </Link>
        </section>
      ) : (
        <section className="grid gap-4 border hairline border-dashed p-8">
          <h2 className="font-display text-xl font-bold">Aucune formation commencée.</h2>
          <p className="max-w-md text-silver">Choisis une formation gratuite pour démarrer : ta progression apparaîtra ici.</p>
          <Link href={routes.academy} className="meta inline-flex min-h-12 w-fit items-center gap-2 bg-paper px-5 text-void hover:bg-volt">
            Explorer l&apos;Academy <ArrowUpRight aria-hidden className="size-4" />
          </Link>
        </section>
      )}

      <div className="grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="progress-title" className="grid content-start gap-4">
          <h2 id="progress-title" className="meta text-silver">Formations en cours</h2>
          {inProgress.length === 0 ? (
            <p className="text-sm text-mist">Rien en cours.</p>
          ) : (
            <ul className="grid gap-2">
              {inProgress.map((status) => (
                <li key={status.course.slug}>
                  <Link href={routes.lesson(status.course.slug, status.resume)} className="grid gap-3 border hairline p-4 hover:border-iron">
                    <span className="flex items-baseline justify-between gap-4">
                      <span className="font-medium">{status.course.title}</span>
                      <span className="meta shrink-0 text-mist">{status.done}/{status.total}</span>
                    </span>
                    <Bar ratio={status.ratio} label={`Progression ${status.course.title}`} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {completed.length > 0 && (
            <>
              <h2 className="meta mt-6 text-silver">Terminées</h2>
              <ul className="grid gap-2">
                {completed.map((status) => (
                  <li key={status.course.slug} className="flex items-center justify-between gap-4 border hairline p-4">
                    <Link href={routes.course(status.course.slug)} className="font-medium hover:text-volt">{status.course.title}</Link>
                    <span className="meta text-volt">100 %</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section aria-labelledby="projects-title" className="grid content-start gap-4">
          <h2 id="projects-title" className="meta text-silver">Projets personnels</h2>
          <ProjectsPanel mode={mode} initial={projects} />
        </section>
      </div>

      <section aria-labelledby="quick-title" className="grid gap-4">
        <h2 id="quick-title" className="meta text-silver">Accès rapides</h2>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Catalogue", href: routes.academy },
            { label: "Parcours", href: routes.paths },
            { label: "Assistant", href: routes.assistant },
            { label: "Réglages", href: routes.settings },
          ].map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="flex min-h-14 items-center justify-between border hairline px-4 hover:border-paper">
                {item.label} <ArrowUpRight aria-hidden className="size-4 text-mist" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="reco-title" className="grid gap-4">
        <h2 id="reco-title" className="meta text-silver">Recommandé pour toi</h2>
        <ul className="grid gap-2 md:grid-cols-3">
          {recommendations.map((course) => (
            <li key={course.slug}>
              <Link href={routes.course(course.slug)} className="grid h-full gap-2 border hairline p-4 hover:border-iron">
                <span className="font-medium">{course.title}</span>
                <span className="text-sm text-mist">{course.tagline}</span>
                <span className="meta mt-auto text-silver">{accessLabel[course.access]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
