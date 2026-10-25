"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Blueprint } from "@/components/art/blueprint";
import { RevealLines } from "@/components/motion/reveal-text";
import { TransitionLink } from "@/components/motion/transition-link";
import { SectionIndex } from "@/components/ui/badges";
import { routes } from "@/config/site";
import { projectExamples } from "@/data/projects";
import { cn } from "@/lib/utils";

/**
 * Scène 5 — Build something real : un atelier. Choisir un type de projet
 * redessine le plan (transition croisée avec léger zoom) et liste les
 * livrables réels produits pendant le parcours associé.
 * Onglets accessibles : flèches, Début/Fin, activation automatique.
 */
export function BuildReal() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const project = projectExamples[active];

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = projectExamples.length - 1;
    const next =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? index === last ? 0 : index + 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? index === 0 ? last : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section aria-labelledby="build-title" className="relative border-t hairline bg-abyss py-24 md:py-40">
      <div className="shell">
        <SectionIndex index="005" label="Build something real" />
        <RevealLines
          id="build-title"
          lang="en"
          className="font-expanded display-lg mt-8"
          lines={["Build", <span key="2" className="text-outline">something</span>, "real."]}
          label="Build something real."
        />
        <p data-reveal="up" className="mt-8 max-w-xl text-silver">
          Pas seulement regarder des vidéos : chaque parcours produit des livrables concrets. Voici des exemples de
          projets que tu peux mener de bout en bout.
        </p>

        <div className="mt-14 grid gap-8 lg:grid-cols-12">
          <div role="tablist" aria-label="Types de projets" className="flex gap-2 overflow-x-auto pb-2 lg:col-span-4 lg:flex-col lg:overflow-visible lg:pb-0">
            {projectExamples.map((item, index) => (
              <button
                key={item.slug}
                ref={(node) => {
                  tabs.current[index] = node;
                }}
                role="tab"
                id={`tab-${item.slug}`}
                aria-selected={active === index}
                aria-controls="build-panel"
                tabIndex={active === index ? 0 : -1}
                onClick={() => setActive(index)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={cn(
                  "group flex min-h-12 shrink-0 items-center gap-4 border px-4 text-left transition-colors duration-[var(--dur-quick)] lg:min-h-16",
                  active === index ? "border-paper bg-paper text-void" : "hairline text-silver hover:border-iron hover:text-paper",
                )}
              >
                <span className={cn("meta", active === index ? "text-void/60" : "text-mist")}>0{index + 1}</span>
                <span className="font-display font-semibold whitespace-nowrap [font-stretch:110%]">{item.label}</span>
              </button>
            ))}
          </div>

          <div
            id="build-panel"
            role="tabpanel"
            aria-labelledby={`tab-${project.slug}`}
            className="grid gap-8 border hairline bg-void p-5 md:grid-cols-2 md:p-8 lg:col-span-8"
          >
            <div key={project.slug} className="relative aspect-[4/3] animate-[fade-in_600ms_var(--ease-out)_both] border hairline">
              <div aria-hidden className="absolute inset-0 bg-[linear-gradient(var(--color-graphite)_1px,transparent_1px),linear-gradient(90deg,var(--color-graphite)_1px,transparent_1px)] bg-[size:24px_24px] opacity-60" />
              <Blueprint kind={project.slug} className="relative h-full w-full animate-[zoom-arrive_900ms_var(--ease-out)_both]" />
              <span className="meta absolute bottom-3 left-3 text-mist">Plan — {project.label}</span>
            </div>
            <div key={`${project.slug}-text`} className="flex animate-[fade-up_600ms_var(--ease-out)_both] flex-col gap-5">
              <h3 className="font-display text-2xl font-bold [font-stretch:112%]">{project.title}</h3>
              <p className="text-silver">{project.example}</p>
              <ol className="grid gap-2">
                {project.deliverables.map((deliverable, index) => (
                  <li key={deliverable} className="flex items-baseline gap-3 border-b hairline pb-2 text-sm">
                    <span className="meta text-volt">{String(index + 1).padStart(2, "0")}</span>
                    {deliverable}
                  </li>
                ))}
              </ol>
              <TransitionLink
                href={routes.path(project.path)}
                transitionLabel="Path"
                className="meta mt-auto inline-flex min-h-11 items-center gap-3 self-start border-b border-paper/30 pb-1 hover:border-volt hover:text-volt"
              >
                Voir le parcours associé →
              </TransitionLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
