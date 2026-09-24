import { Container } from "@/components/ui/container";
import type { TravelPlan } from "@/types/travel-plan";
import { AccommodationSection } from "./accommodation-section";
import { ActivitiesSection } from "./activities-section";
import { BudgetSection } from "./budget-section";
import { DayExplorer } from "./day-explorer";
import { DemoNotice } from "./demo-notice";
import { HighlightsSection } from "./highlights-section";
import { RestaurantsSection } from "./restaurants-section";
import { ResultCta } from "./result-cta";
import { ResultHero, type SavedTripInfo } from "./result-hero";
import { ResultSectionNav } from "./result-section-nav";
import { TripSaveProvider, type TripSaveConfig } from "./save-trip-button";
import { TransportSection } from "./transport-section";
import { TravelBookSection } from "./travel-book-section";
import { WhySection } from "./why-section";

/**
 * Page de résultats : assemble les sections à partir d'un TravelPlan.
 * Ordre : destination → résumé → moments forts → transport → hébergement
 * → itinéraire + carte → activités → restaurants → budget → actions.
 */
interface TravelPlanViewProps {
  plan: TravelPlan;
  /** Enregistrement : voyage généré (demande encodée) ou voyage déjà sauvegardé. */
  save: TripSaveConfig;
  /** Renseigné quand le voyage est ouvert depuis « Mes voyages ». */
  savedTrip?: SavedTripInfo;
}

export function TravelPlanView({ plan, save, savedTrip }: TravelPlanViewProps) {
  return (
    <TripSaveProvider config={save}>
      <div className="relative isolate overflow-x-clip bg-night-950 text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[30rem] right-[-20%] size-[36rem] rounded-full bg-sun-500/10 blur-[140px]" />
          <div className="absolute top-[70rem] left-[-20%] size-[32rem] rounded-full bg-night-500/25 blur-[140px]" />
        </div>
        <ResultHero plan={plan} mode={save.mode} savedTrip={savedTrip} />
        <ResultSectionNav />
        <Container className="pt-6">
          <DemoNotice />
        </Container>
        <WhySection plan={plan} />
        <HighlightsSection plan={plan} />
        <TransportSection transport={plan.transport} travelers={plan.travelers.total} />
        <AccommodationSection accommodation={plan.accommodation} />
        <DayExplorer days={plan.itinerary} map={plan.map} />
        <ActivitiesSection activities={plan.activities} />
        <RestaurantsSection restaurants={plan.restaurants} />
        <BudgetSection
          budget={plan.estimatedBudget}
          request={plan.request}
          travelers={plan.travelers.total}
          childTravelers={plan.travelers.children}
          nights={plan.accommodation.main.nights}
        />
        {save.mode !== "public" && <TravelBookSection source={save} />}
        <ResultCta plan={plan} mode={save.mode} />
      </div>
    </TripSaveProvider>
  );
}
