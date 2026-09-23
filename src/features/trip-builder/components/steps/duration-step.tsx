import { durationOptions } from "@/lib/trip/options";
import { ChoiceCard } from "../choice-card";
import type { StepProps } from "../step-props";

export function DurationStep({ draft, update }: StepProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {durationOptions.map((option) => (
        <ChoiceCard
          key={option.id}
          emoji={option.emoji}
          label={option.label}
          description={option.description}
          selected={draft.durationId === option.id}
          onSelect={() => update({ durationId: option.id })}
        />
      ))}
    </div>
  );
}
