import { Fragment, type CSSProperties } from "react";
import { ScrollScene } from "@/components/motion/scroll-scene";
import { SectionIndex } from "@/components/ui/badges";

const statement = "The future belongs to those who build it.";

/**
 * Scène 2 — The Philosophy : section épinglée. Chaque mot s'allume quand
 * le défilement l'atteint (variable --p) ; la composition abstraite tourne
 * sur trois profondeurs différentes.
 */
export function Philosophy() {
  const words = statement.split(" ");
  const step = 0.62 / words.length;

  return (
    <ScrollScene
      mode="sticky"
      aria-labelledby="philosophy-title"
      className="relative h-[240vh] in-data-[motion=reduced]:h-auto"
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden in-data-[motion=reduced]:relative in-data-[motion=reduced]:py-32">
        {/* Composition abstraite : trois couches, trois vitesses. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="absolute top-1/2 left-[62%] size-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border hairline"
            style={{ transform: "translate(-50%,-50%) scale(calc(0.55 + var(--p) * 0.7))" } as CSSProperties}
          />
          <div
            className="absolute top-1/2 left-[62%] size-[80vmin] rounded-full border border-silver/15"
            style={{ transform: "translate(-50%,-50%) rotate(calc(var(--p) * 90deg)) scaleY(0.32)" } as CSSProperties}
          />
          <div
            className="absolute top-1/2 left-[62%] h-[150vmin] w-px bg-gradient-to-b from-transparent via-silver/30 to-transparent"
            style={{ transform: "translate(-50%,-50%) rotate(calc(18deg + var(--p) * 30deg))" } as CSSProperties}
          />
          <div
            className="absolute top-1/2 left-[62%] size-3 bg-volt"
            style={{ transform: "translate(-50%,-50%) translateX(calc(var(--p) * 30vmin)) rotate(45deg)", opacity: "calc(var(--p) * 2 - 0.4)" } as CSSProperties}
          />
        </div>

        <div className="shell relative">
          <SectionIndex index="002" label="The philosophy" className="mb-10" />
          <h2 id="philosophy-title" lang="en" className="font-expanded display-lg max-w-[13ch]" aria-label={statement}>
            {words.map((word, index) => (
              <Fragment key={index}>
              <span
                aria-hidden
                className="inline-block"
                style={
                  {
                    opacity: `clamp(0.1, calc((var(--p) - ${0.06 + index * step}) * 14), 1)`,
                    transform: `translate3d(0, calc(clamp(0, calc((${0.06 + index * step} - var(--p)) * 6), 1) * 0.25em), 0)`,
                  } as CSSProperties
                }
              >
                {word === "build" ? <span className="text-volt">{word}</span> : word}
              </span>
              {index < words.length - 1 ? " " : null}
              </Fragment>
            ))}
          </h2>
          <p
            className="mt-10 max-w-md text-silver"
            style={{ opacity: "clamp(0, calc((var(--p) - 0.72) * 6), 1)" } as CSSProperties}
          >
            L&apos;avenir appartient à celles et ceux qui le construisent. Ici, on apprend en produisant : chaque
            leçon se termine par quelque chose de concret, appliqué à ton propre projet.
          </p>
        </div>
      </div>
    </ScrollScene>
  );
}
