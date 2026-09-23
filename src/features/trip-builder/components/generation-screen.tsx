"use client";

import { Check, Plane } from "lucide-react";
import { useEffect, useState, type Ref } from "react";
import { cn } from "@/lib/utils";

export const GENERATION_STEPS = [
  { emoji: "🔎", label: "Analyse de tes envies" },
  { emoji: "💰", label: "Vérification de ton budget" },
  { emoji: "🌍", label: "Recherche de la destination idéale" },
  { emoji: "✨", label: "Création de ton programme" },
] as const;

/** Délai entre deux étapes visuelles (court : on n'allonge pas l'attente). */
export const GENERATION_STEP_MS = 380;

interface GenerationScreenProps {
  headingRef?: Ref<HTMLHeadingElement>;
}

/** Transition « OVO prépare ton voyage… » pendant la génération. */
export function GenerationScreen({ headingRef }: GenerationScreenProps) {
  const [done, setDone] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setDone((n) => Math.min(n + 1, GENERATION_STEPS.length)),
      GENERATION_STEP_MS,
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div role="status" className="flex animate-fade-up flex-col items-center py-6 text-center sm:py-12">
      <div className="relative grid size-40 place-items-center">
        <div className="absolute inset-0 rounded-full bg-sun-500/20 blur-2xl" />
        <div className="absolute inset-2 rounded-full ring-1 ring-white/10" />
        <div className="absolute inset-2 animate-orbit">
          <span className="absolute -top-3 left-1/2 grid size-9 -translate-x-1/2 place-items-center rounded-full bg-sun-400 text-night-950 shadow-lg shadow-sun-500/40">
            <Plane className="size-4 rotate-90" />
          </span>
        </div>
        <span aria-hidden="true" className="relative text-6xl">
          🌍
        </span>
      </div>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-8 font-display text-3xl font-extrabold tracking-tight outline-none sm:text-4xl"
      >
        OVO prépare ton voyage…
      </h1>

      <ul className="mt-8 w-full max-w-sm space-y-2.5 text-left">
        {GENERATION_STEPS.map((step, index) => {
          const checked = index < done;
          const active = index === done;
          return (
            <li
              key={step.label}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 ring-1 transition-all duration-300",
                checked && "bg-white/[0.06] ring-white/15",
                active && "bg-sun-400/10 ring-sun-400/40",
                !checked && !active && "opacity-50 ring-white/5",
              )}
            >
              <span aria-hidden="true" className="text-lg">
                {step.emoji}
              </span>
              <span className="flex-1 text-sm">{step.label}</span>
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-full transition-colors",
                  checked ? "bg-sun-400 text-night-950" : "ring-1 ring-white/25",
                )}
              >
                {checked && <Check className="size-3.5 animate-pop" strokeWidth={3} />}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
