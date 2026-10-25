import type { Metadata } from "next";
import { CategoryGlyph } from "@/components/art/category-glyph";
import { PageHero } from "@/components/sections/page-hero";
import { DemoBadge } from "@/components/ui/badges";
import { categoryBySlug } from "@/data/categories";
import { getCourses } from "@/data/courses";
import { CatalogControls } from "@/features/academy/components/catalog-controls";
import { CourseCard } from "@/features/academy/components/course-card";
import { filterCourses, parseCatalogQuery } from "@/features/academy/filter";

export const metadata: Metadata = {
  title: "Academy",
  description: "Catalogue des formations : sites, IA, entrepreneuriat, applications, e-commerce, marketing, freelancing.",
};

export default async function AcademyPage({ searchParams }: PageProps<"/academy">) {
  const query = parseCatalogQuery(await searchParams);
  const results = filterCourses(getCourses(), query);
  const category = query.category ? categoryBySlug(query.category) : undefined;

  return (
    <>
      <div className="relative overflow-hidden">
        {category && (
          // Arrivée de la transition « zoom » : le glyphe choisi occupe l'arrière-plan.
          <CategoryGlyph
            category={category.slug}
            className="pointer-events-none absolute top-16 -right-[10vw] size-[70vw] max-w-[760px] opacity-25 md:top-0 md:right-0 md:size-[52vw]"
          />
        )}
        <PageHero
          index={category ? category.index : "A"}
          label={category ? `Academy — ${category.label}` : "Academy — Catalogue"}
          title={category ? category.label : "The Academy"}
          lang={category ? undefined : "en"}
          lines={category ? category.label.split(" ") : ["The", "Academy"]}
          intro={<p>{category ? category.description : "Formations courtes, exercices appliqués, livrables concrets. Filtre par domaine, niveau ou accès."}</p>}
          aside={<DemoBadge>Contenus de démonstration</DemoBadge>}
          className="relative"
        />
      </div>

      <section aria-label="Catalogue" className="shell pb-24 md:pb-32">
        <CatalogControls query={query} total={results.length} />

        {results.length === 0 ? (
          <div className="mt-12 grid place-items-start gap-4 border hairline p-8 md:p-12">
            <p className="meta text-mist">[ 0 ] Aucun résultat</p>
            <p className="font-display text-2xl font-bold [font-stretch:110%]">Aucune formation ne correspond.</p>
            <p className="max-w-md text-silver">Essaie un autre mot-clé ou retire un filtre. Le catalogue s&apos;agrandit au fil des publications.</p>
          </div>
        ) : (
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((course, index) => (
              <li key={course.slug} data-reveal="up" style={{ "--d": `${(index % 3) * 80}ms` } as React.CSSProperties}>
                <CourseCard course={course} headingLevel="h2" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
