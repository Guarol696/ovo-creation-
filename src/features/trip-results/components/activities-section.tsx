"use client";

import { CalendarCheck, Clock, Info, MapPin, Sparkles, Sun } from "lucide-react";
import { useMemo, useState } from "react";
import { Container } from "@/components/ui/container";
import { ACTIVITY_THEMES, MUST_SEE_LABEL } from "@/features/trip-engine/services/activities";
import { cn, formatPrice } from "@/lib/utils";
import type { ActivityTheme, PlanActivity, RecommendedMoment } from "@/types/travel-plan";
import { FilterChips, type FilterOption } from "./filter-chips";
import { byScheduleThenRelevance, scheduleLabel } from "./schedule-label";
import { SectionTitle } from "./section-title";

type ActivityFilter = "toutes" | "gratuit" | "petit-budget" | "culture" | "nature" | "sorties" | "aventure";

/** Au-delà de ce prix par personne, une activité n'est plus « petit budget ». */
const SMALL_BUDGET_MAX = 15;
const INITIAL_COUNT = 6;

const FILTERS: { id: ActivityFilter; label: string; test: (a: PlanActivity) => boolean }[] = [
  { id: "toutes", label: "Toutes", test: () => true },
  { id: "gratuit", label: "Gratuit", test: (a) => a.estimatedCostPerPerson === 0 },
  { id: "petit-budget", label: "Petit budget", test: (a) => a.estimatedCostPerPerson <= SMALL_BUDGET_MAX },
  { id: "culture", label: "🏛️ Culture", test: (a) => a.theme === "culture" },
  { id: "nature", label: "🌳 Nature", test: (a) => a.theme === "nature" || a.theme === "detente" },
  { id: "sorties", label: "🎉 Sorties", test: (a) => a.theme === "sorties" || a.theme === "evenements" },
  { id: "aventure", label: "🏄 Aventure", test: (a) => a.theme === "aventure" },
];

const MOMENT_LABELS: Record<RecommendedMoment, string> = {
  morning: "Le matin",
  afternoon: "L'après-midi",
  evening: "En soirée",
  night: "La nuit",
  day: "Toute la journée",
};

const THEME_TILES: Record<ActivityTheme, string> = {
  culture: "from-amber-400/35 to-orange-700/20",
  nature: "from-emerald-400/35 to-teal-700/20",
  sorties: "from-fuchsia-500/35 to-purple-800/20",
  aventure: "from-sky-400/35 to-blue-800/20",
  shopping: "from-pink-400/35 to-rose-800/20",
  gastronomie: "from-orange-400/35 to-red-800/20",
  evenements: "from-violet-400/35 to-indigo-800/20",
  detente: "from-teal-300/35 to-cyan-800/20",
};

const priceLevelLabel = (level: number) => (level === 0 ? "Gratuit" : "€".repeat(level));

export function ActivitiesSection({ activities }: { activities: PlanActivity[] }) {
  const [filter, setFilter] = useState<ActivityFilter>("toutes");
  const [expanded, setExpanded] = useState(false);

  const sorted = useMemo(() => [...activities].sort(byScheduleThenRelevance), [activities]);
  const options: FilterOption<ActivityFilter>[] = FILTERS.map((f) => ({
    id: f.id,
    label: f.label,
    count: sorted.filter(f.test).length,
  }));
  const current = FILTERS.find((f) => f.id === filter)!;
  const filtered = sorted.filter(current.test);
  const visible = expanded ? filtered : filtered.slice(0, INITIAL_COUNT);
  const scheduledCount = activities.filter((a) => a.schedule.length > 0).length;

  if (activities.length === 0) return null;

  return (
    <section id="activites" className="scroll-mt-28 py-14 sm:scroll-mt-32 sm:py-20">
      <Container>
        <SectionTitle eyebrow="Activités" title="Que faire ?">
          <p>
            {activities.length} idées choisies selon ton profil, dont {scheduledCount} déjà dans ton
            programme.
          </p>
        </SectionTitle>

        <FilterChips
          label="Filtrer les activités"
          options={options}
          value={filter}
          onChange={(value) => {
            setFilter(value);
            setExpanded(false);
          }}
        />

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {visible.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </ul>

        {filtered.length === 0 && (
          <p className="mt-6 rounded-3xl bg-white/[0.04] p-6 text-center text-night-100/70 ring-1 ring-white/10">
            Aucune activité dans cette catégorie pour ce voyage.
          </p>
        )}

        <div className="mt-6 flex flex-col items-center gap-4">
          {filtered.length > INITIAL_COUNT && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="min-h-11 rounded-full px-5 text-sm font-semibold text-sun-400 ring-1 ring-sun-400/40 transition hover:bg-sun-400/10"
            >
              {expanded ? "Voir moins" : `Voir les ${filtered.length} activités`}
            </button>
          )}
          <p className="flex items-center gap-2 text-xs text-night-100/60">
            <Info className="size-3.5 text-gold-300" />
            Prix indicatifs — démonstration. Aucune réservation ni disponibilité réelle.
          </p>
        </div>
      </Container>
    </section>
  );
}

