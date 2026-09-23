import { ChevronDown, FlaskConical } from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PAID_PLANS, PLAN_LIMITS, PLANS, type PlanId } from "@/config/premium";
import { param } from "@/features/auth/page-params";
import { getBillingStatus } from "@/features/billing/server/env";
import { ONGOING_STATUSES } from "@/features/billing/stripe-mapping";
import { FeatureTable } from "@/features/premium/components/feature-table";
import { PlanCards } from "@/features/premium/components/plan-cards";
import { PremiumBadge } from "@/features/premium/components/premium-badge";
import { formatPlanPrice } from "@/features/premium/format";
import { getEntitlements } from "@/features/premium/server/entitlements";

export const metadata: Metadata = {
  title: "Offres OVO — Medium et Premium",
  description: `OVO Gratuit, ${PLANS.medium.name} (${formatPlanPrice(PLANS.medium.monthlyPrice)} / mois) et ${PLANS.premium.name} (${formatPlanPrice(PLANS.premium.monthlyPrice)} / mois) : carnet de voyage PDF, plus de voyages enregistrés, liens de partage à durée limitée.`,
};

const FAQ = [
  {
    q: "OVO reste-t-il gratuit ?",
    a: "Oui. Créer un voyage, le programme jour par jour, la carte, le budget, l'enregistrement, le partage et l'export PDF restent gratuits. Les offres payantes ajoutent des options, sans rien retirer.",
  },
  {
    q: "Comment se passe le paiement ?",
    a: "Le paiement est géré par Stripe, sur une page sécurisée : OVO ne voit ni ne stocke jamais tes coordonnées bancaires. Ton abonnement est activé dès que Stripe confirme le paiement.",
  },
  {
    q: "Puis-je changer d'offre ou annuler ?",
    a: "Oui, à tout moment depuis « Gérer mon abonnement » dans ton compte : passer de Medium à Premium (ou l'inverse), modifier ta carte, consulter tes factures ou annuler. Une annulation prend effet à la fin de la période déjà payée.",
  },
  {
    q: "Et si un paiement échoue ?",
    a: "Stripe réessaie automatiquement pendant quelques jours et ton offre reste active pendant ce temps. Tu es prévenu·e dans ton compte pour mettre à jour ton moyen de paiement.",
  },
  {
    q: "Que deviennent mes voyages si je repasse en gratuit ?",
    a: `Tu gardes tous tes voyages enregistrés. Seul l'ajout de nouveaux voyages est limité au-delà de ${PLAN_LIMITS.free.savedTrips}, et les fonctionnalités payantes redeviennent verrouillées.`,
  },
];

export default async function PremiumPage({ searchParams }: PageProps<"/premium">) {
  const [entitlements, params] = await Promise.all([getEntitlements(), searchParams]);
  const billing = getBillingStatus();
  const offer = param(params.offre);
  const highlighted = PAID_PLANS.includes(offer as never) ? (offer as PlanId) : null;
  const hasOngoingSubscription = Boolean(
    entitlements.status && ONGOING_STATUSES.includes(entitlements.status),
  );

  return (
    <div className="relative isolate flex-1 overflow-hidden bg-night-950 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[30rem] w-[60rem] max-w-full -translate-x-1/2 rounded-full bg-gold-400/15 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:28px_28px]" />
      </div>

      <section className="pt-32 pb-12 text-center sm:pt-40 sm:pb-16">
        <Container className="max-w-3xl">
          <div className="flex animate-fade-up justify-center">
            <PremiumBadge />
          </div>
          <h1 className="mt-6 animate-fade-up font-display text-[clamp(2.4rem,8vw,4.5rem)] leading-[1.02] font-extrabold tracking-tight text-balance [animation-delay:80ms]">
            Passe à <span className="text-gradient-sun">OVO Premium</span> ✨
          </h1>
          <p className="mx-auto mt-5 max-w-2xl animate-fade-up text-lg leading-relaxed text-night-100/80 [animation-delay:160ms]">
            Un carnet de voyage complet à emporter, plus de place pour tes voyages et des liens de partage qui
            expirent quand tu veux. OVO reste gratuit pour imaginer tes voyages : choisis l&apos;offre qui te
            ressemble.
          </p>
          {entitlements.isPaid && (
            <p
              role="status"
              className="mx-auto mt-6 inline-flex animate-fade-up items-center gap-2 rounded-full bg-gold-400/15 px-4 py-2 text-sm font-semibold text-gold-300 ring-1 ring-gold-400/40"
            >
              {PLANS[entitlements.plan].emoji} Tu es abonné·e à {PLANS[entitlements.plan].name} : merci de
              soutenir OVO !
            </p>
          )}
          {billing.checkoutReady && billing.testMode && (
            <p className="mx-auto mt-4 flex max-w-xl items-center justify-center gap-2 rounded-2xl bg-sky-500/10 px-4 py-2 text-xs text-sky-100 ring-1 ring-sky-400/30">
              <FlaskConical className="size-4 shrink-0" aria-hidden="true" /> Paiements en mode test Stripe :
              aucune carte réelle n&apos;est débitée.
            </p>
          )}
        </Container>
      </section>

      <section aria-label="Offres" className="pb-16">
        <Container className="max-w-6xl">
          <PlanCards
            currentPlan={entitlements.signedIn ? entitlements.plan : null}
            hasOngoingSubscription={hasOngoingSubscription}
            billingReady={billing.checkoutReady}
            highlighted={highlighted}
          />
          <p className="mt-6 text-center text-xs text-night-100/55">
            Prix TTC, prélevés chaque mois par Stripe. Paiement sécurisé, résiliable à tout moment.
          </p>
        </Container>
      </section>

      <section aria-labelledby="comparaison" className="pb-16">
        <Container className="max-w-4xl">
          <h2 id="comparaison" className="mb-6 text-center font-display text-3xl font-bold">
            Quelle offre pour toi ?
          </h2>
          <FeatureTable />
        </Container>
      </section>

      <section aria-labelledby="faq" className="pb-24">
        <Container className="max-w-3xl">
          <h2 id="faq" className="mb-6 text-center font-display text-3xl font-bold">
            Questions fréquentes
          </h2>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details key={item.q} className="group rounded-3xl bg-white/[0.04] ring-1 ring-white/10">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-3xl px-5 font-semibold focus-visible:ring-2 focus-visible:ring-sun-400 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown
                    className="size-5 shrink-0 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-night-100/80">{item.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
