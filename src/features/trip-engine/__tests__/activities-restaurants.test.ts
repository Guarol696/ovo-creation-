import { describe, expect, it } from "vitest";
import { addDays, todayIso } from "@/lib/dates";
import type { DayPeriod, TravelPlan } from "@/types/travel-plan";
import type { TripRequest } from "@/types/trip";
import { generateTravelPlan } from "../generate-travel-plan";

/**
 * Étape 5 — activités et restaurants : sélection selon le profil,
 * intégration au programme et au budget.
 */

const departure = addDays(todayIso(), 50);
const PERIOD_ORDER: DayPeriod[] = ["morning", "lunch", "afternoon", "evening", "night"];
const roundTo10 = (v: number) => Math.round(v / 10) * 10;

function request(overrides: Partial<TripRequest>): TripRequest {
  return {
    destination: { mode: "open" },
    dates: { mode: "flexible", preferredMonth: null },
    duration: { id: "3-4-jours", days: null },
    travelers: { adults: 2, children: 0 },
    budget: { mode: "range", rangeId: "500-800", scope: "per-person" },
    styles: ["ville"],
    ambiances: ["sociale"],
    priorities: [],
    wishes: null,
    ...overrides,
  } as TripRequest;
}

const known = (id: string, name: string, country: string): TripRequest["destination"] => ({
  mode: "known",
  place: { id, name, country },
});

const slots = (plan: TravelPlan) =>
  plan.itinerary.flatMap((d) => d.slots.map((s) => ({ ...s, day: d.dayNumber })));
const scheduled = <T extends { schedule: unknown[] }>(items: T[]) =>
  items.filter((i) => i.schedule.length > 0);

/** Programme, listes et budget racontent la même histoire. */
function expectCoherence(plan: TravelPlan) {
  const activityIds = new Set(plan.activities.map((a) => a.id));
  const restaurantIds = new Set(plan.restaurants.map((r) => r.id));
  const allSlots = slots(plan);

  // 1. Chaque élément du programme vient des listes du TravelPlan, et inversement.
  for (const slot of allSlots) {
    if (slot.activity) {
      expect(activityIds.has(slot.activity.id)).toBe(true);
      const ref = plan.activities.find((a) => a.id === slot.activity!.id)!;
      expect(ref.schedule).toContainEqual({ dayNumber: slot.day, period: slot.period });
    }
    if (slot.restaurant) {
      expect(restaurantIds.has(slot.restaurant.id)).toBe(true);
      const ref = plan.restaurants.find((r) => r.id === slot.restaurant!.id)!;
      expect(ref.schedule).toContainEqual({ dayNumber: slot.day, period: slot.period });
    }
  }
  const scheduledRefs =
    plan.activities.reduce((n, a) => n + a.schedule.length, 0) +
    plan.restaurants.reduce((n, r) => n + r.schedule.length, 0);
  const slotRefs = allSlots.reduce((n, s) => n + (s.activity ? 1 : 0) + (s.restaurant ? 1 : 0), 0);
  expect(scheduledRefs).toBe(slotRefs);

  // 2. Ordre des moments dans chaque journée.
  for (const day of plan.itinerary) {
    const order = day.slots.map((s) => PERIOD_ORDER.indexOf(s.period));
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  }

  // 3. Budget alimenté par les activités et les repas du programme.
  const { breakdown, details } = plan.estimatedBudget;
  const eaters = plan.travelers.adults + plan.travelers.children * 0.7;
  const activitiesPP = allSlots.reduce((sum, s) => sum + (s.activity?.estimatedCostPerPerson ?? 0), 0);
  const mealSlots = allSlots.filter((s) => s.period === "lunch" || (s.period === "evening" && s.restaurant));
  const mealsPP = mealSlots.reduce(
    (sum, s) => sum + (s.restaurant?.estimatedCostPerPerson ?? s.estimatedCostPerPerson),
    0,
  );
  expect(details.activitiesPerPerson).toBe(activitiesPP);
  expect(details.mealsPerPerson).toBe(mealsPP);
  expect(details.mealsCount).toBe(mealSlots.length);
  expect(breakdown.activities).toBe(roundTo10(activitiesPP * eaters));
  expect(breakdown.food).toBe(roundTo10((mealsPP + details.snacksPerPerson) * eaters));
  expect(Object.values(breakdown).reduce((a, b) => a + b, 0)).toBe(plan.estimatedBudget.total);

  // 4. Données de démonstration clairement fictives et complètes.
  for (const r of plan.restaurants) {
    expect(r.name).toMatch(/OVO/);
    expect(r.rating).toBeGreaterThanOrEqual(4);
    expect(r.rating).toBeLessThanOrEqual(5);
    expect(r.priceRange.min).toBeLessThan(r.priceRange.max);
    expect(r.cuisine.length).toBeGreaterThan(0);
    expect(r.area).toBeTruthy();
    expect(["demo", "generic"]).toContain(r.source);
  }
  for (const a of plan.activities) {
    expect(a.durationLabel.length).toBeGreaterThan(0);
    expect(a.priceLevel).toBe(a.estimatedCostPerPerson === 0 ? 0 : a.priceLevel);
    expect(["demo", "generic"]).toContain(a.source);
  }
}

