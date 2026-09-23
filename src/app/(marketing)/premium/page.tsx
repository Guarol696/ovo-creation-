import { ChevronDown } from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PLAN_LIMITS, PLANS } from "@/config/premium";
import { FeatureTable } from "@/features/premium/components/feature-table";
import { PlanCards } from "@/features/premium/components/plan-cards";
import { PremiumBadge } from "@/features/premium/components/premium-badge";
import { getEntitlements } from "@/features/premium/server/entitlements";

export const metadata: Metadata = {
  title: "OVO Premium",
  description: `${PLANS.premium.tagline} Carnet de voyage PDF, plus de voyages enregistrés et bientôt des itinéraires encore plus personnalisés.`,
};

const FAQ = [
  {
    q: "OVO reste-t-il gratuit ?",
    a: "Oui. Créer un voyage, le programme jour par jour, la carte, le budget, l'enregistrement, le partage et l'export PDF restent gratuits. Premium ajoute des options en plus, sans rien retirer.",
  },
  {
    q: "Comment payer Premium ?",
    a: "Le paiement n'est pas encore ouvert : aucune carte bancaire n'est demandée pour le moment. Le prix affiché est indicatif.",
  },
  {
    q: "Que deviennent mes voyages si je repasse en gratuit ?",
    a: `Tu gardes tous tes voyages enregistrés. Seul l'ajout de nouveaux voyages est limité au-delà de ${PLAN_LIMITS.free.savedTrips}, et les fonctionnalités Premium redeviennent verrouillées.`,
  },
  {
    q: "Pourrai-je annuler à tout moment ?",
    a: "Oui : l'abonnement sera sans engagement, et tu pourras le gérer depuis ton compte dès l'ouverture du paiement.",
  },
];

export default async function PremiumPage() {
  const { plan, isPremium, signedIn } = await getEntitlements();

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
            {PLANS.premium.tagline} Un carnet de voyage complet à emporter, plus de place pour tes voyages, et
            bientôt des itinéraires encore plus personnalisés. OVO reste gratuit pour imaginer tes voyages.
          </p>
          {isPremium && (
            <p
              role="status"
              className="mx-auto mt-6 inline-flex animate-fade-up items-center gap-2 rounded-full bg-gold-400/15 px-4 py-2 text-sm font-semibold text-gold-300 ring-1 ring-gold-400/40"
            >
              ✨ Tu es Premium : merci de soutenir OVO !
            </p>
          )}
        </Container>
      </section>

      <section aria-label="Offres" className="pb-16">
        <Container className="max-w-5xl">
          <PlanCards currentPlan={signedIn ? plan : null} />
        </Container>
      </section>

      <section aria-labelledby="comparaison" className="pb-16">
        <Container className="max-w-4xl">
          <h2 id="comparaison" className="mb-6 text-center font-display text-3xl font-bold">
            Gratuit ou Premium ?
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
