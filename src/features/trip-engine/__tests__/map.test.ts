import { describe, expect, it } from "vitest";
import { addDays, todayIso } from "@/lib/dates";
import type { TravelPlan } from "@/types/travel-plan";
import type { TripRequest } from "@/types/trip";
import { generateTravelPlan } from "../generate-travel-plan";
import { distanceKm, estimateLeg, HOTEL_LOCATION_ID } from "../locations";

/** Étape 6 — lieux de la carte, horaires et trajets entre étapes. */

const departure = addDays(todayIso(), 60);

function request(overrides: Partial<TripRequest>): TripRequest {
  return {
    destination: { mode: "known", place: { id: "lisbonne", name: "Lisbonne", country: "Portugal" } },
    dates: { mode: "flexible", preferredMonth: null },
    duration: { id: "3-4-jours", days: null },
    travelers: { adults: 2, children: 0 },
    budget: { mode: "range", rangeId: "500-800", scope: "per-person" },
    styles: ["culture", "gastronomie"],
    ambiances: ["authentique"],
    priorities: [],
    wishes: null,
    ...overrides,
  } as TripRequest;
}

const toMinutes = (time: string) => {
  const [h, m] = time.replace(" h", ":").replace(/\s/g, "").split(":");
  return Number(h) * 60 + (m ? Number(m) : 0);
};

function expectMapCoherence(plan: TravelPlan) {
  const { map } = plan;
  expect(map.available).toBe(true);
  const byId = new Map(map.locations.map((l) => [l.id, l]));
  expect(byId.size).toBe(map.locations.length); // identifiants uniques

  // Tous les lieux sont proches de la destination (excursions comprises).
  for (const location of map.locations) {
    expect(distanceKm(location.point, map.center!)).toBeLessThan(120);
    expect(location.name.length).toBeGreaterThan(0);
    expect(location.description.length).toBeGreaterThan(0);
    expect(["demo", "generic"]).toContain(location.source);
  }
  // Un seul hébergement.
  expect(map.locations.filter((l) => l.category === "accommodation")).toHaveLength(1);

  for (const day of plan.itinerary) {
    let previousStart = -1;
    for (const slot of day.slots) {
      // Chaque étape localisée pointe vers un lieu existant, associé au bon jour.
      if (slot.locationId) {
        const location = byId.get(slot.locationId);
        expect(location).toBeDefined();
        if (slot.locationId !== HOTEL_LOCATION_ID) expect(location!.dayNumbers).toContain(day.dayNumber);
      }
      if (slot.activity) expect(slot.locationId).toBe(`activity:${slot.activity.id}`);
      // Horaires croissants dans la journée.
      if (slot.startTime) {
        const start = toMinutes(slot.startTime);
        expect(start).toBeGreaterThan(previousStart);
        previousStart = start;
      }
      if (slot.legFromPrevious) {
        expect(slot.legFromPrevious.distanceKm).toBeGreaterThanOrEqual(0);
        expect(slot.legFromPrevious.minutes).toBeGreaterThanOrEqual(5);
      }
    }
  }

  // Les jours des lieux correspondent au programme.
  for (const location of map.locations.filter((l) => l.category === "activity")) {
    for (const d of location.dayNumbers) {
      expect(plan.itinerary[d - 1]!.slots.some((s) => s.locationId === location.id)).toBe(true);
    }
  }
}

describe("trajets estimés", () => {
  it("à pied en ville, transports au-delà de 2 km, route pour les excursions", () => {
    const hotel = { lat: 38.7105, lng: -9.1405 };
    expect(estimateLeg(hotel, { lat: 38.7118, lng: -9.1302 }).mode).toBe("walk"); // ~900 m
    expect(estimateLeg(hotel, { lat: 38.6979, lng: -9.2066 }).mode).toBe("transit"); // Belém ~6 km
    const sintra = estimateLeg(hotel, { lat: 38.7979, lng: -9.3906 });
    expect(sintra.mode).toBe("road");
    expect(sintra.distanceKm).toBeGreaterThan(20);
  });
});

