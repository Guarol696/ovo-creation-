import { Container } from "@/components/ui/container";
import type { TravelPlan } from "@/types/travel-plan";
import { AccommodationSection } from "./accommodation-section";
import { ActivitiesSection } from "./activities-section";
import { BudgetSection } from "./budget-section";
import { DemoNotice } from "./demo-notice";
import { HighlightsSection } from "./highlights-section";
import { ItinerarySection } from "./itinerary-section";
import { RestaurantsSection } from "./restaurants-section";
import { ResultCta } from "./result-cta";
import { ResultHero } from "./result-hero";
import { TransportSection } from "./transport-section";
import { WhySection } from "./why-section";

/**
 * Page de résultats : assemble les sections à partir d'un TravelPlan.
 * Ordre : destination → résumé → moments forts → transport → hébergement
 * → itinéraire → activités → restaurants → budget → actions.
 */
export function TravelPlanView({ plan }: { plan: TravelPlan }) {
  return (
    <div className="relative isolate overflow-x-clip bg-night-950 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[30rem] right-[-20%] size-[36rem] rounded-full bg-sun-500/10 blur-[140px]" />
        <div className="absolute top-[70rem] left-[-20%] size-[32rem] rounded-full bg-night-500/25 blur-[140px]" />
      </div>
      <ResultHero plan={plan} />
      <Container className="pt-6">
        <DemoNotice />
      </Container>
      <WhySection plan={plan} />
      <HighlightsSection plan={plan} />
      <TransportSection transport={plan.transport} travelers={plan.travelers.total} />
      <AccommodationSection accommodation={plan.accommodation} />
      <ItinerarySection days={plan.itinerary} />
      <ActivitiesSection activities={plan.activities} />
      <RestaurantsSection restaurants={plan.restaurants} />
      <BudgetSection
        budget={plan.estimatedBudget}
        request={plan.request}
        travelers={plan.travelers.total}
        childTravelers={plan.travelers.children}
        nights={plan.accommodation.main.nights}
      />
      <ResultCta plan={plan} />
    </div>
  );
}
