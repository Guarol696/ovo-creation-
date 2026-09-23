import type { Priority } from "@/types/trip";
import { estimateBudget, selectTier } from "./budget";
import type { DestinationProfile } from "./data-source/types";
import type { Preferences } from "./preferences";

/**
 * Score de compatibilité d'une destination avec les préférences.
 * Usage INTERNE uniquement : jamais affiché à l'utilisateur.
 *
 * Barème (≈ 100 points) :
 *  - styles de voyage   35
 *  - budget             20  (exclusion si manifestement hors budget)
 *  - ambiance           15
 *  - priorités          15
 *  - durée              10
 *  - saison              5
 */

export interface DestinationScore {
  profile: DestinationProfile;
  total: number;
  /** Destination incohérente avec le budget (écartée si possible). */
  excluded: boolean;
  detail: Record<"styles" | "budget" | "ambiance" | "priorities" | "duration" | "season", number>;
  estimatedTotal: number;
}

const ratio = (sum: number, count: number) => (count === 0 ? 0 : sum / (3 * count));

function priorityAffinity(profile: DestinationProfile, priority: Priority): number {
  if (priority === "prix") return Math.max(0, 4 - profile.costLevel);
  if (priority === "rapidite") {
    const h = profile.access.durationHours;
    return h <= 2 ? 3 : h <= 3.5 ? 2 : h <= 6 ? 1 : 0;
  }
  return profile.strengths[priority] ?? 0;
}

export function scoreDestination(profile: DestinationProfile, prefs: Preferences): DestinationScore {
  // Styles : choix explicites + styles détectés dans l'envie (poids réduit).
  const styleEntries = Object.entries(prefs.styleWeights).filter(([, w]) => w > 0);
  const styleSum = styleEntries.reduce(
    (sum, [style, weight]) => sum + (profile.styles[style as keyof typeof profile.styles] ?? 0) * weight,
    0,
  );
  const styleCount = styleEntries.reduce((sum, [, w]) => sum + w, 0);
  const styles = ratio(styleSum, styleCount) * 35;

  const ambianceList = [...prefs.ambiances];
  const ambiance =
    ratio(
      ambianceList.reduce((sum, a) => sum + (profile.ambiances[a] ?? 0), 0),
      ambianceList.length,
    ) * 15;

  const priorityList = [...prefs.priorities];
  const priorities =
    ratio(
      priorityList.reduce((sum, p) => sum + priorityAffinity(profile, p), 0),
      priorityList.length,
    ) * 15;

  const { min, max } = profile.idealDays;
  const duration =
    prefs.days >= min && prefs.days <= max ? 10 : prefs.days >= min - 1 && prefs.days <= max + 2 ? 5 : 0;

  let season = 0;
  if (prefs.month !== null && profile.bestMonths.length > 0) {
    if (profile.bestMonths.includes(prefs.month)) season = 5;
    else if (profile.type === "balneaire" || prefs.styles.includes("plage")) season = -5;
  }

  // Budget : on compare l'estimation au niveau de confort le plus adapté.
  const tier = selectTier(profile, prefs);
  const estimatedTotal = estimateBudget({ profile, prefs, tier }).total;
  const budgetRatio = estimatedTotal / prefs.budget.max;
  let budget = 0;
  let excluded = false;
  if (budgetRatio <= 1) budget = 20;
  else if (budgetRatio <= 1.15) budget = 8;
  else if (budgetRatio <= 1.35) budget = -10;
  else excluded = true;

  const detail = { styles, budget, ambiance, priorities, duration, season };
  const total = Object.values(detail).reduce((sum, v) => sum + v, 0);
  return { profile, total, excluded, detail, estimatedTotal };
}

/**
 * Classe les destinations. Celles manifestement hors budget passent en
 * dernier ; si toutes le sont, la moins chère reste proposée (avec alerte).
 */
export function rankDestinations(profiles: DestinationProfile[], prefs: Preferences): DestinationScore[] {
  const scores = profiles.map((p) => scoreDestination(p, prefs));
  const eligible = scores.filter((s) => !s.excluded);
  const pool =
    eligible.length > 0
      ? eligible
      : [...scores].sort((a, b) => a.estimatedTotal - b.estimatedTotal).slice(0, 3);
  const rest = scores.filter((s) => !pool.includes(s));

  const byScore = (a: DestinationScore, b: DestinationScore) =>
    b.total - a.total || a.estimatedTotal - b.estimatedTotal || a.profile.id.localeCompare(b.profile.id);
  return [...pool.sort(byScore), ...rest.sort(byScore)];
}
