import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChoiceCardProps {
  selected: boolean;
  onSelect: () => void;
  label: ReactNode;
  emoji?: string;
  description?: ReactNode;
  /** « card » : grande carte ; « chip » : pastille compacte. */
  variant?: "card" | "chip";
  className?: string;
}

/** Bouton de choix (simple ou multiple), optimisé pour le tactile. */
export function ChoiceCard({
  selected,
  onSelect,
  label,
  emoji,
  description,
  variant = "card",
  className,
}: ChoiceCardProps) {
  const isChip = variant === "chip";

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "group relative flex w-full items-center text-left transition-all duration-200 ease-out active:scale-[0.98]",
        "ring-1 backdrop-blur-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun-400",
        isChip ? "min-h-13 gap-2.5 rounded-2xl px-4 py-3" : "min-h-18 gap-4 rounded-3xl p-4 sm:p-5",
        selected
          ? "bg-sun-400/15 shadow-lg ring-2 shadow-sun-500/10 ring-sun-400"
          : "bg-white/[0.04] ring-white/10 hover:bg-white/[0.08] hover:ring-white/25",
        className,
      )}
    >
      {emoji && (
        <span
          aria-hidden="true"
          className={cn(
            "grid shrink-0 place-items-center transition-transform duration-300 group-hover:scale-110",
            isChip ? "text-xl" : "size-12 rounded-2xl bg-white/[0.06] text-2xl",
          )}
        >
          {emoji}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className={cn("block font-semibold text-white", isChip ? "text-sm" : "text-base")}>
          {label}
        </span>
        {description && <span className="mt-0.5 block text-sm text-night-100/65">{description}</span>}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-full transition-all duration-200",
          selected ? "bg-sun-400 text-night-950" : "ring-1 ring-white/20",
          isChip && !selected && "hidden",
        )}
      >
        {selected && <Check className="size-3.5 animate-pop" strokeWidth={3} />}
      </span>
    </button>
  );
}
