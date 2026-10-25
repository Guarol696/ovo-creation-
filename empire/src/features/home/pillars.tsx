import type { CSSProperties } from "react";
import { PillarArt } from "@/components/art/pillar-art";
import { RevealLines } from "@/components/motion/reveal-text";
import { ScrollScene } from "@/components/motion/scroll-scene";
import { TransitionLink } from "@/components/motion/transition-link";
import { SectionIndex } from "@/components/ui/badges";
import { routes } from "@/config/site";
import { pillars } from "@/data/pillars";
import { cn } from "@/lib/utils";

/**
 * Scène 3 — Three Pillars : trois rangées éditoriales en miroir, pas trois cartes.
 * Le numéro géant dérive à une vitesse différente du texte (profondeur).
 */
export function Pillars() {
  return (
    <section aria-labelledby="pillars-title" className="relative py-24 md:py-40">
      <div className="shell">
        <SectionIndex index="003" label="Three pillars" />
        <RevealLines
          as="h2"
          id="pillars-title"
          lang="en"
          className="font-expanded display-md mt-8 max-w-4xl"
          lines={["Three moves.", <span key="b" className="text-outline">One trajectory.</span>]}
          label="Three moves. One trajectory."
        />
      </div>

      <ol className="mt-16 md:mt-28">
        {pillars.map((pillar, index) => {
          const mirrored = index % 2 === 1;
          return (
            <li key={pillar.slug} className="border-t hairline last:border-b">
              <ScrollScene as="div" className="shell group relative grid items-center gap-10 py-14 md:grid-cols-12 md:gap-8 md:py-24">
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute top-6 select-none md:top-1/2 md:-translate-y-1/2",
                    mirrored ? "left-[var(--gutter)]" : "right-[var(--gutter)]",
                  )}
                >
                  <span
                    className="font-expanded block display-xl text-outline"
                    style={{ transform: "translateY(calc((0.5 - var(--p)) * 140px))" } as CSSProperties}
                  >
                    {pillar.index}
                  </span>
                </span>

                <div className={cn("relative md:col-span-6", mirrored ? "md:order-2 md:col-start-7" : "md:col-start-1")}>
                  <p className="meta text-mist">{pillar.index} —</p>
                  <h3 lang="en" className="font-expanded mt-3 text-[clamp(2.5rem,7vw,6.5rem)]">
                    {pillar.title}
                  </h3>
                  <p className="mt-6 max-w-sm text-lg text-paper">{pillar.headline}</p>
                  <p className="mt-3 max-w-sm text-silver">{pillar.summary}</p>
                  <TransitionLink
                    href={routes.pillar(pillar.slug)}
                    transitionLabel={pillar.title}
                    data-cursor-label="Open"
                    className="meta group/link mt-8 inline-flex min-h-11 items-center gap-3 border-b border-paper/30 pb-1 transition-colors hover:border-volt hover:text-volt"
                  >
                    Explorer le pilier
                    <span aria-hidden className="transition-transform duration-[var(--dur-base)] group-hover/link:translate-x-1">→</span>
                  </TransitionLink>
                </div>

                <div className={cn("relative md:col-span-5", mirrored ? "md:order-1 md:col-start-1" : "md:col-start-8")}>
                  <PillarArt kind={pillar.slug} className="mx-auto max-w-md" />
                </div>
              </ScrollScene>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
