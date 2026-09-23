import type { Metadata } from "next";
import { TripBuilder } from "@/features/trip-builder/components/trip-builder";
import { findDestinationById } from "@/features/trip-builder/lib/destination-search";

export const metadata: Metadata = {
  title: "Créer mon voyage",
  description: "Dis-nous tes envies, ton budget et tes dates : OVO imagine le voyage qui te ressemble.",
};

export default async function NewTripPage({ searchParams }: PageProps<"/voyage/nouveau">) {
  const { destination } = await searchParams;
  const initialDestination = typeof destination === "string" ? findDestinationById(destination) : null;

  return <TripBuilder initialDestination={initialDestination} />;
}