describe("test 1 — voyage petit budget", () => {
  it("street food et adresses à petit prix, activités abordables", async () => {
    const plan = await generateTravelPlan(
      request({
        destination: known("lisbonne", "Lisbonne", "Portugal"),
        travelers: { adults: 1, children: 0 },
        budget: { mode: "range", rangeId: "moins-300", scope: "per-person" },
        ambiances: ["economique"],
        priorities: ["prix"],
      }),
    );
    expectCoherence(plan);
    expect(plan.restaurants[0]!.kind).toBe("street-food");
    expect(scheduled(plan.restaurants).every((r) => r.priceLevel <= 2)).toBe(true);
    expect(scheduled(plan.restaurants).some((r) => r.priceLevel === 3)).toBe(false);
    expect(plan.activities.some((a) => a.estimatedCostPerPerson === 0)).toBe(true);
  });
});

describe("test 2 — voyage haut de gamme", () => {
  it("table gastronomique au dîner et activités premium", async () => {
    const plan = await generateTravelPlan(
      request({
        destination: known("rome", "Rome", "Italie"),
        budget: { mode: "range", rangeId: "plus-2000", scope: "per-person" },
        styles: ["gastronomie", "culture"],
        ambiances: ["luxueuse"],
        priorities: ["confort"],
      }),
    );
    expectCoherence(plan);
    expect(plan.estimatedBudget.tier).toBe("confort");
    expect(plan.restaurants[0]!.kind).toBe("gastronomique");
    const gastro = plan.restaurants.find((r) => r.kind === "gastronomique")!;
    expect(gastro.schedule.some((s) => s.period === "evening")).toBe(true);
  });
});

describe("test 3 — style nightlife", () => {
  it("sorties en tête et une sortie la nuit presque chaque soir", async () => {
    const plan = await generateTravelPlan(
      request({
        destination: known("barcelone", "Barcelone", "Espagne"),
        styles: ["fete"],
        ambiances: ["festive"],
        priorities: ["vie-nocturne"],
      }),
    );
    expectCoherence(plan);
    expect(plan.activities[0]!.theme).toBe("sorties");
    const nights = slots(plan).filter((s) => s.period === "night");
    expect(nights.length).toBeGreaterThanOrEqual(plan.duration.days - 2);
    expect(nights.every((s) => s.activity)).toBe(true);
  });
});

