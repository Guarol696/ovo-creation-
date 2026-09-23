import { describe, expect, it } from "vitest";
import { generateTravelPlan } from "@/features/trip-engine";
import { addDays, todayIso } from "@/lib/dates";
import type { TripRequest } from "@/types/trip";
import {
  flagEmoji,
  formatDateRange,
  formatTripDates,
  isUsablePlan,
  planToRow,
  rowToSummary,
} from "../mapping";
import { requestHash } from "../server/repository";

const departure = addDays(todayIso(), 45);
const request = {
  destination: {
    mode: "known",
    place: { id: "lisbonne", name: "Lisbonne", country: "Portugal", countryCode: "PT" },
  },
  dates: { mode: "fixed", departureDate: departure, returnDate: addDays(departure, 4) },
  duration: { id: "5-7-jours", days: 5 },
  travelers: { adults: 2, children: 0 },
  budget: { mode: "range", rangeId: "500-800", scope: "per-person" },
  styles: ["culture"],
  ambiances: ["authentique"],
  priorities: ["culture"],
  wishes: null,
} as TripRequest;

describe("voyages sauvegardés : conversion", () => {
  it("dérive les colonnes d'affichage du TravelPlan", async () => {
    const plan = await generateTravelPlan(request);
    const row = planToRow(plan, "hash");
    expect(row).toMatchObject({
      title: "Voyage à Lisbonne",
      destination: "Lisbonne",
      country: "Portugal",
      start_date: departure,
      end_date: addDays(departure, 4),
      duration: 5,
      travelers: 2,
      budget: Math.round(plan.estimatedBudget.total),
      request_hash: "hash",
    });
    expect(row.travel_plan).toBe(plan);
    // Le plan enregistré (JSON) se relit tel quel, sans nouvelle génération.
    expect(isUsablePlan(JSON.parse(JSON.stringify(plan)))).toBe(true);
  });

  it("l'« envie particulière » (texte libre) n'est jamais stockée dans le plan", async () => {
    const plan = await generateTravelPlan({ ...request, wishes: "Anniversaire surprise de Léa" });
    const row = planToRow(plan, "hash");
    expect(row.request.wishes).toBe("Anniversaire surprise de Léa"); // colonne privée
    expect(row.travel_plan.request.wishes).toBeNull();
    expect(JSON.stringify(row.travel_plan)).not.toContain("Léa");
  });

  it("empreinte stable : même demande = même empreinte", () => {
    expect(requestHash(request)).toBe(requestHash(JSON.parse(JSON.stringify(request))));
    expect(requestHash(request)).not.toBe(requestHash({ ...request, styles: ["nature"] }));
  });

  it("plans incomplets ou anciens détectés", () => {
    expect(isUsablePlan(null)).toBe(false);
    expect(isUsablePlan({ version: 1, destination: { name: "X" } })).toBe(false);
    expect(isUsablePlan("plan")).toBe(false);
  });
});

describe("voyages sauvegardés : affichage des cartes", () => {
  const now = new Date(2026, 8, 23);

  it("drapeaux", () => {
    expect(flagEmoji("PT")).toBe("🇵🇹");
    expect(flagEmoji(null)).toBe("🌍");
    expect(flagEmoji("xyz")).toBe("🌍");
  });

  it("plages de dates", () => {
    expect(formatDateRange("2026-06-12", "2026-06-17", now)).toBe("12 → 17 juin");
    expect(formatDateRange("2026-06-28", "2026-07-03", now)).toBe("28 juin → 3 juil.");
    expect(formatDateRange("2027-01-02", "2027-01-05", now)).toBe("2 → 5 janv. 2027");
  });

  it("dates flexibles", () => {
    const flexible = { ...request, dates: { mode: "flexible", preferredMonth: "2026-10" } } as TripRequest;
    expect(formatTripDates({ start_date: null, end_date: null, request: flexible }, now)).toBe(
      "Dates flexibles · octobre 2026",
    );
  });

  it("résumé de carte", () => {
    const summary = rowToSummary(
      {
        id: "1",
        title: "Voyage à Lisbonne",
        destination: "Lisbonne",
        country: "Portugal",
        country_code: "PT",
        start_date: "2026-06-12",
        end_date: "2026-06-17",
        duration: 6,
        travelers: 2,
        budget: 780,
        request,
        travel_plan: null,
        is_public: true,
        share_token: "7b1f0c9e-2d7a-4f55-9d8e-1a2b3c4d5e6f",
        shared_at: "2026-09-23T10:00:00Z",
        share_expires_at: null,
        created_at: "2026-09-23T10:00:00Z",
        updated_at: "2026-09-23T10:00:00Z",
      },
      now,
    );
    expect(summary).toMatchObject({
      flag: "🇵🇹",
      dates: "12 → 17 juin",
      budget: 780,
      travelers: 2,
      isPublic: true,
    });
  });
});
