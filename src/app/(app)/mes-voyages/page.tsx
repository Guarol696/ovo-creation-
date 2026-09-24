import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect, unstable_rethrow } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { routes } from "@/config/site";
import { AuthUnavailable } from "@/features/auth/components/auth-unavailable";
import { FormMessage } from "@/features/auth/components/form-controls";
import { param } from "@/features/auth/page-params";
import { getCurrentUser } from "@/features/auth/server/session";
import { PLANS } from "@/config/premium";
import { PlanBadge } from "@/features/premium/components/premium-badge";
import { getEntitlements } from "@/features/premium/server/entitlements";
import { MySpaceHeader } from "@/features/saved-trips/components/my-space-header";
import { SavedTripsList } from "@/features/saved-trips/components/saved-trips-list";
import { rowToSummary, type SavedTripSummary } from "@/features/saved-trips/mapping";
import { listSavedTrips } from "@/features/saved-trips/server/repository";
import { authUrl } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mes voyages", robots: { index: false, follow: false } };

export default async function MyTripsPage({ searchParams }: PageProps<"/mes-voyages">) {
  if (!isSupabaseConfigured()) return <AuthUnavailable />;
  const user = await getCurrentUser();
  // Double protection : le proxy redirige déjà, la page revérifie côté serveur.
  if (!user) redirect(authUrl(routes.login, routes.myTrips));

  let trips: SavedTripSummary[] | null = null;
  try {
    trips = (await listSavedTrips(await createClient())).map((row) => rowToSummary(row));
  } catch (error) {
    unstable_rethrow(error);
    console.error("[mes-voyages] chargement impossible", error);
  }
  const deletedFlash = param((await searchParams).supprime) === "1";
  const { limits, plan } = await getEntitlements();
  // Mention discrète de Premium seulement à l'approche de la limite gratuite.
  const nearLimit =
    plan !== "premium" &&
    trips !== null &&
    limits.savedTrips !== null &&
    trips.length >= limits.savedTrips * 0.8;

  return (
    <div className="flex-1 bg-night-950 text-white">
      <MySpaceHeader
        eyebrow="Mon espace"
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            Mes voyages <PlanBadge plan={plan} />
          </span>
        }
        description={
          trips && trips.length > 0
            ? `Salut ${user.displayName} 👋 Tu as ${trips.length} voyage${trips.length > 1 ? "s" : ""} enregistré${trips.length > 1 ? "s" : ""}.`
            : `Salut ${user.displayName} 👋 Tes voyages enregistrés t'attendent ici.`
        }
        action={
          <ButtonLink href={routes.createTrip} size="lg">
            <Plus className="size-5" /> Créer un voyage
          </ButtonLink>
        }
      />
      <Container className="pb-20 sm:pb-28">
        {trips && limits.savedTrips !== null && (
          <p className="mb-5 text-sm text-night-100/60">
            {trips.length} / {limits.savedTrips} voyages enregistrés avec {PLANS[plan].name}
            {nearLimit && (
              <>
                {" · "}
                <Link href={routes.premium} className="font-semibold text-gold-300 hover:underline">
                  Besoin de plus de place ? Découvre les offres
                </Link>
              </>
            )}
          </p>
        )}
        {trips ? (
          <SavedTripsList trips={trips} deletedFlash={deletedFlash} />
        ) : (
          <div className="mx-auto max-w-lg">
            <FormMessage tone="error">
              Impossible de charger tes voyages pour le moment. Vérifie ta connexion puis recharge la page.
            </FormMessage>
          </div>
        )}
        <p className="mt-10 text-center text-xs text-night-100/60">
          Prix et informations indicatifs (données de démonstration), enregistrés tels qu&apos;affichés le
          jour de la sauvegarde.
        </p>
      </Container>
    </div>
  );
}
