"use client";

import { ChevronLeft, ChevronRight, Clock, Info, MapPin, Map as MapIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Container } from "@/components/ui/container";
import { formatDateFr } from "@/lib/dates";
import { cn, formatPrice } from "@/lib/utils";
import type {
  DayPeriod,
  ItineraryDay,
  ItinerarySlot,
  LocationCategory,
  TravelLeg,
  TripMap,
} from "@/types/travel-plan";
import { SectionTitle } from "./section-title";
import { LOCATION_CATEGORIES, TravelMap } from "./travel-map";

const PERIODS: Record<DayPeriod, { label: string; emoji: string }> = {
  morning: { label: "Matin", emoji: "🌅" },
  lunch: { label: "Midi", emoji: "🍽️" },
  afternoon: { label: "Après-midi", emoji: "🌇" },
  evening: { label: "Soir", emoji: "🍴" },
  night: { label: "Nuit", emoji: "🌙" },
};

const ALL_CATEGORIES: LocationCategory[] = ["accommodation", "activity", "restaurant", "poi"];

const LEG_LABELS: Record<TravelLeg["mode"], { emoji: string; label: string }> = {
  walk: { emoji: "🚶", label: "à pied" },
  transit: { emoji: "🚇", label: "en transports" },
  road: { emoji: "🚗", label: "de route" },
};

const distanceFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

function formatDistance(km: number) {
  return km < 1 ? `${Math.round((km * 1000) / 50) * 50} m` : `${distanceFormatter.format(km)} km`;
}

function durationLabel(hours: number) {
  if (hours >= 6) return "Journée";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m ? `${h} h ${m}` : `${h} h`;
}

interface DayExplorerProps {
  days: ItineraryDay[];
  map: TripMap;
}

/**
 * Itinéraire jour par jour + carte synchronisée :
 * - choisir un jour met en évidence ses lieux sur la carte ;
 * - cliquer une étape centre la carte sur le lieu et ouvre sa fiche ;
 * - cliquer un marqueur met en évidence l'étape correspondante.
 */
