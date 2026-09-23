import { describe, expect, it } from "vitest";
import { fromTripRequest } from "@/features/trip-builder/from-trip-request";
import { toTripRequest } from "@/features/trip-builder/to-trip-request";
import { tripRequestSchema } from "@/features/trip-builder/schema";
import { addDays, todayIso } from "@/lib/dates";
import type { TripRequest } from "@/types/trip";
import { decodeTripRequestParam, encodeTripRequest } from "../request-codec";

const departure = addDays(todayIso(), 20);
const request: TripRequest = {
  destination: {
    mode: "known",
    place: { id: "seville", name: "Séville", country: "Espagne", countryCode: "ES" },
  },
  dates: { mode: "fixed", departureDate: departure, returnDate: addDays(departure, 4) },
  duration: { id: "5-7-jours", days: 5 },
  travelers: { adults: 2, children: 1 },
  budget: { mode: "custom", amount: 1950, scope: "total" },
  styles: ["culture", "fete"],
  ambiances: ["festive"],
  priorities: ["prix"],
  wishes: "Tapas, flamenco et « siestes » 😴",
};

describe("encodage de la demande dans l'URL", () => {
  it("fait l'aller-retour sans perte (accents, emojis)", () => {
    const encoded = encodeTripRequest(request);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeTripRequestParam(encoded)).toEqual(request);
    expect(tripRequestSchema.safeParse(decodeTripRequestParam(encoded)).success).toBe(true);
  });

  it("rejette les valeurs abîmées ou malveillantes", () => {
    expect(decodeTripRequestParam("")).toBeNull();
    expect(decodeTripRequestParam("pas du base64 !")).toBeNull();
    expect(decodeTripRequestParam("a".repeat(7000))).toBeNull();
    expect(
      tripRequestSchema.safeParse(decodeTripRequestParam(encodeTripRequest({ ...request, styles: [] })))
        .success,
    ).toBe(false);
  });

  it("reconstruit le questionnaire à l'identique (« Modifier mon voyage »)", () => {
    expect(toTripRequest(fromTripRequest(request))).toEqual(request);
  });
});
