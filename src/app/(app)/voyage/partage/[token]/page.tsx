import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sharedTripPath } from "@/features/sharing/paths";
import { loadSharedTrip } from "@/features/sharing/server/load-shared-trip";
import { TravelPlanView } from "@/features/trip-results/components/travel-plan-view";
import { formatPrice } from "@/lib/utils";

type Props = PageProps<"/voyage/partage/[token]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Lien privé (non listé) : jamais indexé par les moteurs de recherche.
  const robots = { index: false, follow: false };
  const trip = await loadSharedTrip((await params).token).catch(() => null);
  if (!trip) return { title: "Voyage partagé", robots };
  const { plan } = trip;
  const description = `${plan.duration.days} jours · ${plan.travelers.total} voyageur${plan.travelers.total > 1 ? "s" : ""} · budget estimé ≈ ${formatPrice(plan.estimatedBudget.total)}. Un voyage imaginé avec OVO.`;
  return {
    title: trip.title,
    description,
    robots,
    openGraph: { title: `${trip.title} · OVO`, description, type: "article" },
  };
}

/** Vue publique d'un voyage partagé : uniquement le voyage, aucune information de compte. */
export default async function SharedTripPage({ params }: Props) {
  const { token } = await params;
  const trip = await loadSharedTrip(token);
  if (!trip) notFound();

  const path = sharedTripPath(trip.token);
  return (
    <TravelPlanView
      plan={trip.plan}
      save={{ mode: "public", destinationName: trip.plan.destination.name, sharePath: path }}
    />
  );
}
