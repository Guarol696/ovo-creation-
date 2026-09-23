/**
 * Utilitaires de dates au format ISO local « YYYY-MM-DD ».
 * On travaille en dates calendaires (sans heure) pour éviter les
 * décalages de fuseau horaire.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function toIsoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayIso() {
  return toIsoDate(new Date());
}

/** Parse une date ISO en Date locale à midi ; null si invalide. */
export function parseIsoDate(value: string): Date | null {
  if (!ISO_DATE.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number) as [number, number, number];
  const date = new Date(y, m - 1, d, 12);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

export function addDays(value: string, days: number) {
  const date = parseIsoDate(value);
  if (!date) return value;
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

/** Nombre de nuits entre deux dates ISO (peut être négatif). */
export function nightsBetween(from: string, to: string): number | null {
  const a = parseIsoDate(from);
  const b = parseIsoDate(to);
  if (!a || !b) return null;
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

const longFormatter = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "long" });
const monthFormatter = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

export function formatDateFr(value: string) {
  const date = parseIsoDate(value);
  return date ? longFormatter.format(date) : value;
}

/** « 2026-10 » → « octobre 2026 » */
export function formatMonthFr(value: string) {
  const date = parseIsoDate(`${value}-01`);
  return date ? monthFormatter.format(date) : value;
}

/** Les `count` prochains mois au format YYYY-MM, à partir du mois courant. */
export function upcomingMonths(count: number, from = new Date()) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(from.getFullYear(), from.getMonth() + i, 1, 12);
    return toIsoDate(d).slice(0, 7);
  });
}
