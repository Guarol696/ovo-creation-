import type { Metadata } from "next";
import { TripBuilder } from "@/features/trip-builder/components/trip-builder";
import { findDestinationById } from "@/features/trip-builder/lib/destination-search";
import { tripRequestBaseSchema } from "@/features/trip-builder/schema";
import { decodeTripRequestParam } from "@/lib/trip/request-codec";

export const metadata: Metadata = {
  title: "Créer mon voyage",
  description: "Dis-nous tes envies, ton budget et tes dates : OVO imagine le voyage qui te ressemble.",
};

export default async function NewTripPage({ searchParams }: PageProps<"/voyage/nouveau">) {
  const { destination, modifier, nouveau } = await searchParams;
  const initialDestination = typeof destination === "string" ? findDestinationById(destination) : null;

  // « Modifier mon voyage » : réponses transmises depuis la page de résultats.
  const parsed =
    typeof modifier === "string" ? tripRequestBaseSchema.safeParse(decodeTripRequestParam(modifier)) : null;
  const initialRequest = parsed?.success ? parsed.data : null;

  return (
    <TripBuilder
      initialDestination={initialDestination}
      initialRequest={initialRequest}
      startFresh={nouveau === "1"}
    />
  );
}
