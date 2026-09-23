import type { ChoiceOption } from "@/lib/trip/options";
import { cn } from "@/lib/utils";
import type { MultiChoiceField } from "../../types";
import { ChoiceCard } from "../choice-card";
import type { StepProps } from "../step-props";

interface MultiChoiceStepProps<T extends string> extends StepProps {
  field: MultiChoiceField;
  options: ChoiceOption<T>[];
  variant?: "card" | "chip";
  columns?: string;
}

/** Étape générique à choix multiples (styles, ambiances, priorités). */
export function MultiChoiceStep<T extends string>({
  draft,
  toggle,
  field,
  options,
  variant = "chip",
  columns = "grid-cols-2 sm:grid-cols-3",
}: MultiChoiceStepProps<T>) {
  const selected = draft[field] as string[];

  return (
    <div>
      <ul className={cn("grid gap-2.5", columns)}>
        {options.map((option) => (
          <li key={option.id}>
            <ChoiceCard
              variant={variant}
              emoji={option.emoji}
              label={option.label}
              description={option.description}
              selected={selected.includes(option.id)}
              onSelect={() => toggle(field, option.id)}
              className="h-full"
            />
          </li>
        ))}
      </ul>
      <p aria-live="polite" className="mt-4 text-sm text-night-100/70">
        {selected.length === 0
          ? "Aucune sélection pour l'instant."
          : `${selected.length} sélectionné${selected.length > 1 ? "s" : ""}`}
      </p>
    </div>
  );
}
