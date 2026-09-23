import { Clock, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { formatPrice } from "@/lib/utils";
import type { PlanActivity } from "@/types/travel-plan";
import { SectionTitle } from "./section-title";

function durationLabel(hours: number) {
  if (hours >= 5) return "Journée";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m ? `${h} h ${m}` : `${h} h`;
}

export function ActivitiesSection({ activities }: { activities: PlanActivity[] }) {
  if (activities.length === 0) return null;
  return (
    <section id="activites" className="scroll-mt-20 py-14 sm:py-20">
      <Container>
        <SectionTitle eyebrow="Activités" title="Ce que tu vas faire">
          <p>Toutes les activités de ton programme, en un coup d&apos;œil.</p>
        </SectionTitle>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <li
              key={activity.id}
              className="flex gap-3.5 rounded-3xl bg-white/[0.04] p-4 ring-1 ring-white/10 sm:p-5"
            >
              <span aria-hidden="true" className="text-2xl leading-none">
                {activity.emoji}
              </span>
              <div className="min-w-0">
                <h3 className="font-semibold">{activity.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-night-100/70">{activity.description}</p>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-night-100/60">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" /> {durationLabel(activity.durationHours)}
                  </span>
                  {activity.area && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3" /> {activity.area}
                    </span>
                  )}
                  <span className="font-semibold text-gold-300">
                    {activity.estimatedCostPerPerson === 0
                      ? "Gratuit"
                      : `≈ ${formatPrice(activity.estimatedCostPerPerson)} / pers.`}
                  </span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
