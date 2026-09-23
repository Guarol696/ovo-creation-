import { PageIntro } from "@/components/sections/page-intro";
import { ButtonLink } from "@/components/ui/button";
import { routes } from "@/config/site";
import { editTripUrl } from "@/lib/trip/links";
import type { TripRequest } from "@/types/trip";

/** Lien invalide, ou réponses à mettre à jour (ex. dates passées). */
export function InvalidPlan({ request }: { request?: TripRequest }) {
  return (
    <div className="flex-1 bg-night-950">
      <PageIntro
        eyebrow="Oups"
        title={request ? "Ce voyage a besoin d'une petite mise à jour." : "Impossible d'afficher ce voyage."}
        description={
          request
            ? "Certaines réponses ne sont plus valables (par exemple des dates déjà passées). Ajuste-les et OVO te propose un nouveau voyage."
            : "Le lien semble incomplet ou abîmé. Pas grave : recrée ton voyage en deux minutes."
        }
      >
        <ButtonLink href={request ? editTripUrl(request) : routes.createTrip} size="lg">
          {request ? "Mettre à jour mes réponses" : "Créer mon voyage"}
        </ButtonLink>
      </PageIntro>
    </div>
  );
}
