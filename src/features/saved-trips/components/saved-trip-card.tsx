import { ArrowRight, Globe } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { routes } from "@/config/site";
import { formatPrice } from "@/lib/utils";
import type { SavedTripSummary } from "../mapping";
import { DeleteTripButton } from "./delete-trip-button";

const createdFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

interface SavedTripCardProps {
  trip: SavedTripSummary;
  onDeleted: (id: string) => void;
}

export function SavedTripCard({ trip, onDeleted }: SavedTripCardProps) {
  const facts = [
    trip.duration ? `${trip.duration} jour${trip.duration > 1 ? "s" : ""}` : null,
    trip.travelers ? `${trip.travelers} voyageur${trip.travelers > 1 ? "s" : ""}` : null,
  ].filter(Boolean);

  return (
    <article className="group flex h-full flex-col rounded-4xl bg-white/[0.05] p-5 ring-1 ring-white/10 transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.07] hover:ring-white/20 sm:p-6">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="text-4xl leading-none">
          {trip.flag}
        </span>
        <div className="min-w-0">
          <h2 className="truncate font-display text-2xl font-bold">{trip.destination}</h2>
          {trip.country && <p className="text-sm text-night-100/65">{trip.country}</p>}
        </div>
        {trip.isPublic && (
          <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/30">
            <Globe className="size-3.5" /> Partagé
          </span>
        )}
      </div>

      <ul className="mt-5 space-y-2 text-sm">
        <li className="flex items-center gap-2">
          <span aria-hidden="true">📅</span> {trip.dates}
        </li>
        {facts.length > 0 && (
          <li className="flex items-center gap-2">
            <span aria-hidden="true">⏱️</span> {facts.join(" • ")}
          </li>
        )}
        {trip.budget !== null && (
          <li className="flex items-center gap-2 font-semibold text-gold-300">
            <span aria-hidden="true">💰</span> ≈ {formatPrice(trip.budget)}
            <span className="font-normal text-night-100/55">estimation</span>
          </li>
        )}
      </ul>

      <p className="mt-4 text-xs text-night-100/50">
        Enregistré le{" "}
        <time dateTime={trip.createdAt}>{createdFormatter.format(new Date(trip.createdAt))}</time>
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
        <ButtonLink
          href={`${routes.myTrips}/${trip.id}`}
          className="flex-1"
          aria-label={`Voir le voyage : ${trip.title}`}
        >
          Voir le voyage <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </ButtonLink>
        <DeleteTripButton tripId={trip.id} title={trip.title} onDeleted={onDeleted} />
      </div>
    </article>
  );
}
