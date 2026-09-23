import { Container } from "@/components/ui/container";
import type { TravelPlan } from "@/types/travel-plan";
import { SectionTitle } from "./section-title";

export function HighlightsSection({ plan }: { plan: TravelPlan }) {
  if (plan.highlights.length === 0) return null;
  return (
    <section className="py-14 sm:py-20">
      <Container>
        <SectionTitle eyebrow="Moments forts" title="Les moments que tu vas kiffer" />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plan.highlights.map((h, index) => (
            <li
              key={h.title}
              className={
                index === 0
                  ? "rounded-4xl bg-linear-to-br from-sun-400/20 to-gold-400/5 p-6 ring-1 ring-sun-400/30 sm:col-span-2 lg:col-span-1"
                  : "rounded-4xl bg-white/[0.04] p-6 ring-1 ring-white/10"
              }
            >
              <span aria-hidden="true" className="text-4xl">
                {h.emoji}
              </span>
              <h3 className="mt-4 font-display text-xl font-bold">{h.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-night-100/70">{h.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
