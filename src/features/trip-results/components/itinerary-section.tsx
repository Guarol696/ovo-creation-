"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui/container";
import { formatDateFr } from "@/lib/dates";
import { cn, formatPrice } from "@/lib/utils";
import type { DayPeriod, ItineraryDay } from "@/types/travel-plan";
import { SectionTitle } from "./section-title";

const PERIODS: Record<DayPeriod, { label: string; emoji: string }> = {
  morning: { label: "Matin", emoji: "🌅" },
  lunch: { label: "Midi", emoji: "🍽️" },
  afternoon: { label: "Après-midi", emoji: "🌆" },
  evening: { label: "Soir", emoji: "🍴" },
  night: { label: "Nuit", emoji: "🌙" },
};

export function ItinerarySection({ days }: { days: ItineraryDay[] }) {
  // La première journée est ouverte par défaut.
  const [open, setOpen] = useState<Set<number>>(() => new Set([1]));
  const allOpen = open.size === days.length;

  // Liens « Voir le jour N » (#jour-N) : on déplie la journée visée.
  useEffect(() => {
    const onHashChange = () => {
      const match = /^#jour-(\d+)$/.exec(window.location.hash);
      if (match) setOpen((current) => new Set(current).add(Number(match[1])));
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const toggle = (dayNumber: number) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(dayNumber)) next.delete(dayNumber);
      else next.add(dayNumber);
      return next;
    });

  return (
    <section id="programme" className="scroll-mt-20 py-14 sm:py-20">
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle eyebrow="Programme" title="Ton voyage jour par jour">
            <p>
              Un programme équilibré selon ton style. Rien n&apos;est figé : adapte-le à ton envie du moment.
            </p>
          </SectionTitle>
          <button
            type="button"
            onClick={() => setOpen(allOpen ? new Set() : new Set(days.map((d) => d.dayNumber)))}
            className="mb-8 min-h-11 self-start rounded-full px-4 text-sm font-semibold text-sun-400 ring-1 ring-sun-400/40 transition hover:bg-sun-400/10 sm:mb-10 sm:self-auto"
          >
            {allOpen ? "Tout replier" : "Tout déplier"}
          </button>
        </div>

        <ol className="relative space-y-4">
          <span
            aria-hidden="true"
            className="absolute top-6 bottom-6 left-7 hidden w-px bg-white/10 sm:block"
          />
          {days.map((day) => (
            <li key={day.dayNumber} id={`jour-${day.dayNumber}`} className="relative scroll-mt-24 sm:pl-18">
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-3 left-0 hidden size-14 place-items-center rounded-2xl font-display text-lg font-bold transition-colors sm:grid",
                  open.has(day.dayNumber)
                    ? "bg-linear-to-br from-gold-300 to-sun-500 text-night-950"
                    : "bg-night-800 text-white ring-1 ring-white/15",
                )}
              >
                J{day.dayNumber}
              </span>
              <DayCard day={day} isOpen={open.has(day.dayNumber)} onToggle={() => toggle(day.dayNumber)} />
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

function DayCard({ day, isOpen, onToggle }: { day: ItineraryDay; isOpen: boolean; onToggle: () => void }) {
  const panelId = `jour-${day.dayNumber}-details`;

  return (
    <article className="overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex w-full items-start gap-3 p-4 text-left transition hover:bg-white/[0.03] sm:p-5"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold tracking-[0.15em] text-gold-300 uppercase">
              Jour {day.dayNumber}
              {day.date && (
                <span className="font-medium tracking-normal normal-case"> · {formatDateFr(day.date)}</span>
              )}
            </span>
            <span className="mt-1 block font-display text-lg leading-snug font-bold sm:text-xl">
              {day.title}
            </span>
            <span className="mt-1 block text-sm text-night-100/65">
              ≈ {formatPrice(day.estimatedCostPerPerson)} / pers. sur place
            </span>
          </span>
          <ChevronDown
            className={cn(
              "mt-1 size-5 shrink-0 text-white/60 transition-transform duration-300",
              isOpen && "rotate-180",
            )}
          />
        </button>
      </h3>

      <div
        id={panelId}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden" inert={!isOpen}>
          <div className="border-t border-white/10 px-4 pt-4 pb-5 sm:px-5">
            <p className="text-sm leading-relaxed text-night-100/75">{day.description}</p>
            <ul className="mt-4 space-y-2.5">
              {day.slots.map((slot) => (
                <li key={slot.period} className="flex gap-3 rounded-2xl bg-night-950/40 p-3 sm:p-4">
                  <span aria-hidden="true" className="text-xl leading-none">
                    {slot.activity?.emoji ?? slot.restaurant?.emoji ?? PERIODS[slot.period].emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.7rem] font-bold tracking-wider text-night-100/55 uppercase">
                      {PERIODS[slot.period].emoji} {PERIODS[slot.period].label}
                    </p>
                    <p className="mt-0.5 font-semibold break-words">{slot.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-night-100/70">{slot.description}</p>
                    {slot.estimatedCostPerPerson > 0 && (
                      <p className="mt-1.5 text-xs font-semibold text-gold-300/90 tabular-nums sm:hidden">
                        ≈ {formatPrice(slot.estimatedCostPerPerson)} / pers.
                      </p>
                    )}
                  </div>
                  {slot.estimatedCostPerPerson > 0 && (
                    <span className="hidden shrink-0 text-xs font-semibold text-night-100/70 tabular-nums sm:block">
                      ≈ {formatPrice(slot.estimatedCostPerPerson)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}
