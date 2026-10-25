import type { ReactNode } from "react";
import { Notice } from "@/components/ui/notice";

/** Gabarit des pages juridiques : texte lisible, modèle à faire valider signalé. */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <article className="shell grid gap-10 pt-[calc(var(--header-h)+3rem)] pb-24 lg:grid-cols-12">
      <header className="min-w-0 lg:col-span-4">
        <p className="meta text-mist">Légal</p>
        <h1 className="font-expanded mt-4 text-[clamp(1.6rem,4.5vw,3.5rem)]">{title}</h1>
        <p className="meta mt-4 text-mist">Mise à jour : {updated}</p>
      </header>
      <div className="lg:col-span-7 lg:col-start-6">
        <Notice tone="demo" title="Modèle à compléter">
          Ce texte est un modèle de départ. Il doit être complété (identité de l&apos;éditeur, hébergeur, contact) et validé par un
          professionnel avant toute mise en production.
        </Notice>
        <div className="prose-empire mt-8">{children}</div>
      </div>
    </article>
  );
}
