import { Check, Clock } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { featuresOf, PLAN_LIMITS, PLANS, PREMIUM_PRICING, type PlanId } from "@/config/premium";
import { routes } from "@/config/site";
import { cn } from "@/lib/utils";
import { formatPlanPrice, yearlySavingPercent } from "../format";
import { PremiumBadge } from "./premium-badge";
import { ManageSubscriptionButton, UpgradeButton } from "./premium-placeholders";

interface PlanCardsProps {
  /** Plan de l'utilisateur connecté, `null` si visiteur. */
  currentPlan: PlanId | null;
}

function CurrentPlanTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/30">
      <Check className="size-3.5" aria-hidden="true" /> Ton offre actuelle
    </span>
  );
}

/** Cartes comparatives Gratuit / Premium (générées depuis config/premium.ts). */
export function PlanCards({ currentPlan }: PlanCardsProps) {
  const free = featuresOf("free");
  const premium = featuresOf("premium");

  return (
    <div className="grid gap-5 md:grid-cols-2 md:items-stretch">
      <article
        aria-labelledby="plan-free"
        className="flex flex-col rounded-4xl bg-white/[0.04] p-6 ring-1 ring-white/10 sm:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="plan-free" className="font-display text-2xl font-bold">
            {PLANS.free.emoji} {PLANS.free.name}
          </h2>
          {currentPlan === "free" && <CurrentPlanTag />}
        </div>
        <p className="mt-2 text-sm text-night-100/75">{PLANS.free.tagline}</p>
        <p className="mt-6">
          <span className="font-display text-5xl font-extrabold">0 €</span>
          <span className="ml-2 text-sm text-night-100/70">pour toujours</span>
        </p>
        <ul className="mt-6 flex-1 space-y-3">
          {free.map((f) => (
            <li key={f.id} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white/10">
                <Check className="size-3" strokeWidth={3} aria-hidden="true" />
              </span>
              <span>
                {f.label}
                {f.id === "saved_trips" && PLAN_LIMITS.free.savedTrips !== null && (
                  <span className="text-night-100/60"> (jusqu&apos;à {PLAN_LIMITS.free.savedTrips})</span>
                )}
              </span>
            </li>
          ))}
        </ul>
        <ButtonLink href={routes.createTrip} size="lg" variant="outline-light" className="mt-8 w-full">
          Créer un voyage gratuitement
        </ButtonLink>
      </article>

      <article
        aria-labelledby="plan-premium"
        className="relative flex flex-col overflow-hidden rounded-4xl bg-linear-to-b from-gold-400/20 via-night-900 to-night-900 p-6 ring-1 ring-gold-400/50 sm:p-8"
      >
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 size-56 rounded-full bg-gold-400/20 blur-3xl"
        />
        <div className="relative flex flex-wrap items-center justify-between gap-2">
          <h2 id="plan-premium" className="font-display text-2xl font-bold">
            {PLANS.premium.emoji} {PLANS.premium.name}
          </h2>
          {currentPlan === "premium" ? <CurrentPlanTag /> : <PremiumBadge />}
        </div>
        <p className="relative mt-2 text-sm text-night-100/80">{PLANS.premium.tagline}</p>
        <p className="relative mt-6">
          <span className="font-display text-5xl font-extrabold">
            {formatPlanPrice(PREMIUM_PRICING.monthly)}
          </span>
          <span className="ml-2 text-sm text-night-100/70">/ mois</span>
        </p>
        <p className="relative mt-1 text-sm text-night-100/75">
          ou {formatPlanPrice(PREMIUM_PRICING.yearly)} / an (−{yearlySavingPercent()} %) · prix indicatif
        </p>
        <p className="relative mt-5 text-sm font-semibold text-white">Tout OVO Gratuit, et en plus :</p>
        <ul className="relative mt-3 flex-1 space-y-3">
          {premium.map((f) => (
            <li key={f.id} className="flex items-start gap-3 text-sm">
              <span
                className={cn(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                  f.availability === "available" ? "bg-gold-400 text-night-950" : "bg-white/10 text-gold-300",
                )}
              >
                {f.availability === "available" ? (
                  <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                ) : (
                  <Clock className="size-3" aria-hidden="true" />
                )}
              </span>
              <span>
                <span className="font-medium">{f.label}</span>
                {f.availability === "soon" && (
                  <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-gold-300 uppercase">
                    Bientôt
                  </span>
                )}
                <span className="block text-night-100/65">{f.description}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="relative mt-8">
          {currentPlan === "premium" ? (
            <ManageSubscriptionButton className="w-full" />
          ) : (
            <UpgradeButton className="w-full" />
          )}
          <p className="mt-3 text-center text-xs text-night-100/60">
            Aucun paiement pour le moment : le paiement sera disponible prochainement.
          </p>
        </div>
      </article>
    </div>
  );
}
