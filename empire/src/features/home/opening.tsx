import type { CSSProperties } from "react";
import { HeroScene } from "@/components/three/hero-scene";
import { ButtonLink } from "@/components/ui/button";
import { routes, siteConfig } from "@/config/site";

/** Scène 1 — Opening : la structure apparaît dans la lumière, le titre monte ligne par ligne. */
export function Opening() {
  const lines = [
    { text: "Build", className: "" },
    { text: "Your", className: "pl-[14vw] md:pl-[22vw]" },
    { text: "Empire", className: "", accent: true },
  ];

  return (
    <section id="opening" aria-labelledby="opening-title" className="relative isolate h-[100svh] min-h-[620px] overflow-hidden">
      <HeroScene className="absolute inset-0 -z-10" progressTarget="opening" />
      {/* Voile de lisibilité : le titre reste contrasté quelle que soit la position de la structure. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_0%_100%,rgb(5_5_5/0.92)_20%,transparent_70%)]" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-void to-transparent" />

      <div className="shell relative flex h-full flex-col pt-[calc(var(--header-h)+1.5rem)] pb-[max(1.75rem,env(safe-area-inset-bottom))]">
        <div className="hero-fade flex items-start justify-between [--d:200ms]">
          <p className="meta text-mist">
            <span className="text-paper">[ 001 ]</span> Opening
          </p>
          <p className="meta hidden text-right text-mist sm:block">
            Learn — Create — Launch
            <br />
            Académie entrepreneuriale
          </p>
        </div>

        <div className="mt-auto">
          <h1 id="opening-title" lang="en" aria-label="Build your empire." className="font-expanded display-xl">
            {lines.map((line, index) => (
              <span key={line.text} aria-hidden className={`hero-line line-mask ${line.className}`}>
                <span className="line-inner" style={{ "--i": index } as CSSProperties}>
                  {line.text}
                  {line.accent && <span className="text-volt">.</span>}
                </span>
              </span>
            ))}
          </h1>

          <div className="mt-8 grid gap-8 md:mt-10 md:grid-cols-[1fr_auto] md:items-end">
            <p lang="en" className="hero-fade max-w-md text-lg leading-snug text-silver [--d:850ms] md:text-xl">
              {siteConfig.tagline}
            </p>
            <div className="hero-fade flex flex-col gap-3 [--d:1000ms] xs:flex-row">
              <ButtonLink href={routes.academy} size="lg" magnetic transition="portal" transitionLabel="Academy" data-cursor-label="Explore">
                Explore the academy
              </ButtonLink>
              <ButtonLink href={routes.signup} size="lg" variant="outline" magnetic transition="portal" transitionLabel="Build">
                Start building
              </ButtonLink>
            </div>
          </div>

          <div className="hero-fade mt-8 flex items-center gap-4 [--d:1300ms]" aria-hidden>
            <span className="scroll-cue relative block h-10 w-px overflow-hidden bg-steel" />
            <span className="meta text-mist">Scroll</span>
          </div>
        </div>
      </div>
    </section>
  );
}
