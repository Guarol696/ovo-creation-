import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Petite pastille « Démo » pour les données fictives ou indicatives. */
export function DemoBadge({ children = "Démo", className }: { children?: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] font-bold tracking-wider text-white/70 uppercase ring-1 ring-white/15",
        className,
      )}
    >
      {children}
    </span>
  );
}
