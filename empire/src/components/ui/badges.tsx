import { cn } from "@/lib/utils";

/** Étiquette « démo » : signale tout contenu ou toute donnée qui n'est pas réel. */
export function DemoBadge({ children = "Démo", className }: { children?: string; className?: string }) {
  return (
    <span
      className={cn(
        "meta inline-flex items-center gap-1.5 border border-volt/40 px-2 py-1 text-volt",
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-volt" />
      {children}
    </span>
  );
}

export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("meta inline-flex items-center border hairline px-2 py-1 text-silver", className)}>{children}</span>;
}

/** Index monospace d'une section : « [ 03 ] THE ACADEMY ». */
export function SectionIndex({ index, label, className }: { index: string; label: string; className?: string }) {
  return (
    <p className={cn("meta flex items-center gap-3 text-mist", className)}>
      <span className="text-paper">[ {index} ]</span>
      <span aria-hidden className="h-px w-8 bg-steel" />
      <span>{label}</span>
    </p>
  );
}