export function DayExplorer({ days, map }: DayExplorerProps) {
  const [dayNumber, setDayNumber] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [visible, setVisible] = useState<ReadonlySet<LocationCategory>>(() => new Set(ALL_CATEGORIES));
  const mapCardRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const day = days.find((d) => d.dayNumber === dayNumber) ?? days[0]!;
  const locationsById = useMemo(() => new Map(map.locations.map((l) => [l.id, l])), [map.locations]);

  const goToDay = useCallback((n: number) => {
    setDayNumber(n);
    setSelectedId(null);
  }, []);

  // Liens « Voir le jour N » (#jour-N) depuis les autres sections.
  useEffect(() => {
    const onHashChange = () => {
      const match = /^#jour-(\d+)$/.exec(window.location.hash);
      if (!match) return;
      goToDay(Number(match[1]));
      timelineRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [goToDay]);

  // Clic sur un marqueur : on bascule sur le jour du lieu s'il n'est pas dans le jour affiché.
  const handleMarkerSelect = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      const location = id ? locationsById.get(id) : undefined;
      if (location && location.dayNumbers.length > 0 && !location.dayNumbers.includes(dayNumber)) {
        setDayNumber(location.dayNumbers[0]!);
      }
    },
    [locationsById, dayNumber],
  );

  // Clic sur une étape : carte centrée sur le lieu (et affichée sur mobile).
  function showOnMap(locationId: string) {
    const location = locationsById.get(locationId);
    if (location && !visible.has(location.category)) {
      setVisible((current) => new Set(current).add(location.category));
    }
    setSelectedId(locationId);
    if (window.matchMedia("(max-width: 1023px)").matches) {
      mapCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function toggleCategory(category: LocationCategory) {
    setVisible((current) => {
      const next = new Set(current);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
    const selected = selectedId ? locationsById.get(selectedId) : undefined;
    if (selected?.category === category) setSelectedId(null);
  }

  const counts = useMemo(() => {
    const result = { accommodation: 0, activity: 0, restaurant: 0, poi: 0 } as Record<
      LocationCategory,
      number
    >;
    for (const l of map.locations) result[l.category]++;
    return result;
  }, [map.locations]);
  const allVisible = ALL_CATEGORIES.every((c) => visible.has(c));

  return (
    <section id="programme" className="scroll-mt-20 py-14 sm:py-20">
      <Container>
        <SectionTitle eyebrow="Programme" title="Ton voyage jour par jour">
          <p>Choisis un jour : ses étapes s&apos;affichent et s&apos;allument sur la carte.</p>
        </SectionTitle>

        {/* Navigation entre les jours */}
        <nav
          aria-label="Jours du voyage"
          className="-mx-5 scrollbar-none overflow-x-auto px-5 sm:mx-0 sm:px-0"
        >
          <ul className="flex w-max gap-2 pb-1">
            {days.map((d) => {
              const active = d.dayNumber === day.dayNumber;
              return (
                <li key={d.dayNumber}>
                  <button
                    type="button"
                    id={`jour-${d.dayNumber}`}
                    aria-current={active ? "true" : undefined}
                    onClick={() => goToDay(d.dayNumber)}
                    className={cn(
                      "flex min-h-14 scroll-mt-28 flex-col items-start justify-center rounded-2xl px-4 text-left ring-1 transition-all duration-200 active:scale-95",
                      active
                        ? "bg-linear-to-br from-gold-300 to-sun-500 text-night-950 ring-transparent"
                        : "bg-white/[0.05] text-white/85 ring-white/15 hover:bg-white/10",
                    )}
                  >
                    <span className="text-sm font-bold">Jour {d.dayNumber}</span>
                    {d.date && (
                      <span className={cn("text-xs", active ? "text-night-950/75" : "text-night-100/60")}>
                        {formatDateFr(d.date)}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
          {/* Itinéraire du jour */}
          <div ref={timelineRef} className="min-w-0 scroll-mt-24">
            <div className="mb-4 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => goToDay(day.dayNumber - 1)}
                disabled={day.dayNumber === 1}
                className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-white/80 ring-1 ring-white/15 transition hover:bg-white/10 disabled:opacity-30"
              >
                <ChevronLeft className="size-4" />
                <span className="hidden min-[400px]:inline">Jour précédent</span>
                <span className="sr-only min-[400px]:hidden">Jour précédent</span>
              </button>
              <p className="text-sm font-semibold" aria-live="polite">
                Jour {day.dayNumber} <span className="text-white/45">/ {days.length}</span>
              </p>
              <button
                type="button"
                onClick={() => goToDay(day.dayNumber + 1)}
                disabled={day.dayNumber === days.length}
                className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-white/80 ring-1 ring-white/15 transition hover:bg-white/10 disabled:opacity-30"
              >
                <span className="hidden min-[400px]:inline">Jour suivant</span>
                <span className="sr-only min-[400px]:hidden">Jour suivant</span>
                <ChevronRight className="size-4" />
              </button>
            </div>

            <article
              key={day.dayNumber}
              className="animate-fade-up rounded-4xl bg-white/[0.04] p-4 ring-1 ring-white/10 sm:p-6"
            >
              <p className="text-xs font-bold tracking-[0.15em] text-gold-300 uppercase">
                Jour {day.dayNumber}
                {day.date && (
                  <span className="font-medium tracking-normal normal-case"> · {formatDateFr(day.date)}</span>
                )}
              </p>
              <h3 className="mt-1 font-display text-2xl leading-snug font-bold">📍 {day.title}</h3>
              <p className="mt-1 text-sm text-night-100/70">
                ≈ {formatPrice(day.estimatedCostPerPerson)} / pers. sur place · prix indicatifs
              </p>

              <ol className="mt-5">
                {day.slots.map((slot, index) => (
                  <li key={`${slot.period}-${index}`}>
                    {slot.legFromPrevious && <LegIndicator leg={slot.legFromPrevious} />}
                    <SlotCard
                      slot={slot}
                      selected={Boolean(
                        selectedId &&
                        (slot.locationId === selectedId ||
                          (slot.restaurant && `restaurant:${slot.restaurant.id}` === selectedId)),
                      )}
                      onShowOnMap={map.available ? showOnMap : undefined}
                    />
                  </li>
                ))}
              </ol>

              <p className="mt-4 flex items-start gap-2 text-xs text-night-100/55">
                <Info className="mt-0.5 size-3.5 shrink-0 text-gold-300" />
                Horaires indicatifs. Distances à vol d&apos;oiseau et temps estimés : aucun calcul
                d&apos;itinéraire réel.
              </p>
            </article>
          </div>

          {/* Carte synchronisée */}
          <div
            id="carte"
            ref={mapCardRef}
            className="min-w-0 scroll-mt-24 rounded-4xl bg-white/[0.04] p-4 ring-1 ring-white/10 sm:p-5 lg:sticky lg:top-24"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold">
                <MapIcon className="size-5 text-sun-400" /> Ton voyage sur la carte
              </h3>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] font-bold tracking-wider text-white/70 uppercase ring-1 ring-white/15">
                Démo
              </span>
            </div>

            {map.available ? (
              <>
                <div className="-mx-4 mt-3 scrollbar-none overflow-x-auto px-4 sm:-mx-5 sm:px-5">
                  <div
                    role="group"
                    aria-label="Catégories affichées sur la carte"
                    className="flex w-max gap-2 pb-1"
                  >
                    <button
                      type="button"
                      aria-pressed={allVisible}
                      onClick={() => setVisible(new Set(ALL_CATEGORIES))}
                      className={cn(
                        "min-h-10 rounded-full px-3.5 text-sm font-semibold whitespace-nowrap ring-1 transition",
                        allVisible
                          ? "bg-white text-night-950 ring-white"
                          : "text-white/80 ring-white/15 hover:bg-white/10",
                      )}
                    >
                      📍 Tout
                    </button>
                    {ALL_CATEGORIES.map((category) => {
                      const active = visible.has(category) && !allVisible;
                      const on = visible.has(category);
                      return (
                        <button
                          key={category}
                          type="button"
                          aria-pressed={on}
                          disabled={counts[category] === 0}
                          onClick={() =>
                            allVisible ? setVisible(new Set([category])) : toggleCategory(category)
                          }
                          className={cn(
                            "min-h-10 rounded-full px-3.5 text-sm font-semibold whitespace-nowrap ring-1 transition disabled:opacity-35",
                            active
                              ? "bg-sun-400 text-night-950 ring-sun-400"
                              : on
                                ? "bg-white/10 text-white ring-white/25"
                                : "text-white/55 ring-white/10 hover:bg-white/10",
                          )}
                        >
                          {LOCATION_CATEGORIES[category].emoji} {LOCATION_CATEGORIES[category].label}{" "}
                          <span className="text-xs opacity-70">{counts[category]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <TravelMap
                  map={map}
                  visibleCategories={visible}
                  activeDay={day.dayNumber}
                  selectedId={selectedId}
                  onSelect={handleMarkerSelect}
                  className="mt-3 h-[62svh] min-h-[360px] lg:h-[min(68vh,640px)]"
                />

                <p className="mt-3 text-xs text-night-100/55">
                  Lieux du jour {day.dayNumber} en évidence, les autres atténués. Positions de démonstration,
                  approximatives — établissements fictifs.
                </p>
              </>
            ) : (
              <p className="mt-4 rounded-3xl bg-night-950/40 p-5 text-sm leading-relaxed text-night-100/75">
                🗺️ La carte n&apos;est pas encore disponible pour cette destination : OVO n&apos;a pas de
                coordonnées de démonstration pour ce programme type.
              </p>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

function LegIndicator({ leg }: { leg: TravelLeg }) {
  const mode = LEG_LABELS[leg.mode];
  return (
    <p className="my-1.5 ml-[1.1rem] flex items-center gap-2 border-l-2 border-dashed border-white/15 py-1.5 pl-4 text-xs text-night-100/65">
      <span aria-hidden="true">{mode.emoji}</span>
      <span>
        {formatDistance(leg.distanceKm)} · ≈ {leg.minutes} min {mode.label}
      </span>
    </p>
  );
}

interface SlotCardProps {
  slot: ItinerarySlot;
  selected: boolean;
  onShowOnMap?: (locationId: string) => void;
}

function SlotCard({ slot, selected, onShowOnMap }: SlotCardProps) {
  const period = PERIODS[slot.period];
  const emoji = slot.activity?.emoji ?? slot.restaurant?.emoji ?? period.emoji;
  const area = slot.activity?.area ?? slot.restaurant?.area;
  const clickable = Boolean(slot.locationId && onShowOnMap);

  const content = (
    <>
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-xl"
      >
        {emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 text-[0.7rem] font-bold tracking-wider text-night-100/60 uppercase">
          <span>
            {period.emoji} {period.label}
          </span>
          {slot.startTime && (
            <span className="inline-flex items-center gap-1 font-semibold tracking-normal normal-case">
              <Clock className="size-3" /> {slot.startTime}
              {slot.endTime && ` – ${slot.endTime}`}
            </span>
          )}
        </span>
        <span className="mt-0.5 block font-semibold break-words">{slot.title}</span>
        <span className="mt-0.5 block text-sm leading-relaxed text-night-100/70">{slot.description}</span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-night-100/60">
          {slot.activity && !slot.activity.fullDay && (
            <span>⏱️ {durationLabel(slot.activity.durationHours)}</span>
          )}
          {slot.estimatedCostPerPerson > 0 && (
            <span className="font-semibold text-gold-300">
              ≈ {formatPrice(slot.estimatedCostPerPerson)} / pers.
            </span>
          )}
          {area && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" /> {area}
            </span>
          )}
        </span>
        {clickable && (
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-sun-400">
            <MapIcon className="size-3.5" /> Voir sur la carte
          </span>
        )}
      </span>
    </>
  );

  const className = cn(
    "flex w-full gap-3 rounded-2xl p-3 text-left transition sm:p-4",
    selected ? "bg-sun-400/15 ring-2 ring-sun-400" : "bg-night-950/40 ring-1 ring-transparent",
  );

  return clickable ? (
    <button
      type="button"
      onClick={() => onShowOnMap!(slot.locationId!)}
      aria-label={`${period.label} : ${slot.title} — voir sur la carte`}
      aria-pressed={selected}
      className={cn(className, "hover:bg-night-950/60 hover:ring-white/20")}
    >
      {content}
    </button>
  ) : (
    <div className={className}>{content}</div>
  );
}
