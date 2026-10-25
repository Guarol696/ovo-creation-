import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/sections/page-hero";
import { routes } from "@/config/site";
import { courses } from "@/data/courses";
import { getPath, paths } from "@/data/paths";
import { StepTracker } from "@/features/paths/step-tracker";

export function generateStaticParams() {
  return paths.map((path) => ({ slug: path.slug }));
}

export async function generateMetadata({ params }: PageProps<"/paths/[slug]">): Promise<Metadata> {
  const path = getPath((await params).slug);
  return path ? { title: path.title, description: path.promise } : {};
}

export default async function PathPage({ params }: PageProps<"/paths/[slug]">) {
  const path = getPath((await params).slug);
  if (!path) notFound();
  const courseTitles = Object.fromEntries(courses.map((course) => [course.slug, course.title]));

  return (
    <>
      <PageHero
        index={path.index}
        label="Parcours"
        title={path.title}
        lines={[path.title]}
        intro={<p>{path.promise}</p>}
        aside={
          <dl className="grid grid-cols-2 gap-px border hairline bg-steel/40">
            <div className="bg-void p-4">
              <dt className="meta text-mist">Durée</dt>
              <dd className="mt-1">~{path.weeks} semaines</dd>
            </div>
            <div className="bg-void p-4">
              <dt className="meta text-mist">Résultat</dt>
              <dd className="mt-1 text-sm">{path.outcome}</dd>
            </div>
          </dl>
        }
      />
      <section aria-label="Étapes" className="shell grid gap-12 pb-24 md:pb-32 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <StepTracker path={path.slug} steps={path.steps} courseTitles={courseTitles} />
        </div>
        <aside className="lg:col-span-3 lg:col-start-10">
          <p className="meta text-mist">Autres parcours</p>
          <ul className="mt-4 grid gap-1">
            {paths
              .filter((item) => item.slug !== path.slug)
              .map((item) => (
                <li key={item.slug}>
                  <Link href={routes.path(item.slug)} className="flex min-h-11 items-center gap-3 text-silver hover:text-paper">
                    <span className="meta text-mist">{item.index}</span> {item.title}
                  </Link>
                </li>
              ))}
          </ul>
        </aside>
      </section>
    </>
  );
}
