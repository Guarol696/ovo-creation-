import { CategoryGlyph } from "@/components/art/category-glyph";
import { RevealLines } from "@/components/motion/reveal-text";
import { TransitionLink } from "@/components/motion/transition-link";
import { ButtonLink } from "@/components/ui/button";
import { DemoBadge, SectionIndex } from "@/components/ui/badges";
import { routes } from "@/config/site";
import { categories } from "@/data/categories";
import { coursesByCategory, getCourse } from "@/data/courses";
import { CourseCard } from "@/features/academy/components/course-card";

const featured = ["site-professionnel", "premiere-application", "ia-copilote"]
  .map((slug) => getCourse(slug))
  .filter((course) => course !== undefined);

/**
 * Scène 4 — The Academy : un index éditorial des domaines. Chaque glyphe
 * est une porte : la transition « zoom » l'agrandit jusqu'au catalogue filtré.
 */
export function AcademyPreview() {
  return (
    <section aria-labelledby="academy-title" className="relative border-t hairline py-24 md:py-40">
      <div className="shell grid gap-8 md:grid-cols-12">
        <div className="md:col-span-7">
          <SectionIndex index="004" label="The academy" />
          <RevealLines
            id="academy-title"
            lang="en"
            className="font-expanded display-lg mt-8"
            lines={["The", "Academy"]}
            label="The Academy"
          />
        </div>
        <div className="flex flex-col justify-end gap-4 md:col-span-4 md:col-start-9">
          <p data-reveal="up" className="text-silver">
            Sept domaines, une même exigence : des leçons courtes, des exercices appliqués à ton projet, des livrables
            concrets.
          </p>
          <div data-reveal="up" style={{ "--d": "120ms" } as React.CSSProperties}>
            <DemoBadge>Catalogue de démonstration</DemoBadge>
          </div>
        </div>
      </div>

      <ul className="shell mt-16 md:mt-24">
        {categories.map((category, index) => {
          const count = coursesByCategory(category.slug).length;
          return (
            <li key={category.slug} data-reveal="up" style={{ "--d": `${index * 50}ms` } as React.CSSProperties}>
              <TransitionLink
                href={`${routes.academy}?categorie=${category.slug}`}
                transition="zoom"
                data-cursor-label="Explore"
                className="group grid min-h-24 grid-cols-[auto_1fr_auto] items-center gap-4 border-t hairline py-4 transition-colors duration-[var(--dur-base)] hover:bg-abyss sm:gap-8 md:grid-cols-[4rem_1fr_16rem_auto] md:px-4"
              >
                <span className="meta text-mist group-hover:text-volt">{category.index}</span>
                <span>
                  <span className="font-display block text-[clamp(1.35rem,3.6vw,2.6rem)] leading-tight font-bold [font-stretch:115%] transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:translate-x-2">
                    {category.label}
                  </span>
                  <span className="mt-1 block text-sm text-mist md:hidden">{category.description}</span>
                </span>
                <span className="hidden text-sm text-mist md:block">{category.description}</span>
                <span className="flex items-center gap-4">
                  <span className="meta hidden text-mist sm:inline">
                    {count} {count > 1 ? "formations" : "formation"}
                  </span>
                  <span data-zoom-target className="relative block size-16 shrink-0 border hairline bg-void md:size-20">
                    <CategoryGlyph category={category.slug} className="absolute inset-0 m-auto size-[80%]" />
                  </span>
                </span>
              </TransitionLink>
            </li>
          );
        })}
      </ul>

      <div className="shell mt-24 md:mt-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h3 className="font-expanded display-sm">Sélection</h3>
          <ButtonLink href={routes.academy} variant="outline" transition="portal" transitionLabel="Academy">
            Tout le catalogue
          </ButtonLink>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-[1.25fr_1fr]">
          {featured[0] && (
            <div className="lg:row-span-2" data-reveal="up">
              <CourseCard course={featured[0]} size="lg" />
            </div>
          )}
          {featured.slice(1).map((course, index) => (
            <div key={course.slug} data-reveal="up" style={{ "--d": `${(index + 1) * 100}ms` } as React.CSSProperties}>
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
