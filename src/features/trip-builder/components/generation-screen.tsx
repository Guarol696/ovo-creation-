"use client";

import { Check, Plane } from "lucide-react";
import { useEffect, useState, type Ref } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { routes } from "@/config/site";
import { cn } from "@/lib/utils";

const MESSAGES = [
  "Analyse de tes envies",
  "Vérification des dates et du budget",
  "Préparation de ton profil voyageur",
];

interface GenerationScreenProps {
  status: "pending" | "ready";
  onBackToSummary: () => void;
  headingRef: Ref<HTMLHeadingElement>;
}

/** État de transition après « Générer mon voyage ». */
export function GenerationScreen({ status, onBackToSummary, headingRef }: GenerationScreenProps) {
  const [done, setDone] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setDone((n) => Math.min(n + 1, MESSAGES.length)), 700);
    return () => window.clearInterval(timer);
  }, []);

  const ready = status === "ready";

  return (
    <div className="flex animate-fade-up flex-col items-center py-6 text-center sm:py-12">
      <div className="relative grid size-40 place-items-center">
        <div className="absolute inset-0 rounded-full bg-sun-500/20 blur-2xl" />
        <div className="absolute inset-2 rounded-full ring-1 ring-white/10" />
        <div className={cn("absolute inset-2", !ready && "animate-orbit")}>
          <span className="absolute -top-3 left-1/2 grid size-9 -translate-x-1/2 place-items-center rounded-full bg-sun-400 text-night-950 shadow-lg shadow-sun-500/40">
            <Plane className="size-4 rotate-90" />
          </span>
        </div>
        <span aria-hidden="true" className="relative text-6xl">
          {ready ? "✨" : "🌍"}
        </span>
      </div>

      <h1
        ref={headingRef}
        tabIndex={-1}
        aria-live="polite"
        className="mt-8 font-display text-3xl font-extrabold tracking-tight outline-none sm:text-4xl"
      >
        {ready ? "C'est noté, tout est prêt !" : "OVO prépare ton voyage…"}
      </h1>

      <ul className="mt-8 w-full max-w-sm space-y-2.5 text-left">
        {MESSAGES.map((message, index) => {
          const checked = ready || index < done;
          return (
            <li
              key={message}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 ring-1 transition-all duration-500",
                checked ? "bg-white/[0.06] ring-white/15" : "bg-transparent opacity-50 ring-white/5",
              )}
            >
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-full transition-colors",
                  checked ? "bg-sun-400 text-night-950" : "ring-1 ring-white/25",
                )}
              >
                {checked && <Check className="size-3.5 animate-pop" strokeWidth={3} />}
              </span>
              <span className="text-sm">{message}</span>
            </li>
          );
        })}
      </ul>

      {ready && (
        <div className="mt-10 max-w-md animate-fade-up">
          <p className="leading-relaxed text-night-100/80">
            Tes réponses sont validées. La génération complète de ton voyage (destination, transport,
            hébergement, programme) arrive très bientôt sur OVO.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button variant="outline-light" onClick={onBackToSummary}>
              Revoir mes réponses
            </Button>
            <ButtonLink href={routes.home}>Retour à l&apos;accueil</ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}
