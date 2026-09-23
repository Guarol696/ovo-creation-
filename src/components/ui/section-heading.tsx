import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark",
  className,
}: SectionHeadingProps) {
  const isLight = tone === "light";
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p
          className={cn(
            "mb-4 text-xs font-bold tracking-[0.2em] uppercase",
            isLight ? "text-gold-300" : "text-sun-600",
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "font-display text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl",
          isLight ? "text-white" : "text-night-950",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-5 text-base leading-relaxed text-pretty sm:text-lg",
            isLight ? "text-night-100/80" : "text-night-700/80",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
