import { Minus, Plus } from "lucide-react";

interface StepperProps {
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

/** Compteur − / + avec de grandes zones tactiles. */
export function Stepper({ label, description, value, min, max, onChange }: StepperProps) {
  const buttonClass =
    "grid size-11 place-items-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 active:scale-90 disabled:pointer-events-none disabled:opacity-30";

  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl bg-white/[0.04] p-4 ring-1 ring-white/10 sm:p-5">
      <div>
        <p className="font-semibold text-white">{label}</p>
        {description && <p className="text-sm text-night-100/65">{description}</p>}
      </div>
      <div className="flex items-center gap-3" role="group" aria-label={label}>
        <button
          type="button"
          className={buttonClass}
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          aria-label={`Retirer (${label})`}
        >
          <Minus className="size-4" />
        </button>
        <output aria-live="polite" className="w-8 text-center font-display text-2xl font-bold tabular-nums">
          {value}
        </output>
        <button
          type="button"
          className={buttonClass}
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
          aria-label={`Ajouter (${label})`}
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}
