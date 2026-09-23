import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "light" | "dark" | "sun" | "gold";

const tones: Record<BadgeTone, string> = {
  light: "border-white/20 bg-white/10 text-white backdrop-blur-md",
  dark: "border-night-950/10 bg-night-950/5 text-night-800",
  sun: "border-sun-500/20 bg-sun-500/10 text-sun-600",
  gold: "border-gold-400/30 bg-gold-400/10 text-gold-300",
};

type BadgeProps = ComponentProps<"span"> & { tone?: BadgeTone };

export function Badge({ tone = "dark", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
