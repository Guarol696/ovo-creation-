import type { DayPeriod, ScheduleRef } from "@/types/travel-plan";

const PERIOD_LABELS: Record<DayPeriod, string> = {
  morning: "matin",
  lunch: "midi",
  afternoon: "après-midi",
  evening: "soir",
  night: "nuit",
};

/** « Jour 2 · matin », ou « Jours 1 et 3 » si plusieurs passages. */
export function scheduleLabel(schedule: ScheduleRef[]) {
  if (schedule.length === 0) return null;
  const days = [...new Set(schedule.map((s) => s.dayNumber))];
  if (days.length === 1) return `Jour ${days[0]} · ${PERIOD_LABELS[schedule[0]!.period]}`;
  return `Jours ${days.slice(0, -1).join(", ")} et ${days.at(-1)}`;
}

/** Tri : éléments programmés d'abord (par jour), puis par pertinence. */
export function byScheduleThenRelevance<T extends { schedule: ScheduleRef[]; relevance: number }>(
  a: T,
  b: T,
) {
  const dayA = a.schedule[0]?.dayNumber ?? Number.POSITIVE_INFINITY;
  const dayB = b.schedule[0]?.dayNumber ?? Number.POSITIVE_INFINITY;
  return dayA - dayB || b.relevance - a.relevance;
}
