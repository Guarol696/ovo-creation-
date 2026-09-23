import { cn } from "@/lib/utils";

/** Badge « ✨ Premium » (discret, doré, lisible sur fond sombre). */
export function PremiumBadge({ className, size = "sm" }: { className?: string; size?: "xs" | "sm" }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full bg-linear-to-r from-gold-300 to-sun-400 font-bold text-night-950",
        size === "xs" ? "px-2 py-0.5 text-[0.65rem]" : "px-2.5 py-1 text-xs",
        className,
      )}
    >
      <span aria-hidden="true">✨</span> Premium
    </span>
  );
}
