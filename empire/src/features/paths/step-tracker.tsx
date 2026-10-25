"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, ExternalLink } from "lucide-react";
import { routes } from "@/config/site";
import { cn } from "@/lib/utils";
import type { PathStep } from "@/types/academy";

const key = (path: string) => `empire:path:${path}`;

/**
 * Étapes d'un parcours avec progression visuelle. L'avancement est une
 * aide personnelle, enregistrée sur cet appareil (signalé à l'utilisateur).
 */
export function StepTracker({ path, steps, courseTitles }: { path: string; steps: PathStep[]; courseTitles: Record<string, string> }) {
  const [done, setDone] = useState<number[]>([]);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDone(JSON.parse(window.localStorage.getItem(key(path)) ?? "[]"));
    } catch {
      setDone([]);
    }
  }, [path]);

  const toggle = (index: number) => {
    setDone((current) => {
      const next = current.includes(index) ? current.filter((item) => item !== index) : [...current, index];
      try {
        window.localStorage.setItem(key(path), JSON.stringify(next));
      } catch {
        // Stockage indisponible.
      }
      return next;
    });
  };

  const ratio = steps.length ? done.length / steps.length : 0;

  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <p className="meta text-mist">Avancement (enregistré sur cet appareil)</p>
          <p className="meta text-paper">{done.length} / {steps.length}</p>
        </div>
        <div className="h-1 bg-graphite" role="progressbar" aria-label="Avancement du parcours" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(ratio * 100)}>
          <div className="h-full origin-left bg-volt transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out)]" style={{ transform: `scaleX(${ratio})` }} />
        </div>
      </div>
      <ol className="relative grid gap-0">
        {steps.map((step, index) => {
          const isDone = done.includes(index);
          return (
            <li key={step.title} data-reveal="up" className="relative grid grid-cols-[3rem_1fr] gap-4 pb-10 last:pb-0">
              {index < steps.length - 1 && <span aria-hidden className={cn("absolute top-12 bottom-0 left-6 w-px", isDone ? "bg-volt" : "bg-steel")} />}
              <button
                type="button"
                onClick={() => toggle(index)}
                aria-pressed={isDone}
                aria-label={`${isDone ? "Marquer comme à faire" : "Marquer comme faite"} : ${step.title}`}
                className={cn(
                  "relative z-10 flex size-12 items-center justify-center border font-mono text-sm transition-colors duration-[var(--dur-quick)]",
                  isDone ? "border-volt bg-volt text-void" : "hairline bg-void text-silver hover:border-paper",
                )}
              >
                {isDone ? <Check aria-hidden className="size-4" /> : String(index + 1).padStart(2, "0")}
              </button>
              <div className="grid gap-3 pt-2">
                <h3 className={cn("font-display text-xl font-bold [font-stretch:110%]", isDone && "text-mist line-through decoration-volt")}>{step.title}</h3>
                <p className="max-w-xl text-silver">{step.description}</p>
                <div className="flex flex-wrap gap-2">
                  {step.course && (
                    <Link href={routes.course(step.course)} className="meta inline-flex min-h-11 items-center border hairline px-3 hover:border-paper">
                      Formation : {courseTitles[step.course]}
                    </Link>
                  )}
                  {step.resources.map((resource) => (
                    <a key={resource.href} href={resource.href} target="_blank" rel="noreferrer" className="meta inline-flex min-h-11 items-center gap-2 border hairline px-3 text-silver hover:border-paper hover:text-paper">
                      {resource.label} <ExternalLink aria-hidden className="size-3" />
                      <span className="sr-only">(nouvel onglet)</span>
                    </a>
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
