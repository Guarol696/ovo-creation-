import { BedDouble, Plane, TrainFront, TramFront, UtensilsCrossed } from "lucide-react";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { formatPrice } from "@/lib/utils";
import type { TravelPlan } from "@/types/travel-plan";
import { SectionTitle } from "./section-title";

function InfoCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <article className="rounded-4xl bg-white/[0.04] p-6 ring-1 ring-white/10">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-sun-400/15 text-sun-400">{icon}</span>
        <h3 className="font-display text-lg font-bold">{title}</h3>
      </div>
      <div className="mt-4 space-y-2 text-sm leading-relaxed text-night-100/75">{children}</div>
    </article>
  );
}

const priceLevel = (level: 1 | 2 | 3) => "€".repeat(level);

export function PracticalSection({ plan }: { plan: TravelPlan }) {
  const { transport, accommodation, restaurants } = plan;
  const isTrain = transport.toDestination.mode === "train";

  return (
    <section id="infos" className="scroll-mt-20 py-14 sm:py-20">
      <Container>
        <SectionTitle eyebrow="Infos pratiques" title="Transport, hébergement et bonnes tables" />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <InfoCard
            icon={isTrain ? <TrainFront className="size-5" /> : <Plane className="size-5" />}
            title="Pour y aller"
          >
            <p>
              <strong className="text-white">{isTrain ? "Train" : "Avion"}</strong> depuis{" "}
              {transport.toDestination.from} · {transport.toDestination.durationLabel}
            </p>
            <p>
              ≈ {formatPrice(transport.toDestination.estimatedCostPerPerson)} aller-retour par personne
              (estimation).
            </p>
            <p className="flex items-start gap-2 pt-2">
              <TramFront className="mt-0.5 size-4 shrink-0 text-gold-300" />
              <span>
                Sur place : {transport.local.description} (≈{" "}
                {formatPrice(transport.local.estimatedCostPerDayPerPerson)} / jour).
              </span>
            </p>
          </InfoCard>

          <InfoCard icon={<BedDouble className="size-5" />} title="Où dormir">
            <p>
              <strong className="text-white">{accommodation.type}</strong>
            </p>
            <p>{accommodation.description}</p>
            <p>
              ≈ {formatPrice(accommodation.estimatedPricePerNight)} la nuit
              {plan.travelers.total > 1 ? " pour le groupe" : ""} · {accommodation.nights} nuit
              {accommodation.nights > 1 ? "s" : ""}
            </p>
          </InfoCard>

          <InfoCard icon={<UtensilsCrossed className="size-5" />} title="Où manger">
            <ul className="space-y-2.5">
              {restaurants.slice(0, 5).map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-3">
                  <span>
                    <span className="font-medium text-white">{r.name}</span>
                    <span className="block text-xs text-night-100/60">{r.description}</span>
                  </span>
                  <span
                    className="shrink-0 text-xs font-bold text-gold-300"
                    aria-label={`Niveau de prix ${r.priceLevel} sur 3`}
                  >
                    {priceLevel(r.priceLevel)}
                  </span>
                </li>
              ))}
            </ul>
          </InfoCard>
        </div>
      </Container>
    </section>
  );
}
