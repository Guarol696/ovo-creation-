import type { ReactNode } from "react";

export function SectionTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 max-w-2xl sm:mb-10">
      <p className="text-xs font-bold tracking-[0.2em] text-gold-300 uppercase">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {children && <div className="mt-3 text-night-100/70 sm:text-lg">{children}</div>}
    </div>
  );
}
