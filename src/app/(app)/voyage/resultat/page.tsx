import type { Metadata } from "next";
import { InvalidPlan } from "@/features/trip-results/components/invalid-plan";
import { TravelPlanView } from "@/features/trip-results/components/travel-plan-view";
import { loadTravelPlan } from "@/features/trip-results/load-plan";

type Props = PageProps<"/voyage/resultat">;

const param = (value: string | string[] | undefined) => (typeof value === "string" ? value : undefined);

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const result = await loadTravelPlan(param((await searchParams).v));
  return {
    title: result.status === "ok" ? `Ton voyage à ${result.plan.destination.name}` : "Ton voyage",
    // Pages personnelles : pas d'indexation.
    robots: { index: false, follow: false },
  };
}

export default async function TripResultPage({ searchParams }: Props) {
  const result = await loadTravelPlan(param((await searchParams).v));

  if (result.status === "ok") return <TravelPlanView plan={result.plan} />;
  return <InvalidPlan request={result.status === "outdated" ? result.request : undefined} />;
}
