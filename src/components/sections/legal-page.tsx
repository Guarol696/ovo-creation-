import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { legal } from "@/config/legal";
import { PageIntro } from "./page-intro";

const updatedFormatter = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

/** Page légale : bandeau d'en-tête + texte lisible (sections numérotées par leur titre). */
export function LegalPage({
  eyebrow = "Légal",
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <PageIntro eyebrow={eyebrow} title={title} description={description} />
      <Container className="max-w-3xl flex-1 py-12 sm:py-16">
        <p className="text-sm text-night-700/70">
          Dernière mise à jour : {updatedFormatter.format(new Date(legal.lastUpdated))}
        </p>
        <div className="mt-8 space-y-10 text-night-900">{children}</div>
      </Container>
    </>
  );
}

export function LegalSection({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="font-display text-2xl font-bold text-night-950">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-night-800 [&_a]:font-semibold [&_a]:text-sun-600 [&_a]:underline [&_a]:underline-offset-2 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}

/** Valeur légale, ou « à compléter » bien visible tant qu'elle n'est pas renseignée. */
export function Fill({ value, label }: { value: string; label: string }) {
  if (value.trim()) return <>{value}</>;
  return (
    <mark className="rounded bg-amber-200/70 px-1.5 py-0.5 text-sm font-semibold text-amber-950">
      [{label} — à compléter]
    </mark>
  );
}

/** Lien email de contact (ou « à compléter »). */
export function ContactEmail() {
  return legal.email.trim() ? (
    <a href={`mailto:${legal.email}`}>{legal.email}</a>
  ) : (
    <Fill value="" label="email de contact" />
  );
}
