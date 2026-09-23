import { Check, Crown, Sparkles } from "lucide-react";
import { routes } from "@/config/site";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

interface Plan {
  name: string;
  tagline: string;
  highlighted?: boolean;
  features: string[];
}

const plans: Plan[] = [
  {
    name: "OVO",
    tagline: "Pour trouver l'inspiration et partir malin.",
    features: [
      "Création de voyages personnalisés",
      "Destination, budget et programme",
      "Sauvegarde de tes voyages",
      "Partage avec tes amis",
    ],
  },
  {
    name: "OVO Premium",
    tagline: "Pour les voyageurs qui veulent aller plus loin.",
    highlighted: true,
    features: [
      "Voyages illimités et plus détaillés",
      "Alternatives et ajustements en un clic",
      "Export PDF & mode hors-ligne",
      "Bons plans et alertes prix en avant-première",
    ],
  },
];

export function PremiumTeaser() {
  return (
    <section id="premium" className="relative isolate overflow-hidden bg-night-950 py-24 text-white sm:py-32">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[30rem] w-[60rem] max-w-full -translate-x-1/2 rounded-full bg-gold-400/15 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:28px_28px]" />
      </div>

      <Container>
        <Reveal className="flex flex-col items-center text-center">
          <Badge tone="gold" className="mb-6">
            <Crown className="size-3.5" /> Bientôt disponible
          </Badge>
          <SectionHeading
            align="center"
            tone="light"
            title={
              <>
                Passe en mode <span className="text-gradient-sun">Premium.</span>
              </>
            }
            description="OVO reste gratuit pour imaginer tes voyages. Premium arrive bientôt pour celles et ceux qui veulent encore plus de liberté."
          />
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-4xl gap-5 md:grid-cols-2">
          {plans.map((plan, index) => (
            <Reveal key={plan.name} delay={index * 120} className="h-full">
              <article
                className={cn(
                  "relative h-full rounded-4xl p-7 sm:p-9",
                  plan.highlighted
                    ? "bg-linear-to-b from-gold-400/20 to-night-900 ring-1 ring-gold-400/50"
                    : "bg-white/5 ring-1 ring-white/10",
                )}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 right-7 flex items-center gap-1 rounded-full bg-linear-to-r from-gold-300 to-sun-500 px-3 py-1 text-xs font-bold text-night-950">
                    <Sparkles className="size-3" /> Bientôt
                  </span>
                )}
                <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
                <p className="mt-2 text-sm text-night-100/70">{plan.tagline}</p>
                <ul className="mt-7 space-y-3.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <span
                        className={cn(
                          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                          plan.highlighted ? "bg-gold-400 text-night-950" : "bg-white/10 text-white",
                        )}
                      >
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      <span className="text-night-50/90">{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 flex justify-center">
          <ButtonLink href={routes.createTrip} size="lg">
            Commencer gratuitement
          </ButtonLink>
        </Reveal>
      </Container>
    </section>
  );
}
