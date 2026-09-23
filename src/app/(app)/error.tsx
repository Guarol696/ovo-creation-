"use client";

import { RotateCcw } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { PageIntro } from "@/components/sections/page-intro";
import { routes } from "@/config/site";

/** Erreur inattendue (service indisponible…) : message clair, jamais de détail technique. */
export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex-1 bg-night-950">
      <PageIntro
        eyebrow="Oups"
        title="Un petit souci de notre côté."
        description="Cette page n'a pas pu s'afficher. Vérifie ta connexion internet, puis réessaie."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={reset}>
            <RotateCcw className="size-4" /> Réessayer
          </Button>
          <ButtonLink href={routes.home} size="lg" variant="outline-light">
            Retour à l&apos;accueil
          </ButtonLink>
        </div>
      </PageIntro>
    </div>
  );
}
