import { AlertTriangle, ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { tripResultUrl } from "@/lib/trip/links";
import type { TravelPlan } from "@/types/travel-plan";
import { SectionTitle } from "./section-title";

export function WhySection({ plan }: { plan: TravelPlan }) {
  const alternativeTitle = plan.destination.recommended
    ? "D'autres destinations qui te correspondent"
    : "Des options plus abordables";

  return (
    <section id="pourquoi" className="scroll-mt-28 py-14 sm:scroll-mt-32 sm:py-20">
      <Container>
        <SectionTitle eyebrow="Ta proposition" title="Pourquoi OVO te recommande ce voyage">
          <p>{plan.summary}</p>
        </SectionTitle>

        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <ul className="space-y-3 rounded-4xl bg-white/[0.04] p-5 ring-1 ring-white/10 sm:p-7">
            {plan.reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-sun-400 text-night-950">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                <span className="leading-relaxed text-night-50/90">{reason}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-5">
            {plan.warnings.length > 0 && (
              <div role="note" className="rounded-4xl bg-amber-400/10 p-5 ring-1 ring-amber-300/30 sm:p-6">
                <p className="flex items-center gap-2 font-semibold text-amber-200">
                  <AlertTriangle className="size-4" /> À savoir
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-amber-50/85">
                  {plan.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {plan.alternatives.length > 0 && (
              <div className="rounded-4xl bg-white/[0.04] p-5 ring-1 ring-white/10 sm:p-6">
                <p className="font-semibold">{alternativeTitle}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {plan.alternatives.map((alt) => (
                    <li key={alt.id}>
                      <Link
                        href={tripResultUrl({
                          ...plan.request,
                          destination: {
                            mode: "known",
                            place: { id: alt.id, name: alt.name, country: alt.country },
                          },
                        })}
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white/[0.07] px-4 text-sm font-medium ring-1 ring-white/15 transition hover:bg-white/15"
                      >
                        {alt.name}
                        <span className="text-white/50">· {alt.country}</span>
                        <ArrowUpRight className="size-4 text-sun-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
