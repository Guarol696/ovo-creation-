import { z } from "zod";
import { AMBIANCES, BUDGET_RANGE_IDS, DURATION_IDS, PRIORITIES, TRAVEL_STYLES } from "@/types/trip";
import { initialDraft } from "./state";
import { STEPS } from "./steps";
import type { StepId, TripDraft } from "./types";

/**
 * Sauvegarde locale du questionnaire en cours (navigateur uniquement),
 * pour ne rien perdre en cas de rechargement. Aucune donnée n'est envoyée.
 */
const STORAGE_KEY = "ovo:trip-draft:v1";

// Chaque champ retombe sur sa valeur par défaut s'il est corrompu.
const draftSchema = z.object({
  destinationMode: z.enum(["known", "open"]).nullable().catch(null),
  destination: z
    .object({
      id: z.string(),
      name: z.string(),
      country: z.string(),
      countryCode: z.string().optional(),
      isCustom: z.boolean().optional(),
    })
    .nullable()
    .catch(null),
  datesMode: z.enum(["fixed", "flexible"]).nullable().catch(null),
  departureDate: z.string().catch(""),
  returnDate: z.string().catch(""),
  preferredMonth: z.string().nullable().catch(null),
  durationId: z.enum(DURATION_IDS).nullable().catch(null),
  travelersCount: z.number().int().min(1).max(20).nullable().catch(null),
  children: z.number().int().min(0).max(19).catch(0),
  budgetMode: z.enum(["range", "custom"]).nullable().catch(null),
  budgetRangeId: z.enum(BUDGET_RANGE_IDS).nullable().catch(null),
  customBudget: z.string().max(20).catch(""),
  budgetScope: z.enum(["per-person", "total"]).catch("per-person"),
  styles: z.array(z.enum(TRAVEL_STYLES)).catch([]),
  ambiances: z.array(z.enum(AMBIANCES)).catch([]),
  priorities: z.array(z.enum(PRIORITIES)).catch([]),
  wishes: z.string().max(2000).catch(""),
}) satisfies z.ZodType<TripDraft>;

const storedSchema = z.object({
  draft: draftSchema,
  stepId: z.enum(STEPS.map((s) => s.id) as [StepId, ...StepId[]]).catch("destination"),
  view: z.enum(["questions", "summary"]).catch("questions"),
});

export type StoredProgress = z.infer<typeof storedSchema>;

export function loadProgress(): StoredProgress | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = storedSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function saveProgress(progress: StoredProgress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Stockage indisponible (navigation privée…) : on continue sans.
  }
}

export function clearProgress() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignoré
  }
}

export function isDraftEmpty(draft: TripDraft) {
  return JSON.stringify(draft) === JSON.stringify(initialDraft);
}
