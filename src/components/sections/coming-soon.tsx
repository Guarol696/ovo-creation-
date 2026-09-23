import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { routes } from "@/config/site";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageIntro } from "./page-intro";

interface ComingSoonProps {
  eyebrow?: string;
  title: ReactNode;
  description: ReactNode;
}

/** Page provisoire pour les fonctionnalités prévues dans les prochaines étapes. */
export function ComingSoon({ eyebrow = "Bientôt", title, description }: ComingSoonProps) {
  return (
    <>
      <PageIntro eyebrow={eyebrow} title={title} description={description} />
      <Container className="max-w-3xl flex-1 py-16">
        <p className="text-night-700/80">
          Cette page est en cours de construction. Reviens très vite : OVO évolue chaque semaine.
        </p>
        <ButtonLink href={routes.home} variant="outline-dark" className="mt-8">
          <ArrowLeft className="size-4" /> Retour à l&apos;accueil
        </ButtonLink>
      </Container>
    </>
  );
}
