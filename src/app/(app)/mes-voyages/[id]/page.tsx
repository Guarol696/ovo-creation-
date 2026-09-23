import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { routes } from "@/config/site";
import { AuthUnavailable } from "@/features/auth/components/auth-unavailable";
import { getCurrentUser } from "@/features/auth/server/session";
import { loadSavedTrip } from "@/features/saved-trips/server/load-saved-trip";
import { sharedTripPath } from "@/features/sharing/paths";
import { TravelPlanView } from "@/features/trip-results/components/travel-plan-view";
import { authUrl } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/env";

type Props = PageProps<"/mes-voyages/[id]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const robots = { index: false, follow: false };
  if (!isSupabaseConfigured() || !(await getCurrentUser())) return { title: "Mon voyage", robots };
  const view = await loadSavedTrip((await params).id).catch(() => null);
  return { title: view?.trip.title ?? "Voyage introuvable", robots };
}

/** Voyage enregistré : réaffiché depuis la base, sans nouvelle génération. */
export default async function SavedTripPage({ params }: Props) {
  if (!isSupabaseConfigured()) return <AuthUnavailable />;
  const { id } = await params;
  if (!(await getCurrentUser())) redirect(authUrl(routes.login, `${routes.myTrips}/${id}`));

  // RLS : un voyage d'un autre utilisateur est introuvable (404), comme un identifiant inexistant.
  const view = await loadSavedTrip(id);
  if (!view) notFound();

  const { trip, plan, regenerated } = view;
  return (
    <TravelPlanView
      plan={plan}
      save={{
        mode: "saved",
        savedTripId: trip.id,
        destinationName: plan.destination.name,
        sharing: {
          isPublic: trip.is_public,
          sharePath: trip.is_public && trip.share_token ? sharedTripPath(trip.share_token) : null,
        },
      }}
      savedTrip={{ id: trip.id, title: trip.title, savedAt: trip.created_at, regenerated }}
    />
  );
}
