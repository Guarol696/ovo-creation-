import type { ReactNode } from "react";

/** Titre de sous-section à l'intérieur d'une étape. */
export function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  const className = "mb-3 block text-xs font-bold tracking-[0.18em] text-gold-300 uppercase";
  return htmlFor ? (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ) : (
    <p className={className}>{children}</p>
  );
}

export const inputClassName =
  "min-h-13 w-full rounded-2xl bg-white/[0.06] px-4 text-base text-white ring-1 ring-white/15 transition placeholder:text-white/35 [color-scheme:dark] focus:bg-white/[0.09] focus:ring-2 focus:ring-sun-400 focus:outline-none";
