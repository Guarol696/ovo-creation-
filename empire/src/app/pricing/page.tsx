import type { Metadata } from "next";
import { Check } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { Button, ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { plans } from "@/config/plans";
import { routes } from "@/config/site";
import { startCheckout } from "@/features/billing/actions";
import { billingStatus } from "@/features/billing/env";
import { getCurrentUser, getUserPlan } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Tarifs", description: "Free, Pro, Premium : trois offres pour apprendre, créer et lancer." };

const errors: Record<string, string> = {
  configuration: "Les paiements ne sont pas encore configurés sur ce déploiement.",
  stripe: "La page de paiement n'a pas pu être ouverte. Réessaie dans un instant.",
  offre: "Offre inconnue.",
};

export default async function PricingPage({ searchParams }: PageProps<"/pricing">) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const currentPlan = await getUserPlan(user?.id);
  const status = billingStatus();
  const highlighted = typeof params.offre === "string" ? params.offre : undefined;
  const error = typeof params.erreur === "string" ? errors[params.erreur] : undefined;

  return (
    <>
      <PageHero
        index="P"
        label="Tarifs"
        lang="en"
        title="Choose your altitude"
        lines={["Choose", "your", <span key="a" className="text-outline">altitude.</span>]}
        intro={<p>Commence gratuitement. Passe à Pro ou Premium quand tes projets le demandent. Sans engagement, résiliable à tout moment.</p>}
      />
      <section aria-label="Offres" className="shell pb-24 md:pb-32">
        <div className="grid gap-4">
          {error && <Notice tone="error" title="Paiement indisponible">{error}</Notice>}
          {params.annule && <Notice title="Paiement annulé">Aucun montant n&apos;a été prélevé.</Notice>}
          {!status.ready && (
            <Notice tone="demo" title="Paiements en mode démonstration">
              Stripe n&apos;est pas configuré : les boutons d&apos;abonnement sont désactivés. Variables manquantes :{" "}
              <code className="text-paper">{status.missing.join(", ")}</code>. Voir le README.
            </Notice>
          )}
        </div>

        <ol className="mt-10 grid gap-px border hairline bg-steel/40 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const isCurrent = user && currentPlan === plan.id;
            const emphasis = highlighted ? highlighted === plan.id : plan.highlight;
            return (
              <li
                key={plan.id}
                data-reveal="up"
                style={{ "--d": `${index * 90}ms` } as React.CSSProperties}
                className={cn("relative flex flex-col gap-8 p-6 md:p-10", emphasis ? "bg-paper text-void" : "bg-void")}
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-expanded text-4xl md:text-5xl">{plan.name}</h2>
                  <span className={cn("meta", emphasis ? "text-void/60" : "text-mist")}>0{index + 1}</span>
                </div>
                <p className={cn(emphasis ? "text-void/75" : "text-silver")}>{plan.pitch}</p>
                <p className="flex items-baseline gap-2">
                  <span className="font-expanded text-6xl">{plan.monthlyPrice === null ? "0 €" : `${plan.monthlyPrice} €`}</span>
                  <span className={cn("meta", emphasis ? "text-void/60" : "text-mist")}>{plan.monthlyPrice === null ? "pour toujours" : "/ mois TTC"}</span>
                </p>
                <ul className="grid gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm">
                      <Check aria-hidden className={cn("mt-0.5 size-4 shrink-0", emphasis ? "text-void" : "text-volt")} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  {isCurrent ? (
                    <p className={cn("meta flex min-h-12 items-center justify-center border", emphasis ? "border-void/30" : "hairline")}>Ton offre actuelle</p>
                  ) : plan.id === "free" ? (
                    <ButtonLink href={user ? routes.academy : routes.signup} variant="outline" className={cn("w-full", emphasis && "border-void/40 text-void")}>
                      {user ? "Explorer les formations" : "Commencer gratuitement"}
                    </ButtonLink>
                  ) : (
                    <form action={startCheckout}>
                      <input type="hidden" name="plan" value={plan.id} />
                      <Button
                        type="submit"
                        arrow
                        disabled={!status.ready}
                        className={cn("w-full", emphasis && "bg-void text-paper before:bg-volt hover:text-void")}
                      >
                        {status.ready ? `Choisir ${plan.name}` : "Paiement bientôt disponible"}
                      </Button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-6 max-w-2xl text-sm text-mist">
          Paiement sécurisé par Stripe : aucune donnée de carte n&apos;est stockée par {""}la plateforme. L&apos;accès aux formations est activé
          uniquement après confirmation du paiement par Stripe.
        </p>
      </section>
    </>
  );
}
