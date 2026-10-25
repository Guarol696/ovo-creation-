import type { ReactNode } from "react";
import { RevealLines } from "@/components/motion/reveal-text";
import { cn } from "@/lib/utils";

/** En-tête éditorial des pages intérieures : index monospace, titre en lignes masquées, chapeau. */
export function PageHero({
  index,
  label,
  lines,
  title,
  lang,
  intro,
  aside,
  className,
}: {
  index: string;
  label: string;
  lines: ReactNode[];
  title: string;
  lang?: string;
  intro?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("shell pt-[calc(var(--header-h)+3rem)] pb-12 md:pt-[calc(var(--header-h)+5rem)] md:pb-20", className)}>
      <p className="meta flex items-center gap-3 text-mist">
        <span className="text-paper">[ {index} ]</span>
        <span aria-hidden className="h-px w-8 bg-steel" />
        {label}
      </p>
      <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
        <RevealLines as="h1" lang={lang} label={title} className="font-expanded display-lg lg:col-span-8" lines={lines} />
        {(intro || aside) && (
          <div data-reveal="up" className="grid gap-4 text-silver lg:col-span-4">
            {intro && <div className="max-w-md">{intro}</div>}
            {aside}
          </div>
        )}
      </div>
    </section>
  );
}
