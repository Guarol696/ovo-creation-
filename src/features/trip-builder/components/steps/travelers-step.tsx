import { TRAVELERS_LIMITS } from "@/lib/trip/options";
import { cn } from "@/lib/utils";
import { FieldLabel } from "../field";
import type { StepProps } from "../step-props";
import { Stepper } from "../stepper";

const COUNTS = [1, 2, 3, 4, 5, 6] as const;
const GROUP_THRESHOLD = 6;

const countLabels: Record<(typeof COUNTS)[number], { emoji: string; caption: string }> = {
  1: { emoji: "🧍", caption: "personne" },
  2: { emoji: "👫", caption: "personnes" },
  3: { emoji: "🙌", caption: "personnes" },
  4: { emoji: "🚐", caption: "personnes" },
  5: { emoji: "🎉", caption: "personnes" },
  6: { emoji: "🏕️", caption: "ou plus" },
};

export function TravelersStep({ draft, update }: StepProps) {
  const count = draft.travelersCount;

  function setCount(next: number) {
    // Toujours au moins un adulte dans le groupe.
    update({ travelersCount: next, children: Math.min(draft.children, next - 1) });
  }

  return (
    <div className="space-y-6">
      <div>
        <FieldLabel>Nombre de voyageurs</FieldLabel>
        <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {COUNTS.map((n) => {
            const isGroup = n === GROUP_THRESHOLD;
            const selected = isGroup ? count !== null && count >= GROUP_THRESHOLD : count === n;
            return (
              <li key={n}>
                <button
                  type="button"
                  aria-pressed={selected}
                  aria-label={isGroup ? "6 personnes ou plus" : `${n} ${countLabels[n].caption}`}
                  onClick={() => setCount(isGroup ? Math.max(GROUP_THRESHOLD, count ?? 0) : n)}
                  className={cn(
                    "flex min-h-24 w-full flex-col items-center justify-center rounded-3xl ring-1 transition-all duration-200 active:scale-95",
                    selected
                      ? "bg-sun-400/15 ring-2 ring-sun-400"
                      : "bg-white/[0.04] ring-white/10 hover:bg-white/[0.08] hover:ring-white/25",
                  )}
                >
                  <span aria-hidden="true" className="text-xl">
                    {countLabels[n].emoji}
                  </span>
                  <span className="font-display text-2xl leading-tight font-bold">
                    {n}
                    {isGroup && "+"}
                  </span>
                  <span className="text-xs text-night-100/65">{countLabels[n].caption}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {count !== null && (
        <div className="animate-fade-up space-y-3">
          {count >= GROUP_THRESHOLD && (
            <Stepper
              label="Taille du groupe"
              description={`Jusqu'à ${TRAVELERS_LIMITS.max} voyageurs`}
              value={count}
              min={GROUP_THRESHOLD}
              max={TRAVELERS_LIMITS.max}
              onChange={setCount}
            />
          )}
          {count > 1 && (
            <Stepper
              label="Dont enfants"
              description="Moins de 18 ans"
              value={draft.children}
              min={0}
              max={count - 1}
              onChange={(children) => update({ children })}
            />
          )}
          <p className="px-1 text-sm text-night-100/75">
            👤 {count - draft.children} adulte{count - draft.children > 1 ? "s" : ""}
            {draft.children > 0 && ` · ${draft.children} enfant${draft.children > 1 ? "s" : ""}`}
          </p>
        </div>
      )}
    </div>
  );
}
