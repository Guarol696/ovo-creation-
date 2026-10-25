import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { planById } from "@/config/plans";
import { routes } from "@/config/site";
import { getCurrentUser, getUserPlan } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Paiement", robots: { index: false } };

/**
 * Retour de Stripe Checkout. Cette page n'accorde AUCUN droit : elle lit
 * l'offre en base, écrite uniquement par le webhook signé. Si le webhook
 * n'est pas encore arrivé, elle l'indique honnêtement.
 */
export default async function BillingSuccessPage() {
  const user = await getCurrentUser();
  const plan = await getUserPlan(user?.id);
  const confirmed = plan !== "free";

  return (
    <section className="shell flex min-h-[80dvh] flex-col justify-center gap-6 pt-[var(--header-h)]">
      <p className="meta text-mist">[ Paiement ]</p>
      <h1 className="font-expanded display-md max-w-3xl">
        {confirmed ? `Bienvenue dans ${planById(plan).name}.` : "Confirmation en cours."}
      </h1>
      <p className="max-w-lg text-silver">
        {confirmed
          ? "Ton abonnement est confirmé par Stripe. Les formations de ton offre sont débloquées."
          : "Nous attendons la confirmation de Stripe. Cela prend généralement quelques secondes : actualise cette page. Aucun accès n'est activé tant que le paiement n'est pas confirmé."}
      </p>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href={confirmed ? routes.academy : routes.billingSuccess}>{confirmed ? "Voir les formations" : "Actualiser"}</ButtonLink>
        <ButtonLink href={routes.dashboard} variant="outline">
          Mon espace
        </ButtonLink>
      </div>
    </section>
  );
}
