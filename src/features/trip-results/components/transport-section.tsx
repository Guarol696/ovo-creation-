import { ArrowRight, Clock, Info, Sparkles, Ticket, Users } from "lucide-react";
import { Container } from "@/components/ui/container";
import { LOCAL_MOBILITY_LABELS, TRANSPORT_LABELS } from "@/features/trip-engine/services/transport";
import { formatPrice } from "@/lib/utils";
import type { PlanTransport, TransportOption } from "@/types/travel-plan";
import { DemoBadge } from "./demo-badge";
import { SectionTitle } from "./section-title";

interface TransportSectionProps {
  transport: PlanTransport;
  travelers: number;
}

export function TransportSection({ transport, travelers }: TransportSectionProps) {
  const { main, alternatives, local } = transport;
  const mode = TRANSPORT_LABELS[main.mode];

  return (
    <section id="transport" className="scroll-mt-28 py-14 sm:scroll-mt-32 sm:py-20">
      <Container>
        <SectionTitle eyebrow="Transport" title="Comment y aller ?">
          <p>L&apos;option qu&apos;OVO te conseille pour ce voyage, avec les alternatives possibles.</p>
        </SectionTitle>

        <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr] lg:items-start">
          {/* Option recommandée */}
          <article className="relative overflow-hidden rounded-4xl bg-linear-to-br from-sun-400/15 via-white/[0.04] to-white/[0.02] p-6 ring-1 ring-sun-400/30 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span
                aria-hidden="true"
                className="grid size-14 place-items-center rounded-2xl bg-night-950/60 text-3xl ring-1 ring-white/10"
              >
                {mode.emoji}
              </span>
              <div>
                <p className="font-display text-2xl font-bold">{mode.label}</p>
                <p className="flex items-center gap-1 text-xs font-semibold text-gold-300">
                  <Sparkles className="size-3.5" /> Recommandé par OVO
                </p>
              </div>
            </div>

            <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-xl font-semibold sm:text-2xl">
              <span>{main.from}</span>
              <ArrowRight aria-label="vers" className="size-5 text-sun-400" />
              <span>{main.to}</span>
            </p>

            <dl className="mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
              <Fact icon={Clock} label="Durée estimée" value={`≈ ${main.durationLabel}`} />
              <Fact
                icon={Ticket}
                label="Aller-retour"
                value={`≈ ${formatPrice(main.estimatedRoundTripPerPerson)}${travelers > 1 ? " / pers." : ""}`}
              />
              {travelers > 1 && (
                <Fact
                  icon={Users}
                  label={`Pour les ${travelers}`}
                  value={`≈ ${formatPrice(main.estimatedRoundTripTotal)} A/R`}
                />
              )}
            </dl>

            <p className="mt-5 text-sm leading-relaxed text-night-50/90">
              <strong className="text-white">{main.highlight}.</strong>
              {main.details && <span className="text-night-100/70"> {main.details}.</span>}
            </p>

            <p className="mt-5 flex items-start gap-2 rounded-2xl bg-night-950/40 px-3.5 py-2.5 text-xs text-night-100/70">
              <Info className="mt-0.5 size-3.5 shrink-0 text-gold-300" />
              Prix indicatif — démonstration. Non connecté aux disponibilités réelles.
            </p>
          </article>

          {/* Alternatives + sur place */}
          <div className="flex flex-col gap-5">
            {alternatives.length > 0 && (
              <div className="rounded-4xl bg-white/[0.04] p-5 ring-1 ring-white/10 sm:p-6">
                <p className="font-semibold">Autres options</p>
                <ul className="mt-4 space-y-3">
                  {alternatives.map((option) => (
                    <AlternativeRow key={option.id} option={option} travelers={travelers} />
                  ))}
                </ul>
              </div>
            )}

            <div className="flex-1 rounded-4xl bg-white/[0.04] p-5 ring-1 ring-white/10 sm:p-6">
              <h3 className="font-display text-lg font-bold">Comment se déplacer sur place ?</h3>
              <ul className="mt-4 grid gap-2.5">
                {local.options.map((option) => (
                  <li key={option.mode} className="flex items-start gap-3 rounded-2xl bg-night-950/40 p-3">
                    <span aria-hidden="true" className="text-xl leading-none">
                      {LOCAL_MOBILITY_LABELS[option.mode].emoji}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{option.label}</span>
                      <span className="block text-sm text-night-100/70">{option.description}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-night-100/70">
                Budget transports sur place : ≈ {formatPrice(local.estimatedCostPerDayPerPerson)} par jour et
                par personne <DemoBadge className="ml-1 align-middle">Estimation</DemoBadge>
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-night-950/45 px-4 py-3">
      <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gold-300 uppercase">
        <Icon className="size-3.5" /> {label}
      </dt>
      <dd className="mt-1 font-display text-lg font-bold tabular-nums">{value}</dd>
    </div>
  );
}

function AlternativeRow({ option, travelers }: { option: TransportOption; travelers: number }) {
  const mode = TRANSPORT_LABELS[option.mode];
  return (
    <li className="flex items-start gap-3 rounded-2xl bg-night-950/40 p-3.5">
      <span aria-hidden="true" className="text-2xl leading-none">
        {mode.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline justify-between gap-x-3">
          <span className="font-semibold">{mode.label}</span>
          <span className="text-sm font-semibold tabular-nums">
            ≈ {formatPrice(option.estimatedRoundTripPerPerson)}
            {travelers > 1 ? " / pers." : ""}
          </span>
        </p>
        <p className="text-sm text-night-100/70">
          ≈ {option.durationLabel} · {option.highlight}
        </p>
      </div>
    </li>
  );
}
