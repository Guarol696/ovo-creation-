import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PageIntro } from "@/components/sections/page-intro";
import { ButtonLink } from "@/components/ui/button";
import { routes } from "@/config/site";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="contenu" className="flex flex-1 flex-col bg-night-950">
        <PageIntro
          eyebrow="Erreur 404"
          title="Tu t'es un peu perdu·e en route."
          description="Cette page n'existe pas (ou plus). Pas grave : on te ramène au point de départ."
        >
          <ButtonLink href={routes.home} size="lg">
            Retour à l&apos;accueil
          </ButtonLink>
        </PageIntro>
      </main>
      <SiteFooter />
    </>
  );
}
