"use client";

import { useId } from "react";
import { WISHES_MAX_LENGTH } from "@/lib/trip/options";
import { cn } from "@/lib/utils";
import { FieldLabel, inputClassName } from "../field";
import type { StepProps } from "../step-props";

const IDEAS = [
  "Plage accessible à pied",
  "Pas de vol de nuit",
  "Options végétariennes",
  "Logement avec piscine",
  "Faire la fête entre amis",
  "Un spot pour le coucher de soleil",
];

export function WishesStep({ draft, update }: StepProps) {
  const id = useId();
  const length = draft.wishes.length;

  function addIdea(idea: string) {
    const current = draft.wishes.trim();
    const next = current ? `${current.replace(/[.,;]$/, "")}, ${idea.toLowerCase()}` : idea;
    update({ wishes: next.slice(0, WISHES_MAX_LENGTH) });
  }

  return (
    <div className="space-y-5">
      <div>
        <FieldLabel htmlFor={id}>Dis-nous tout</FieldLabel>
        <textarea
          id={id}
          rows={5}
          maxLength={WISHES_MAX_LENGTH}
          value={draft.wishes}
          onChange={(e) => update({ wishes: e.target.value })}
          placeholder="Je veux partir avec mes amis, faire la fête et avoir une plage accessible à pied."
          className={cn(inputClassName, "min-h-36 resize-none py-3.5 leading-relaxed")}
        />
        <p
          className={cn(
            "mt-2 text-right text-xs tabular-nums",
            length > WISHES_MAX_LENGTH * 0.9 ? "text-sun-400" : "text-night-100/60",
          )}
        >
          {length} / {WISHES_MAX_LENGTH}
        </p>
      </div>

      <div>
        <FieldLabel>Besoin d&apos;inspiration ?</FieldLabel>
        <ul className="flex flex-wrap gap-2">
          {IDEAS.map((idea) => (
            <li key={idea}>
              <button
                type="button"
                onClick={() => addIdea(idea)}
                className="min-h-10 rounded-full bg-white/[0.06] px-3.5 text-sm text-white/85 ring-1 ring-white/10 transition hover:bg-white/[0.12] active:scale-95"
              >
                + {idea}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
