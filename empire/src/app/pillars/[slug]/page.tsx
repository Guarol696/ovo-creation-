import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PillarArt } from "@/components/art/pillar-art";
import { PageHero } from "@/components/sections/page-hero";
import { routes } from "@/config/site";
import { getCourse } from "@/data/courses";
import { getPath } from "@/data/paths";
import { getPillar, pillars } from "@/data/pillars";
import { CourseCard } from "@/features/academy/components/course-card";

export function generateStaticParams() {
  return pillars.map((pillar) => ({ slug: pillar.slug }));
}

export async function generateMetadata({ params }: PageProps<"/pillars/[slug]">): Promise<Metadata> {
  const pillar = getPillar((await params).slug);
  return pillar ? { title: pillar.title, description: pillar.headline } : {};
}

export default async function PillarPage({ params }: PageProps<"/pillars/[slug]">) {
  const pillar = getPillar((await params).slug);
  if (!pillar) notFound();
  const related = pillar.courses.map(getCourse).filter((course) => course !== undefined);
  const relatedPaths = pillar.paths.map(getPath).filter((path) => path !== undefined);
  const index = pillars.indexOf(pillar);
  const next = pillars[(index + 1) % pillars.length];

  return (
    <>
      <PageHero
        index={pillar.index}
        label="Pilier"
        lang="en"
        title={pillar.title}
        lines={[pillar.title]}
        intro={<p className="text-lg text-paper">{pillar.headline}</p>}
      />
      <section className="shell grid gap-12 pb-20 lg:grid-cols-12">
        <div className="grid content-start gap-5 lg:col-span-6">
          {pillar.body.map((paragraph) => (
            <p key={paragraph} data-reveal="up" className="max-w-xl text-lg leading-relaxed text-silver">{paragraph}</p>
          ))}
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <PillarArt kind={pillar.slug} className="mx-auto max-w-md" />
        </div>
      </section>
      <section aria-labelledby="related-title" className="shell border-t hairline py-16">
        <h2 id="related-title" className="meta text-mist">Formations associées</h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {related.map((course) => (
            <li key={course.slug}>
              <CourseCard course={course} />
            </li>
          ))}
        </ul>
        {relatedPaths.length > 0 && (
          <>
            <h2 className="meta mt-16 text-mist">Parcours</h2>
            <ul className="mt-4 grid gap-2">
              {relatedPaths.map((path) => (
                <li key={path.slug}>
                  <Link href={routes.path(path.slug)} className="flex min-h-14 items-center justify-between border hairline px-4 hover:border-paper">
                    <span>{path.title}</span>
                    <span className="meta text-mist">{path.steps.length} étapes →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
      <Link href={routes.pillar(next.slug)} className="group block border-t hairline">
        <div className="shell flex items-center justify-between gap-6 py-14">
          <span className="meta text-mist">Pilier suivant</span>
          <span lang="en" className="font-expanded display-md transition-colors group-hover:text-volt">{next.title} →</span>
        </div>
      </Link>
    </>
  );
}
