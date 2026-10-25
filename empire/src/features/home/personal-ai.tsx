"use client";

import { useEffect, useRef, useState } from "react";
import { RevealLines } from "@/components/motion/reveal-text";
import { ButtonLink } from "@/components/ui/button";
import { DemoBadge, SectionIndex } from "@/components/ui/badges";
import { routes } from "@/config/site";
import { cn } from "@/lib/utils";

const script = [
  { from: "user", text: "I want to build my first online business." },
  { from: "assistant", text: "Let's start with your idea, your skills and the problem you want to solve." },
] as const;

const workflow = [
  { step: "Idée", detail: "Formuler le problème et la personne concernée" },
  { step: "Compétences", detail: "Lister ce que tu sais déjà faire, et ce qui manque" },
  { step: "Validation", detail: "Cinq entretiens avant de construire" },
  { step: "Plan", detail: "Un parcours et des formations adaptés" },
];

/**
 * Scène 6 — Personal AI. La conversation affichée est un SCÉNARIO ÉCRIT,
 * présenté comme tel : aucune IA ne répond ici. La vraie intégration
 * (serveur, clé protégée) vit sur /assistant quand elle est configurée.
 */
export function PersonalAI({ assistantEnabled }: { assistantEnabled: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const timers: number[] = [];
    const reduced = document.documentElement.dataset.motion === "reduced";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        if (reduced) {
          setStage(4);
          return;
        }
        // 1: message utilisateur · 2: indicateur de saisie · 3: réponse · 4: parcours.
        [500, 1300, 2600, 3400].forEach((delay, index) => timers.push(window.setTimeout(() => setStage(index + 1), delay)));
      },
      { threshold: 0.4 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [run]);

  const replay = () => {
    setStage(0);
    setRun((value) => value + 1);
  };

  return (
    <section aria-labelledby="ai-title" className="relative overflow-hidden border-t hairline py-24 md:py-40">
      <div className="shell grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <SectionIndex index="006" label="Personal AI" />
          <RevealLines
            id="ai-title"
            lang="en"
            className="font-expanded mt-8 text-[clamp(2.4rem,6.4vw,6rem)]"
            lines={["Personal", <span key="ai" className="text-volt">AI.</span>]}
            label="Personal AI."
          />
          <p data-reveal="up" className="mt-8 max-w-md text-silver">
            Un assistant pour t&apos;aider à apprendre et à construire : clarifier une idée, proposer un parcours,
            structurer les fonctionnalités d&apos;un site, préparer un plan de travail.
          </p>
          <div data-reveal="up" className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href={routes.assistant} variant={assistantEnabled ? "primary" : "outline"} transition="portal" transitionLabel="Assistant">
              {assistantEnabled ? "Essayer l'assistant" : "Découvrir l'assistant"}
            </ButtonLink>
          </div>
        </div>

        <div ref={ref} className="lg:col-span-6 lg:col-start-7 lg:mt-24">
          <div className="border hairline bg-abyss">
            <div className="flex items-center justify-between gap-3 border-b hairline px-4 py-3">
              <p className="meta text-mist">Session — prévisualisation</p>
              <DemoBadge>Scénario écrit · aucune IA connectée</DemoBadge>
            </div>
            <div className="grid min-h-[22rem] content-start gap-4 p-4 md:p-6" aria-live="polite">
              {stage >= 1 && (
                <p lang="en" className="max-w-[85%] animate-[fade-up_500ms_var(--ease-out)_both] justify-self-end bg-paper px-4 py-3 text-void">
                  {script[0].text}
                </p>
              )}
              {stage === 2 && (
                <p className="flex items-center gap-1.5 px-1 py-3" aria-label="L'assistant écrit">
                  {[0, 1, 2].map((dot) => (
                    <span key={dot} className="size-1.5 rounded-full bg-silver" style={{ animation: `pulse-dot 900ms ${dot * 150}ms infinite` }} />
                  ))}
                </p>
              )}
              {stage >= 3 && (
                <div className="max-w-[90%] animate-[fade-up_500ms_var(--ease-out)_both] border-l-2 border-volt pl-4">
                  <p className="meta mb-2 text-mist">Assistant</p>
                  <p lang="en" className="text-lg leading-snug">
                    {script[1].text}
                  </p>
                </div>
              )}
              {stage >= 4 && (
                <ol className="mt-2 grid gap-2 sm:grid-cols-2">
                  {workflow.map((item, index) => (
                    <li
                      key={item.step}
                      className="animate-[fade-up_500ms_var(--ease-out)_both] border hairline p-3"
                      style={{ animationDelay: `${index * 120}ms` }}
                    >
                      <p className="meta text-volt">
                        {String(index + 1).padStart(2, "0")} — {item.step}
                      </p>
                      <p className="mt-1 text-sm text-silver">{item.detail}</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 border-t hairline px-4 py-2">
              <p className="text-xs text-mist">
                {assistantEnabled
                  ? "L'assistant réel est disponible sur sa page dédiée."
                  : "Démonstration visuelle. L'assistant réel s'active avec une clé d'API côté serveur."}
              </p>
              <button
                type="button"
                onClick={replay}
                className={cn("meta min-h-11 shrink-0 px-2 text-silver hover:text-paper", stage < 4 && "invisible")}
              >
                Rejouer
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