describe("test 1 — voyage de 2 jours", () => {
  it("hébergement, lieux du jour 1 et trajets calculés", async () => {
    const plan = await generateTravelPlan(
      request({
        dates: { mode: "fixed", departureDate: departure, returnDate: addDays(departure, 1) },
        duration: { id: "weekend", days: 2 },
      }),
    );
    expectMapCoherence(plan);
    expect(plan.itinerary[0]!.slots[0]!.locationId).toBe(HOTEL_LOCATION_ID);
    const legs = plan.itinerary.flatMap((d) => d.slots).filter((s) => s.legFromPrevious);
    expect(legs.length).toBeGreaterThan(0);
  });
});

describe("test 2 — voyage de 7 jours", () => {
  it("chaque jour a ses lieux, l'excursion est un trajet par la route", async () => {
    const plan = await generateTravelPlan(
      request({
        dates: { mode: "fixed", departureDate: departure, returnDate: addDays(departure, 6) },
        duration: { id: "5-7-jours", days: 7 },
        styles: ["culture", "nature"],
      }),
    );
    expectMapCoherence(plan);
    for (const day of plan.itinerary.slice(0, -1)) {
      expect(day.slots.some((s) => s.locationId && s.locationId !== HOTEL_LOCATION_ID)).toBe(true);
    }
    const excursion = plan.itinerary.flatMap((d) => d.slots).find((s) => s.activity?.fullDay);
    expect(excursion?.legFromPrevious?.mode).toBe("road");
  });
});

describe("tests 3 & 4 — plusieurs activités et restaurants", () => {
  it("activités programmées, idées hors programme et restaurants sur la carte", async () => {
    const plan = await generateTravelPlan(request({ duration: { id: "5-7-jours", days: null } }));
    expectMapCoherence(plan);
    const count = (category: string) => plan.map.locations.filter((l) => l.category === category).length;
    expect(count("activity")).toBeGreaterThanOrEqual(5);
    expect(count("restaurant")).toBe(plan.restaurants.length);
    expect(count("poi")).toBeGreaterThan(0);
    // Les lieux connus sont marqués comme tels, les restaurants fictifs comme approximatifs.
    expect(plan.map.locations.find((l) => l.refId === "belem")?.precision).toBe("landmark");
    expect(
      plan.map.locations
        .filter((l) => l.category === "restaurant")
        .every((l) => l.precision === "approximate"),
    ).toBe(true);
  });

  it("toutes les destinations de démo ont une carte cohérente", async () => {
    for (const [id, name, country] of [
      ["barcelone", "Barcelone", "Espagne"],
      ["rome", "Rome", "Italie"],
      ["amsterdam", "Amsterdam", "Pays-Bas"],
      ["marrakech", "Marrakech", "Maroc"],
      ["londres", "Londres", "Royaume-Uni"],
      ["prague", "Prague", "Tchéquie"],
      ["budapest", "Budapest", "Hongrie"],
      ["athenes", "Athènes", "Grèce"],
      ["split", "Split", "Croatie"],
    ] as const) {
      const plan = await generateTravelPlan(
        request({ destination: { mode: "known", place: { id, name, country } } }),
      );
      expectMapCoherence(plan);
      // Aucun lieu « approximatif » faute de coordonnées : tous les lieux connus sont géolocalisés.
      const unplacedKnown = plan.map.locations.filter(
        (l) => (l.category === "activity" || l.category === "poi") && l.precision === "approximate",
      );
      expect(unplacedKnown).toEqual([]);
    }
  });
});

describe("destination sans coordonnées", () => {
  it("programme type : pas de carte, horaires quand même", async () => {
    const plan = await generateTravelPlan(
      request({
        destination: { mode: "known", place: { id: "custom:tbilissi", name: "Tbilissi", country: "" } },
      }),
    );
    expect(plan.map.available).toBe(false);
    expect(plan.map.locations).toEqual([]);
    expect(plan.itinerary.flatMap((d) => d.slots).some((s) => s.startTime)).toBe(true);
    expect(plan.itinerary.flatMap((d) => d.slots).some((s) => s.legFromPrevious)).toBe(false);
  });
});
