import { z } from "zod";
import { addDays, nightsBetween, todayIso } from "@/lib/dates";
import { CUSTOM_BUDGET_LIMITS, TRAVELERS_LIMITS, WISHES_MAX_LENGTH } from "@/lib/trip/options";
import {
  AMBIANCES,
  BUDGET_RANGE_IDS,
  DURATION_IDS,
  PRIORITIES,
  TRAVEL_STYLES,
  type TripRequest,
} from "@/types/trip";
import { DATE_LIMITS } from "./validation";

/**
 * Schéma de validation d'une demande de voyage complète.
 * Utilisé côté serveur : ne jamais faire confiance aux données du client.
 */
const placeSchema = z.object({
  id: z.string().min(1).max(120),
  name: z.string().trim().min(1).max(80),
  country: z.string().max(80),
  countryCode: z
    .string()
    .regex(/^[A-Z]{2}$/)
    .optional(),
  isCustom: z.boolean().optional(),
});

const scopeSchema = z.enum(["per-person", "total"]);

/** Structure seule (sans contrôle de date) : sert à pré-remplir le questionnaire. */
export const tripRequestBaseSchema = z.object({
  destination: z.discriminatedUnion("mode", [
    z.object({ mode: z.literal("known"), place: placeSchema }),
    z.object({ mode: z.literal("open") }),
  ]),
  dates: z.discriminatedUnion("mode", [
    z.object({ mode: z.literal("fixed"), departureDate: z.iso.date(), returnDate: z.iso.date() }),
    z.object({
      mode: z.literal("flexible"),
      preferredMonth: z
        .string()
        .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
        .nullable(),
    }),
  ]),
  duration: z.object({
    id: z.enum(DURATION_IDS),
    days: z
      .number()
      .int()
      .min(1)
      .max(DATE_LIMITS.maxNights + 1)
      .nullable(),
  }),
  travelers: z.object({
    adults: z.number().int().min(1).max(TRAVELERS_LIMITS.max),
    children: z
      .number()
      .int()
      .min(0)
      .max(TRAVELERS_LIMITS.max - 1),
  }),
  budget: z.discriminatedUnion("mode", [
    z.object({ mode: z.literal("range"), rangeId: z.enum(BUDGET_RANGE_IDS), scope: scopeSchema }),
    z.object({
      mode: z.literal("custom"),
      amount: z.number().int().positive().max(CUSTOM_BUDGET_LIMITS.max),
      scope: scopeSchema,
    }),
  ]),
  styles: z.array(z.enum(TRAVEL_STYLES)).min(1).max(TRAVEL_STYLES.length),
  ambiances: z.array(z.enum(AMBIANCES)).min(1).max(AMBIANCES.length),
  priorities: z.array(z.enum(PRIORITIES)).min(1).max(PRIORITIES.length),
  wishes: z.string().trim().max(WISHES_MAX_LENGTH).nullable(),
}) satisfies z.ZodType<TripRequest>;

/** Validation complète d'une demande (dates futures, cohérence, budget réaliste). */
export const tripRequestSchema = tripRequestBaseSchema.superRefine((value, ctx) => {
  const people = value.travelers.adults + value.travelers.children;
  if (people > TRAVELERS_LIMITS.max) {
    ctx.addIssue({ code: "custom", path: ["travelers"], message: "Groupe trop nombreux." });
  }

  if (value.dates.mode === "fixed") {
    const { departureDate, returnDate } = value.dates;
    // Tolérance d'un jour pour les écarts de fuseau horaire client/serveur.
    if (departureDate < addDays(todayIso(), -1)) {
      ctx.addIssue({ code: "custom", path: ["dates"], message: "Date de départ passée." });
    }
    const nights = nightsBetween(departureDate, returnDate) ?? 0;
    if (nights <= 0 || nights > DATE_LIMITS.maxNights) {
      ctx.addIssue({ code: "custom", path: ["dates"], message: "Dates incohérentes." });
    }
  }

  if (value.budget.mode === "custom") {
    const perPerson = value.budget.scope === "total" ? value.budget.amount / people : value.budget.amount;
    if (perPerson < CUSTOM_BUDGET_LIMITS.minPerPerson) {
      ctx.addIssue({ code: "custom", path: ["budget"], message: "Budget trop faible." });
    }
  }
}) satisfies z.ZodType<TripRequest>;
