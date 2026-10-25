import { CategoryGlyph } from "@/components/art/category-glyph";
import { TransitionLink } from "@/components/motion/transition-link";
import { DemoBadge, Tag } from "@/components/ui/badges";
import { routes } from "@/config/site";
import { accessLabel, categoryBySlug, levelLabel } from "@/data/categories";
import { courseMinutes } from "@/data/courses";
import { cn, formatMinutes } from "@/lib/utils";
import type { Course } from "@/types/academy";

/**
 * Carte de formation : la composition visuelle est la porte d'entrée —
 * la transition « zoom » l'agrandit jusqu'à l'en-tête de la page détail.
 */
export function CourseCard({ course, size = "md", headingLevel = "h3" }: { course: Course; size?: "md" | "lg"; headingLevel?: "h2" | "h3" }) {
  const category = categoryBySlug(course.category);
  const Heading = headingLevel;
  return (
    <article className="group relative flex h-full flex-col border hairline bg-abyss transition-colors duration-[var(--dur-base)] hover:border-iron">
      <div
        data-zoom-target
        className={cn(
          "relative overflow-hidden border-b hairline bg-void",
          size === "lg" ? "aspect-[4/3] lg:aspect-auto lg:min-h-80 lg:flex-1" : "aspect-[16/10]",
        )}
      >
        <CategoryGlyph
          category={course.category}
          className="absolute inset-0 m-auto h-[78%] w-[78%] transition-transform duration-[1200ms] ease-[var(--ease-out)] group-hover:scale-[1.06]"
        />
        <span className="meta absolute top-3 left-3 text-mist">{category?.index}</span>
        <DemoBadge className="absolute top-3 right-3 bg-void/80" />
      </div>
      <div className={cn("flex flex-col gap-4 p-5 md:p-6", size === "lg" ? "flex-1 lg:flex-none" : "flex-1")}>
        <p className="meta flex flex-wrap gap-x-3 gap-y-1 text-mist">
          <span>{category?.label}</span>
          <span aria-hidden>/</span>
          <span>{levelLabel(course.level)}</span>
          <span aria-hidden>/</span>
          <span>{formatMinutes(courseMinutes(course))}</span>
        </p>
        <Heading className={cn("font-display font-bold [font-stretch:110%]", size === "lg" ? "text-2xl md:text-3xl" : "text-xl")}>
          <TransitionLink
            href={routes.course(course.slug)}
            transition="zoom"
            data-cursor-label="Open"
            className="after:absolute after:inset-0 after:content-['']"
          >
            {course.title}
          </TransitionLink>
        </Heading>
        <p className="text-sm leading-relaxed text-silver">{course.tagline}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <Tag className={course.access === "free" ? "border-paper/40 text-paper" : undefined}>{accessLabel[course.access]}</Tag>
          <span aria-hidden className="meta text-mist transition-[color,translate] duration-[var(--dur-base)] group-hover:translate-x-1 group-hover:text-volt">
            →
          </span>
        </div>
      </div>
    </article>
  );
}
