"use client";

import { cn } from "@/lib/utils";

export interface FilterOption<T extends string> {
  id: T;
  label: string;
  count: number;
}

interface FilterChipsProps<T extends string> {
  label: string;
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Filtres en pastilles, défilables horizontalement sur mobile. */
export function FilterChips<T extends string>({ label, options, value, onChange }: FilterChipsProps<T>) {
  return (
    <div className="-mx-5 scrollbar-none overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <div role="group" aria-label={label} className="flex w-max gap-2 pb-1 sm:w-auto sm:flex-wrap">
        {options.map((option) => {
          const active = option.id === value;
          const empty = option.count === 0;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              disabled={empty}
              onClick={() => onChange(option.id)}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap ring-1 transition-all duration-200 active:scale-95",
                active
                  ? "bg-white text-night-950 ring-white"
                  : "bg-white/[0.05] text-white/80 ring-white/15 hover:bg-white/10 hover:text-white",
                empty && "cursor-not-allowed opacity-35",
              )}
            >
              {option.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs tabular-nums",
                  active ? "bg-night-950/10 text-night-950/70" : "bg-white/10 text-white/60",
                )}
              >
                {option.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
