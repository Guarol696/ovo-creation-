import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";

interface PageIntroProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}

/** Bandeau d'en-tête sombre des pages secondaires (cohérent avec le header). */
export function PageIntro({ eyebrow, title, description, children }: PageIntroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-night-950 pt-32 pb-16 text-white sm:pt-40 sm:pb-24">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute -top-40 right-[-10%] size-[30rem] rounded-full bg-sun-500/20 blur-[120px]" />
        <div className="absolute -bottom-40 left-[-10%] size-[26rem] rounded-full bg-night-500/30 blur-[120px]" />
      </div>
      <Container className="max-w-3xl">
        {eyebrow && <Badge tone="light">{eyebrow}</Badge>}
        <h1 className="mt-5 font-display text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 text-lg leading-relaxed text-pretty text-night-100/80">{description}</p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </Container>
    </section>
  );
}
