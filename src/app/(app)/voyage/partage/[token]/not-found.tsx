import { PageIntro } from "@/components/sections/page-intro";
import { ButtonLink } from "@/components/ui/button";
import { routes } from "@/config/site";

/** Lien de partage désactivé, supprimé ou incorrect. */
export default function SharedTripNotFound() {
  return (
    <div className="flex-1 bg-night-950">
      <PageIntro
        eyebrow="Voyage partagé"
        title="Ce voyage n'est plus partagé."
        description="Le lien a peut-être été désactivé par la personne qui l'avait partagé, ou il est incomplet. Pas grave : imagine ton propre voyage en deux minutes."
      >
        <ButtonLink href={routes.createTrip} size="lg">
          Créer mon voyage
        </ButtonLink>
      </PageIntro>
    </div>
  );
}
