import { AlertTriangle, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { PLANS } from "@/config/premium";
import { routes } from "@/config/site";
import { PlanBadge } from "@/features/premium/components/premium-badge";
import { formatBillingDate } from "@/features/premium/format";
import { statusLabel } from "@/features/premium/plan";
import type { UserEntitlements } from "@/features/premium/server/entitlements";
import { cn } from "@/lib/utils";
import { formatPlanPriceLabel, type PlanPrice } from "../price-check";
import { ManageBillingButton } from "./billing-buttons";

/**
 * « Mon offre » dans le compte : offre, statut, renouvellement, gestion via le
 * portail Stripe. Toutes les données viennent de l'abonnement synchronisé par
 * le webhook Stripe (jamais d'une page de retour de paiement).
 */
export function SubscriptionCard({
  entitlements,
  price,
}: {
  entitlements: UserEntitlements;
  /** Prix de l'offre actuelle, lu chez Stripe. */
  price: PlanPrice | null;
}) {
  const {
    plan,
    subscribedPlan,
    isPaid,
    status,
    paymentIssue,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    hasBillingAccount,
  } = entitlements;
  const current = PLANS[plan];

  const rows: [string, string][] = [["Statut", statusLabel(entitlements)]];
  if (isPaid && price) rows.push(["Prix", formatPlanPriceLabel(price)]);
  if (isPaid && currentPeriodEnd) {
    rows.push([
      cancelAtPeriodEnd ? "Se termine le" : "Renouvellement le",
      formatBillingDate(currentPeriodEnd),
    ]);
  }
  if (!isPaid && subscribedPlan !== "free" && status)
    rows.push(["Dernière offre", PLANS[subscribedPlan].name]);

  return (
    <section
      aria-labelledby="profil-offre"
      className={cn(
        "rounded-4xl p-5 sm:p-7",
        plan === "premium"
          ? "bg-linear-to-br from-gold-400/15 via-night-900 to-night-900 ring-1 ring-gold-400/40"
          : plan === "medium"
            ? "bg-linear-to-br from-sun-500/10 via-night-900 to-night-900 ring-1 ring-sun-400/35"
            : "bg-white/[0.05] ring-1 ring-white/10",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="profil-offre" className="font-display text-xl font-bold">
          Mon offre
        </h2>
        <PlanBadge plan={plan} />
      </div>
      <p className="mt-3 text-sm text-night-100/65">Plan actuel</p>
      <p className="mt-1 text-2xl font-bold" data-testid="current-plan">
        {current.emoji} {current.name}
      </p>

      {paymentIssue && (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-100 ring-1 ring-red-400/30"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Ton dernier paiement a échoué. Stripe va réessayer automatiquement : mets à jour ton moyen de
          paiement pour garder ton offre.
        </p>
      )}
      {!isPaid && status === "unpaid" && (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-100 ring-1 ring-red-400/30"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Ton abonnement {PLANS[subscribedPlan].name} est suspendu : les paiements ont échoué. Règle la
          facture en attente depuis « Gérer mon abonnement » pour le réactiver.
        </p>
      )}

      <dl className="mt-4 grid gap-2 text-sm" data-testid="subscription-details">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-wrap justify-between gap-x-4 gap-y-0.5">
            <dt className="text-night-100/60">{label}</dt>
            <dd className="font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex flex-col gap-3">
        {hasBillingAccount ? (
          <>
            <ManageBillingButton />
            <p className="text-xs text-night-100/55">
              Moyen de paiement, factures, changement d&apos;offre ou annulation : sur la page sécurisée de
              Stripe.
            </p>
          </>
        ) : (
          <p className="text-sm text-night-100/70">Aucun abonnement pour l&apos;instant.</p>
        )}
        {plan !== "premium" && (
          <ButtonLink
            href={routes.premium}
            variant={isPaid ? "ghost-light" : "outline-light"}
            className="w-full"
          >
            <Sparkles className="size-4 text-gold-300" aria-hidden="true" />{" "}
            {isPaid ? "Voir les offres" : "Découvrir les offres"}
          </ButtonLink>
        )}
      </div>
    </section>
  );
}
