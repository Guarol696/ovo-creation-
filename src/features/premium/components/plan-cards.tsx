import { Check, LogIn } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import {
  featuresOf,
  isPaidPlan,
  PLAN_LIMITS,
  PLAN_ORDER,
  PLANS,
  type PaidPlanId,
  type PlanId,
} from "@/config/premium";
import { routes } from "@/config/site";
import { CheckoutButton, ManageBillingButton } from "@/features/billing/components/billing-buttons";
import { formatInterval, formatMoney, type PlanPrice } from "@/features/billing/price-check";
import { authUrl } from "@/lib/auth/redirect";
import { cn } from "@/lib/utils";
import { formatBillingDate } from "../format";
import { PlanBadge } from "./premium-badge";

export interface PlanCardsProps {
  /** Offre effective de l'utilisateur connecté, `null` si visiteur. */
  currentPlan: PlanId | null;
  /** Abonnement Stripe en cours (actif, en essai, paiement en retard…) : changement via le portail. */
  hasOngoingSubscription: boolean;
  /** Paiement configuré côté serveur (clés et Price IDs Stripe). */
  billingReady: boolean;
  /** Prix des offres payantes, lus chez Stripe (source de vérité) ou, à défaut, dans la configuration. */
  prices: Record<PaidPlanId, PlanPrice>;
  /** Annulation déjà programmée chez Stripe, et date de fin de la période payée. */
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
  /** Offre mise en avant (ex. ?offre=premium au retour de la connexion). */
  highlighted?: PlanId | null;
}

const STYLES: Record<PlanId, string> = {
  free: "bg-white/[0.04] ring-1 ring-white/10",
  medium: "bg-linear-to-b from-sun-500/15 via-night-900 to-night-900 ring-1 ring-sun-400/40",
  premium: "bg-linear-to-b from-gold-400/20 via-night-900 to-night-900 ring-1 ring-gold-400/50",
};

function CurrentPlanTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/30">
      <Check className="size-3.5" aria-hidden="true" /> Ton offre actuelle
    </span>
  );
}

/** Cartes Gratuit / Medium / Premium (générées depuis config/premium.ts). */
export function PlanCards({
  currentPlan,
  hasOngoingSubscription,
  billingReady,
  prices,
  cancelAtPeriodEnd = false,
  currentPeriodEnd = null,
  highlighted,
}: PlanCardsProps) {
  const isSubscriber = hasOngoingSubscription && currentPlan !== null && currentPlan !== "free";
  return (
    <div className="grid gap-5 lg:grid-cols-3 lg:items-stretch">
      {PLAN_ORDER.map((plan, index) => {
        const def = PLANS[plan];
        const previous = index > 0 ? PLANS[PLAN_ORDER[index - 1]!] : null;
        const limit = PLAN_LIMITS[plan].savedTrips;
        const isCurrent = currentPlan === plan;
        const price = isPaidPlan(plan) ? prices[plan] : null;
        return (
          <article
            key={plan}
            id={`offre-${plan}`}
            aria-labelledby={`plan-${plan}`}
            className={cn(
              "relative flex scroll-mt-28 flex-col overflow-hidden rounded-4xl p-6 sm:p-8",
              STYLES[plan],
              highlighted === plan && "ring-2 ring-sun-400",
            )}
          >
            {plan === "premium" && (
              <div
                aria-hidden="true"
                className="absolute -top-24 -right-24 size-56 rounded-full bg-gold-400/20 blur-3xl"
              />
            )}
            <div className="relative flex flex-wrap items-center justify-between gap-2">
              <h2 id={`plan-${plan}`} className="font-display text-2xl font-bold">
                {def.emoji} {def.name}
              </h2>
              {isCurrent ? <CurrentPlanTag /> : <PlanBadge plan={plan} />}
            </div>
            <p className="relative mt-2 text-sm text-night-100/80">{def.tagline}</p>
            <p className="relative mt-6">
              <span className="font-display text-5xl font-extrabold" data-testid={`price-${plan}`}>
                {price ? formatMoney(price.unitAmount, price.currency) : "0 €"}
              </span>
              <span className="ml-2 text-sm text-night-100/70">
                {price ? `/ ${formatInterval(price.interval, price.intervalCount)}` : "pour toujours"}
              </span>
            </p>
            {isPaidPlan(plan) && (
              <p className="relative mt-1 text-xs text-night-100/60">
                Sans engagement, résiliable à tout moment.
              </p>
            )}

            <p className="relative mt-6 text-sm font-semibold text-white">
              {previous ? `Tout ${previous.name}, et en plus :` : "Inclus :"}
            </p>
            <ul className="relative mt-3 flex-1 space-y-3">
              {featuresOf(plan).map((f) => (
                <li key={f.id} className="flex items-start gap-3 text-sm">
                  <span
                    className={cn(
                      "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                      plan === "free"
                        ? "bg-white/10"
                        : plan === "medium"
                          ? "bg-sun-400 text-night-950"
                          : "bg-gold-400 text-night-950",
                    )}
                  >
                    <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="font-medium">{f.label}</span>
                    {plan !== "free" && <span className="block text-night-100/65">{f.description}</span>}
                  </span>
                </li>
              ))}
              {limit !== null && (
                <li className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white/10">
                    <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span className="font-medium">Jusqu&apos;à {limit} voyages enregistrés</span>
                </li>
              )}
            </ul>

            <div className="relative mt-8">
              {plan === "free" && isSubscriber ? (
                cancelAtPeriodEnd ? (
                  <p
                    role="status"
                    data-testid="free-return"
                    className="rounded-2xl bg-white/5 px-4 py-3 text-center text-sm text-night-100/75 ring-1 ring-white/10"
                  >
                    Retour à l&apos;offre gratuite prévu
                    {currentPeriodEnd
                      ? ` le ${formatBillingDate(currentPeriodEnd)}`
                      : " à la fin de ta période"}
                    .
                  </p>
                ) : (
                  <>
                    <ManageBillingButton intent="cancel" label="Repasser en gratuit" />
                    <p className="mt-3 text-center text-xs text-night-100/60">
                      Tu gardes ton offre jusqu&apos;à la fin de la période déjà payée.
                    </p>
                  </>
                )
              ) : plan === "free" ? (
                <ButtonLink href={routes.createTrip} size="lg" variant="outline-light" className="w-full">
                  Créer un voyage gratuitement
                </ButtonLink>
              ) : currentPlan === null ? (
                <>
                  <ButtonLink
                    href={authUrl(routes.login, `${routes.premium}?offre=${plan}`)}
                    size="lg"
                    variant={plan === "premium" ? "primary" : "outline-light"}
                    className="w-full"
                  >
                    <LogIn className="size-5" aria-hidden="true" /> Commencer {def.shortName}
                  </ButtonLink>
                  <p className="mt-3 text-center text-xs text-night-100/60">
                    Connecte-toi ou crée un compte gratuit pour continuer.
                  </p>
                </>
              ) : isCurrent ? (
                <ManageBillingButton />
              ) : hasOngoingSubscription ? (
                <ManageBillingButton intent={plan} label={`Passer à ${def.shortName}`} />
              ) : billingReady ? (
                <CheckoutButton plan={plan} variant={plan === "premium" ? "primary" : "outline-light"} />
              ) : (
                <p
                  role="status"
                  className="rounded-2xl bg-white/5 px-4 py-3 text-center text-sm text-night-100/75 ring-1 ring-white/10"
                >
                  Le paiement n&apos;est pas encore activé : réessaie un peu plus tard.
                </p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
