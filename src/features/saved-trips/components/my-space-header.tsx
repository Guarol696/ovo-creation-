import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";

/** En-tête des pages de l'espace personnel (Mes voyages, Mon profil). */
export function MySpaceHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden pt-28 pb-10 sm:pt-36 sm:pb-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-32 size-[28rem] rounded-full bg-sun-500/15 blur-3xl" />
      </div>
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="animate-fade-up">
          <p className="text-xs font-bold tracking-[0.18em] text-gold-300 uppercase">{eyebrow}</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
          {description && <p className="mt-3 max-w-xl text-night-100/75">{description}</p>}
        </div>
        {action && <div className="animate-fade-up [animation-delay:80ms]">{action}</div>}
      </Container>
    </section>
  );
}