describe("test 4 — style nature", () => {
  it("parcs, randonnées, plages et points de vue en priorité", async () => {
    const plan = await generateTravelPlan(
      request({
        destination: known("split", "Split", "Croatie"),
        duration: { id: "5-7-jours", days: null },
        styles: ["nature", "aventure"],
        ambiances: ["aventureuse"],
        priorities: ["nature"],
      }),
    );
    expectCoherence(plan);
    expect(plan.activities.slice(0, 4).every((a) => ["nature", "aventure"].includes(a.theme))).toBe(true);
    const natureScheduled = scheduled(plan.activities).filter((a) =>
      ["nature", "aventure"].includes(a.theme),
    );
    expect(natureScheduled.length).toBeGreaterThanOrEqual(3);
    expect(slots(plan).some((s) => s.period === "night")).toBe(false);
  });
});

describe("test 5 — style culture", () => {
  it("musées, monuments et quartiers historiques", async () => {
    const plan = await generateTravelPlan(
      request({
        destination: known("rome", "Rome", "Italie"),
        styles: ["culture"],
        ambiances: ["authentique"],
        priorities: ["culture"],
      }),
    );
    expectCoherence(plan);
    expect(plan.activities.slice(0, 3).every((a) => a.theme === "culture")).toBe(true);
    const culture = scheduled(plan.activities).filter((a) => a.theme === "culture");
    expect(culture.length).toBeGreaterThanOrEqual(4);
    expect(culture.map((a) => a.id)).toEqual(expect.arrayContaining(["colisee", "vatican"]));
  });
});

describe("test 6 — plusieurs voyageurs", () => {
  it("famille : pas de sorties nocturnes, montants multipliés correctement", async () => {
    const plan = await generateTravelPlan(
      request({
        destination: known("barcelone", "Barcelone", "Espagne"),
        travelers: { adults: 3, children: 1 },
        styles: ["fete", "plage"],
        ambiances: ["festive"],
      }),
    );
    expectCoherence(plan);
    expect(plan.activities.some((a) => a.category === "nightlife")).toBe(false);
    expect(slots(plan).some((s) => s.period === "night")).toBe(false);
    // 3 adultes + 1 enfant (tarif réduit) : 3,7 « parts ».
    const { activities } = plan.estimatedBudget.breakdown;
    expect(activities).toBe(roundTo10(plan.estimatedBudget.details.activitiesPerPerson * 3.7));
  });
});

describe("test 7 — voyage de 2 jours", () => {
  it("arrivée, un dîner, départ : 3 repas", async () => {
    const plan = await generateTravelPlan(
      request({
        destination: known("prague", "Prague", "Tchéquie"),
        dates: { mode: "fixed", departureDate: departure, returnDate: addDays(departure, 1) },
        duration: { id: "weekend", days: 2 },
      }),
    );
    expectCoherence(plan);
    expect(plan.itinerary).toHaveLength(2);
    expect(plan.estimatedBudget.details.mealsCount).toBe(3);
    expect(plan.itinerary[1]!.slots.some((s) => s.period === "evening")).toBe(false);
    expect(scheduled(plan.activities).every((a) => a.schedule.length === 1)).toBe(true);
  });
});

describe("test 8 — voyage de 7 jours", () => {
  it("excursions, déjeuner chaque jour et peu de répétitions", async () => {
    const plan = await generateTravelPlan(
      request({
        destination: known("lisbonne", "Lisbonne", "Portugal"),
        dates: { mode: "fixed", departureDate: departure, returnDate: addDays(departure, 6) },
        duration: { id: "5-7-jours", days: 7 },
        styles: ["culture", "plage", "gastronomie"],
      }),
    );
    expectCoherence(plan);
    expect(plan.itinerary).toHaveLength(7);
    expect(plan.itinerary.every((d) => d.slots.some((s) => s.period === "lunch"))).toBe(true);
    expect(slots(plan).filter((s) => s.activity?.fullDay).length).toBeGreaterThanOrEqual(1);
    for (const a of plan.activities) {
      expect(a.schedule.length).toBeLessThanOrEqual(a.repeatable ? 2 : 1);
    }
    // Les restaurants tournent : pas le même dîner tous les soirs.
    const dinners = slots(plan).filter((s) => s.period === "evening" && s.restaurant);
    expect(new Set(dinners.map((s) => s.restaurant!.id)).size).toBeGreaterThanOrEqual(3);
  });
});