function ActivityCard({ activity }: { activity: PlanActivity }) {
  const theme = ACTIVITY_THEMES[activity.theme];
  const scheduled = scheduleLabel(activity.schedule);
  const firstDay = activity.schedule[0]?.dayNumber;

  return (
    <li className="flex flex-col overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 transition duration-300 hover:-translate-y-0.5 hover:ring-white/20">
      <div
        className={cn("relative grid h-28 place-items-center bg-linear-to-br", THEME_TILES[activity.theme])}
      >
        <span aria-hidden="true" className="text-5xl drop-shadow">
          {activity.emoji}
        </span>
        {activity.mustSee && (
          <span className="absolute top-3 right-3 rounded-full bg-night-950/60 px-2.5 py-1 text-xs font-semibold backdrop-blur">
            {MUST_SEE_LABEL.emoji} {MUST_SEE_LABEL.label}
          </span>
        )}
        {scheduled ? (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-sun-400 px-2.5 py-1 text-xs font-bold text-night-950">
            <CalendarCheck className="size-3" /> {scheduled}
          </span>
        ) : (
          activity.recommended && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-night-950/60 px-2.5 py-1 text-xs font-semibold text-gold-300 backdrop-blur">
              <Sparkles className="size-3" /> Pour toi
            </span>
          )
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="flex items-center justify-between gap-2 text-xs font-semibold">
          <span className="text-night-100/75">
            {theme.emoji} {theme.label}
          </span>
          <span
            className="tracking-widest text-gold-300"
            aria-label={`Niveau de prix : ${priceLevelLabel(activity.priceLevel)}`}
          >
            {priceLevelLabel(activity.priceLevel)}
          </span>
        </p>
        <h3 className="mt-2 font-display text-lg leading-snug font-bold">{activity.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-night-100/70">
          {activity.description}
        </p>

        <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-night-100/65">
          <li className="inline-flex items-center gap-1">
            <Clock className="size-3" /> {activity.durationLabel}
          </li>
          <li className="inline-flex items-center gap-1">
            <Sun className="size-3" /> {MOMENT_LABELS[activity.bestMoment]}
          </li>
          {activity.area && (
            <li className="inline-flex items-center gap-1">
              <MapPin className="size-3" /> {activity.area}
            </li>
          )}
        </ul>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-sm">
          <span className="font-semibold tabular-nums">
            {activity.estimatedCostPerPerson === 0
              ? "Gratuit"
              : `≈ ${formatPrice(activity.estimatedCostPerPerson)} / pers.`}
          </span>
          {firstDay ? (
            <a
              href={`#jour-${firstDay}`}
              className="inline-flex min-h-10 items-center rounded-full px-3 text-xs font-semibold text-sun-400 ring-1 ring-sun-400/40 transition hover:bg-sun-400/10"
            >
              Voir le jour {firstDay}
            </a>
          ) : (
            <span className="text-xs text-night-100/55">Idée en plus</span>
          )}
        </div>
      </div>
    </li>
  );
}
