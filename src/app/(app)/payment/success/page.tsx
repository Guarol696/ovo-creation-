import { CheckCircle2, Clock } from "lucide-react";
import type { Metadata } from "next";
import { PageIntro } from "@/components/sections/page-intro";
import { ButtonLink } from "@/components/ui/button";
import { PLANS } from "@/config/premium";
import { routes } from "@/config/site";
import { getCurrentUser } from "@/features/auth/server/session";
import { ConfirmationPoller } from "@/features/billing/components/confirmation-poller";
import { formatBillingDate } from "@/features/premium/format";
import { getEntitlements } from "@/features/premium/server/entitlements";
import { authUrl } from "@/lib/auth/redirect";

export const metadata: Metadata = { title: "Paiement reçu", robots: { index: false, follow: false } };

/**
 * Retour de Stripe Checkout. Cette page n'active RIEN : l'abonnement n'est
 * considéré comme actif que lorsque le webhook Stripe l'a confirmé en base.
 */
export default async function PaymentSuccessPage() {
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

  const entitlements = await getEntitlements();
  const confirmed = entitlements.isPaid;
  const plan = PLANS[entitlements.plan];

  return (
    <div className="flex-1 bg-night-950 text-white">
      <PageIntro
        eyebrow="Paiement"
        title={
          confirmed
            ? `Bienvenue dans ${plan.name} ${plan.emoji}`
            : "Paiement reçu, on finalise ton abonnement"
        }
        description={
          confirmed
            ? `Ton abonnement est actif${entitlements.currentPeriodEnd ? ` jusqu'au ${formatBillingDate(entitlements.currentPeriodEnd)}, renouvelé automatiquement` : ""}. Toutes tes nouvelles fonctionnalités sont disponibles.`
            : "Stripe confirme ton paiement : ton compte est mis à jour automatiquement dans quelques secondes. Tu peux rester sur cette page."
        }
      >
        <div className="rounded-4xl bg-white/[0.05] p-6 text-center ring-1 ring-white/10">
          {confirmed ? (
            <CheckCircle2 className="mx-auto size-10 text-emerald-400" aria-hidden="true" />
          ) : (
            <Clock className="mx-auto size-10 text-gold-300" aria-hidden="true" />
          )}
          <p className="mt-3 font-semibold" data-testid="payment-state">
            {confirmed ? "Abonnement confirmé ✓" : "Confirmation en attente"}
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
