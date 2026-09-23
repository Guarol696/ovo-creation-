import { Check, Info, MapPin, Sparkles, Star, Users } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ACCOMMODATION_LABELS } from "@/features/trip-engine/services/accommodation";
import { formatPrice } from "@/lib/utils";
import type { AccommodationOption, PlanAccommodation } from "@/types/travel-plan";
import { DemoBadge } from "./demo-badge";
import { SectionTitle } from "./section-title";

const ratingFormatter = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function nightsLabel(nights: number) {
  return `${nights} nuit${nights > 1 ? "s" : ""}`;
}

export function AccommodationSection({ accommodation }: { accommodation: PlanAccommodation }) {
  const { main, alternatives } = accommodation;
  const type = ACCOMMODATION_LABELS[main.type];

  return (
    <section id="hebergement" className="scroll-mt-20 py-14 sm:py-20">
      <Container>
        <SectionTitle eyebrow="Hébergement" title="Où dormir ?">
          <p>Un hébergement adapté à ton budget, à ton groupe et à ton style de voyage.</p>
        </SectionTitle>

        <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr] lg:items-start">
          <article className="rounded-4xl bg-white/[0.04] p-6 ring-1 ring-white/10 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">
                <span aria-hidden="true">{type.emoji}</span> {type.label}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold-300">
                <Sparkles className="size-3.5" /> Recommandé par OVO
              </span>
            </div>

            <h3 className="mt-4 font-display text-3xl font-bold tracking-tight">{main.name}</h3>
            <p className="mt-2 flex items-start gap-1.5 text-night-100/80">
              <MapPin className="mt-0.5 size-4 shrink-0 text-sun-400" />
              <span>
                <strong className="font-semibold text-white">{main.area}</strong> · {main.areaDescription}
              </span>
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm">
              <Star className="size-4 fill-gold-300 text-gold-300" />
              <span className="font-semibold">{ratingFormatter.format(main.rating)}/5</span>
              <DemoBadge>Note démo</DemoBadge>
            </p>

            <dl className="mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
              <div className="rounded-2xl bg-night-950/45 px-4 py-3">
                <dt className="text-[0.7rem] font-semibold tracking-wider text-gold-300 uppercase">
                  Par nuit
                </dt>
                <dd className="mt-1 font-display text-lg font-bold tabular-nums">
                  ≈ {formatPrice(main.estimatedPricePerNight)}
                </dd>
              </div>
              <div className="rounded-2xl bg-night-950/45 px-4 py-3">
                <dt className="text-[0.7rem] font-semibold tracking-wider text-gold-300 uppercase">
                  Pour {nightsLabel(main.nights)}
                </dt>
                <dd className="mt-1 font-display text-lg font-bold tabular-nums">
                  ≈ {formatPrice(main.estimatedTotal)}
                </dd>
              </div>
            </dl>

            <p className="mt-4 flex items-center gap-2 text-sm text-night-100/80">
              <Users className="size-4 text-gold-300" />
              Pour {main.guests} voyageur{main.guests > 1 ? "s" : ""} · {main.capacityLabel}
            </p>

            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Équipements">
              {main.amenities.map((amenity) => (
                <li
                  key={amenity}
                  className="inline-flex items-center gap-1 rounded-full bg-night-950/45 px-3 py-1 text-xs font-medium text-night-50/90 ring-1 ring-white/10"
                >
                  <Check className="size-3 text-sun-400" strokeWidth={3} /> {amenity}
                </li>
              ))}
            </ul>

            <p className="mt-5 text-sm font-medium text-white">{main.highlight}.</p>
          </article>

          <div className="flex flex-col gap-5">
            {alternatives.length > 0 && (
              <div className="rounded-4xl bg-white/[0.04] p-5 ring-1 ring-white/10 sm:p-6">
                <p className="font-semibold">Autres idées pour dormir</p>
                <ul className="mt-4 space-y-3">
                  {alternatives.map((option) => (
                    <AlternativeCard key={option.id} option={option} />
                  ))}
                </ul>
              </div>
            )}
            <p className="flex items-start gap-2.5 rounded-3xl bg-amber-400/10 px-4 py-3.5 text-xs leading-relaxed text-amber-50/85 ring-1 ring-amber-300/25">
              <Info className="mt-0.5 size-4 shrink-0 text-amber-200" />
              <span>
                <strong className="font-semibold text-amber-100">Établissements fictifs.</strong> Les noms,
                notes et prix sont des exemples de démonstration pour illustrer le type d&apos;hébergement
                conseillé, pas de vraies offres.
              </span>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

function AlternativeCard({ option }: { option: AccommodationOption }) {
  const type = ACCOMMODATION_LABELS[option.type];
  return (
    <li className="rounded-2xl bg-night-950/40 p-4">
      <p className="flex items-center justify-between gap-3 text-xs font-semibold text-night-100/70">
        <span>
          <span aria-hidden="true">{type.emoji}</span> {type.label} · {option.area}
        </span>
        <span className="inline-flex items-center gap-1">
          <Star className="size-3 fill-gold-300 text-gold-300" /> {ratingFormatter.format(option.rating)}
        </span>
      </p>
      <p className="mt-1 font-semibold">{option.name}</p>
      <p className="mt-1 text-sm text-night-100/75 tabular-nums">
        ≈ {formatPrice(option.estimatedPricePerNight)}/nuit · ≈ {formatPrice(option.estimatedTotal)} pour{" "}
        {nightsLabel(option.nights)}
      </p>
      <p className="mt-1 text-xs text-night-100/60">{option.highlight}</p>
    </li>
  );
}
