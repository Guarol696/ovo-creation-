import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { Metadata } from "next";
import { PageIntro } from "@/components/sections/page-intro";
import { ButtonLink } from "@/components/ui/button";
import { PLANS } from "@/config/premium";
import { routes } from "@/config/site";
import { param } from "@/features/auth/page-params";
import { getCurrentUser } from "@/features/auth/server/session";
import { ConfirmationPoller } from "@/features/billing/components/confirmation-poller";
import { getBillingStatus } from "@/features/billing/server/env";
import { getCheckoutOutcome, type CheckoutOutcome } from "@/features/billing/server/sync";
import { formatBillingDate } from "@/features/premium/format";
import { getEntitlements } from "@/features/premium/server/entitlements";
import { authUrl } from "@/lib/auth/redirect";

export const metadata: Metadata = { title: "Paiement reçu", robots: { index: false, follow: false } };

/**
 * Retour de Stripe Checkout. Cette page n'active RIEN : l'offre n'est
 * considérée comme active que lorsque le webhook Stripe l'a confirmée en base.
 * La session Checkout n'est lue que pour adapter le message.
 */
export default async function PaymentSuccessPage({ searchParams }: PageProps<"/payment/success">) {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="flex-1 bg-night-950">
        <PageIntro
          eyebrow="Paiement"
          title="Merci !"
          description="Connecte-toi pour retrouver ton abonnement : il sera visible dans ton compte dès sa confirmation par Stripe."
        >
          <ButtonLink href={authUrl(routes.login, routes.account)} size="lg">
            Se connecter
          </ButtonLink>
        </PageIntro>
      </div>
    );
  }

  const sessionId = param((await searchParams).session_id);
  const [entitlements, outcome] = await Promise.all([
    getEntitlements(),
    sessionId && getBillingStatus().checkoutReady
      ? getCheckoutOutcome(sessionId, user.id)
      : Promise.resolve<CheckoutOutcome>("unknown"),
  ]);
  const confirmed = entitlements.isPaid;
  const plan = PLANS[entitlements.plan];

  if (!confirmed && outcome === "not_completed") {
    return (
      <div className="flex-1 bg-night-950 text-white">
        <PageIntro
          eyebrow="Paiement"
          title="Paiement non finalisé"
          description="Stripe n'a pas finalisé ce paiement : aucun abonnement n'a été activé et rien n'a été débité."
        >
          <div className="rounded-4xl bg-white/[0.05] p-6 text-center ring-1 ring-white/10">
            <XCircle className="mx-auto size-10 text-night-100/60" aria-hidden="true" />
            <p className="mt-3 font-semibold" data-testid="payment-state">
              Aucun paiement confirmé
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href={routes.premium} size="lg">
                Voir les offres
              </ButtonLink>
              <ButtonLink href={routes.myTrips} size="lg" variant="ghost-light">
                Mes voyages
              </ButtonLink>
            </div>
          </div>
        </PageIntro>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-night-950 text-white">
      <PageIntro
        eyebrow="Paiement"
        title={confirmed ? `Bienvenue dans ${plan.name} ${plan.emoji}` : "Paiement reçu 🎉"}
        description={
          confirmed
            ? `Ton abonnement est confirmé par Stripe${entitlements.currentPeriodEnd ? ` et actif jusqu'au ${formatBillingDate(entitlements.currentPeriodEnd)}, renouvelé automatiquement` : ""}. Toutes tes nouvelles fonctionnalités sont disponibles.`
            : outcome === "processing"
              ? "Nous confirmons ton abonnement… Ta banque traite encore le paiement : ton compte sera mis à jour dès que Stripe l'aura confirmé."
              : "Nous confirmons ton abonnement… Ton compte est mis à jour automatiquement dès que Stripe a confirmé le paiement. Tu peux rester sur cette page."
        }
      >
        <div className="rounded-4xl bg-white/[0.05] p-6 text-center ring-1 ring-white/10">
          {confirmed ? (
            <CheckCircle2 className="mx-auto size-10 text-emerald-400" aria-hidden="true" />
          ) : (
            <Clock className="mx-auto size-10 text-gold-300" aria-hidden="true" />
          )}
          <p className="mt-3 font-semibold" data-testid="payment-state">
            {confirmed ? "Abonnement confirmé ✓" : "Confirmation en cours"}
          </p>
          <ConfirmationPoller confirmed={confirmed} />
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href={routes.account} size="lg" variant={confirmed ? "primary" : "outline-light"}>
              Voir mon abonnement
            </ButtonLink>
            <ButtonLink href={routes.myTrips} size="lg" variant="ghost-light">
              Mes voyages
            </ButtonLink>
          </div>
        </div>
      </PageIntro>
    </div>
  );
}
