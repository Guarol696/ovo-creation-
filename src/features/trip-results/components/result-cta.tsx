import { Pencil, RotateCcw } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { editTripUrl, newTripUrl } from "@/lib/trip/links";
import type { TravelPlan } from "@/types/travel-plan";
import { SaveTripButton } from "./save-trip-button";

export function ResultCta({ plan }: { plan: TravelPlan }) {
  return (
    <section className="pt-6 pb-20 sm:pb-28">
      <Container>
        <div className="relative isolate overflow-hidden rounded-5xl bg-linear-to-br from-night-700 via-night-800 to-night-900 px-6 py-12 text-center ring-1 ring-white/10 sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="absolute -top-24 left-1/2 -z-10 size-80 -translate-x-1/2 rounded-full bg-sun-500/25 blur-3xl"
          />
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">
            Alors, on part à {plan.destination.name} ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-night-100/75">
            Garde ce voyage sous le coude, ou ajuste tes critères pour une nouvelle proposition.
          </p>
          <div className="mt-8 flex flex-col flex-wrap justify-center gap-3 sm:flex-row">
            <SaveTripButton destinationName={plan.destination.name} />
            <ButtonLink href={editTripUrl(plan.request)} size="lg" variant="outline-light">
              <Pencil className="size-4" /> Modifier mon voyage
            </ButtonLink>
            <ButtonLink href={newTripUrl} size="lg" variant="ghost-light">
              <RotateCcw className="size-4" /> Recommencer
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
