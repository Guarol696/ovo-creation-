import type { Metadata } from "next";
import { PageIntro } from "@/components/sections/page-intro";
import { ButtonLink } from "@/components/ui/button";
import { PAID_PLANS, type PaidPlanId } from "@/config/premium";
import { routes } from "@/config/site";
import { param } from "@/features/auth/page-params";

export const metadata: Metadata = { title: "Paiement annulé", robots: { index: false, follow: false } };

/** Retour de Stripe Checkout sans paiement (bouton retour, fenêtre fermée, annulation). */
export default async function PaymentCancelPage({ searchParams }: PageProps<"/payment/cancel">) {
  const offer = param((await searchParams).offre);
  const plan = PAID_PLANS.includes(offer as PaidPlanId) ? offer : null;
  return (
    <div className="flex-1 bg-night-950">
      <PageIntro
        eyebrow="Paiement annulé"
        title="Pas de souci, rien n'a été débité."
        description="Tu as quitté la page de paiement avant la fin : aucun abonnement n'a été créé. Tu peux revenir aux offres quand tu veux, OVO Gratuit reste à ta disposition."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink
            href={plan ? `${routes.premium}?offre=${plan}#offre-${plan}` : routes.premium}
            size="lg"
          >
            Revoir les offres
          </ButtonLink>
          <ButtonLink href={routes.createTrip} size="lg" variant="outline-light">
            Créer un voyage
          </ButtonLink>
        </div>
      </PageIntro>
    </div>
  );
}
