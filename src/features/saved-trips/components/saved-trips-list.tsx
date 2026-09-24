"use client";

import { Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { routes } from "@/config/site";
import type { SavedTripSummary } from "../mapping";
import { SavedTripCard } from "./saved-trip-card";

interface SavedTripsListProps {
  trips: SavedTripSummary[];
  /** Arrivée depuis la page d'un voyage supprimé. */
  deletedFlash: boolean;
}

export function SavedTripsList({ trips: initialTrips, deletedFlash }: SavedTripsListProps) {
  const [trips, setTrips] = useState(initialTrips);
  const [toast, setToast] = useState<string | null>(deletedFlash ? "Voyage supprimé ✓" : null);

  const onDeleted = useCallback((id: string) => {
    setTrips((current) => current.filter((t) => t.id !== id));
    setToast("Voyage supprimé ✓");
  }, []);
  const closeToast = useCallback(() => {
    setToast(null);
    const url = new URL(window.location.href);
    if (url.searchParams.has("supprime")) {
      url.searchParams.delete("supprime");
      window.history.replaceState(window.history.state, "", url);
    }
  }, []);

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {trips.length} voyage{trips.length > 1 ? "s" : ""} enregistré{trips.length > 1 ? "s" : ""}
      </p>
      {trips.length === 0 ? (
        <div className="mx-auto max-w-lg animate-fade-up rounded-4xl bg-white/[0.04] px-6 py-12 text-center ring-1 ring-white/10">
          <p aria-hidden="true" className="text-5xl">
            🧳
          </p>
          <h2 className="mt-4 font-display text-2xl font-bold">
            Aucun voyage enregistré pour l&apos;instant
          </h2>
          <p className="mt-3 text-night-100/70">
            Crée ton voyage, puis appuie sur « Enregistrer mon voyage » : il t&apos;attendra ici.
          </p>
          <ButtonLink href={routes.createTrip} size="lg" className="mt-7">
            <Plus className="size-5" /> Créer mon voyage
          </ButtonLink>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip, index) => (
            <li
              key={trip.id}
              className="min-w-0 animate-fade-up"
              style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
            >
              <SavedTripCard trip={trip} onDeleted={onDeleted} />
            </li>
          ))}
        </ul>
      )}
      <Toast message={toast} onClose={closeToast} />
    </>
  );
}
