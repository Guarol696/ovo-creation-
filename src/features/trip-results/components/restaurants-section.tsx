import { Container } from "@/components/ui/container";
import { formatPrice } from "@/lib/utils";
import type { PlanRestaurant } from "@/types/travel-plan";
import { SectionTitle } from "./section-title";

const PRICE_LABELS: Record<1 | 2 | 3, string> = { 1: "Petit prix", 2: "Intermédiaire", 3: "Plaisir" };

export function RestaurantsSection({ restaurants }: { restaurants: PlanRestaurant[] }) {
  if (restaurants.length === 0) return null;
  return (
    <section id="restaurants" className="scroll-mt-20 py-14 sm:py-20">
      <Container>
        <SectionTitle eyebrow="Restaurants" title="Où manger ?">
          <p>Les types d&apos;adresses prévus dans ton programme, pour tous les budgets.</p>
        </SectionTitle>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => (
            <li key={r.id} className="rounded-3xl bg-white/[0.04] p-5 ring-1 ring-white/10">
              <p className="flex items-center justify-between gap-3">
                <span
                  className="text-sm font-bold tracking-widest text-gold-300"
                  aria-label={`${PRICE_LABELS[r.priceLevel]}, niveau ${r.priceLevel} sur 3`}
                >
                  {"€".repeat(r.priceLevel)}
                  <span aria-hidden="true" className="text-white/20">
                    {"€".repeat(3 - r.priceLevel)}
                  </span>
                </span>
                <span className="text-xs font-semibold text-night-100/60 tabular-nums">
                  ≈ {formatPrice(r.estimatedCostPerPerson)} / pers.
                </span>
              </p>
              <h3 className="mt-2 font-semibold">{r.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-night-100/70">{r.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
