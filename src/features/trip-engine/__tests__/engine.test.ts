import { describe, expect, it } from "vitest";
import { addDays, todayIso } from "@/lib/dates";
import type { TravelPlan } from "@/types/travel-plan";
import type { TripRequest } from "@/types/trip";
import { demoDestinations } from "../data-source/demo";
import { buildGenericProfile } from "../data-source/generic";
import { generateTravelPlan } from "../generate-travel-plan";
import { analyzePreferences, detectWishStyles } from "../preferences";
import { rankDestinations } from "../scoring";

const departure = addDays(todayIso(), 30);
const tokyo = { id: "tokyo", name: "Tokyo", country: "Japon", countryCode: "JP" };

function request(overrides: Partial<TripRequest>): TripRequest {
  return {
    destination: { mode: "open" },
    dates: { mode: "flexible", preferredMonth: null },
    duration: { id: "5-7-jours", days: null },
    travelers: { adults: 2, children: 0 },
    budget: { mode: "range", rangeId: "500-800", scope: "per-person" },
    styles: ["ville"],
    ambiances: ["sociale"],
    priorities: ["prix"],
    wishes: null,
    ...overrides,
  };
}

const known = (id: string, name: string, country: string): TripRequest["destination"] => ({
  mode: "known",
  place: { id, name, country },
});

const periods = (plan: TravelPlan) => plan.itinerary.flatMap((d) => d.slots);
const categories = (plan: TravelPlan) =>
  periods(plan).flatMap((s) => (s.activity ? [s.activity.category] : []));

function expectCoherent(plan: TravelPlan) {
  const { breakdown, total } = plan.estimatedBudget;
  expect(Object.values(breakdown).reduce((a, b) => a + b, 0)).toBe(total);
  expect(plan.itinerary).toHaveLength(plan.duration.days);
  expect(plan.itinerary[0]!.title).toMatch(/Arrivée/);
  expect(plan.itinerary.at(-1)!.slots.at(-1)!.title).toBe("Retour");
  for (const day of plan.itinerary) {
    expect(day.slots.length).toBeGreaterThanOrEqual(3);
    expect(day.estimatedCostPerPerson).toBeGreaterThanOrEqual(0);
  }
  // Une activité non répétable n'apparaît qu'une fois.
  const ids = periods(plan).flatMap((s) => (s.activity ? [s.activity.id] : []));
  const repeated = ids.filter((id, i) => ids.indexOf(id) !== i);
  const repeatable = new Set(
    [...demoDestinations.flatMap((d) => d.activities), ...buildGenericProfile(tokyo).activities]
      .filter((a) => a.repeatable)
      .map((a) => a.id),
  );
  expect(repeated.filter((id) => !repeatable.has(id))).toEqual([]);
  expect(plan.reasons.length).toBeGreaterThan(0);
  expect(plan.highlights.length).toBeGreaterThan(0);
}

describe("analyse des préférences", () => {
  it("détecte les envies dans le texte libre", () => {
    expect(detectWishStyles("Je veux faire la fête et une plage à pied")).toEqual(
      expect.arrayContaining(["plage", "fete"]),
    );
    expect(detectWishStyles(null)).toEqual([]);
  });

  it("calcule la durée et le budget total du groupe", () => {
    const prefs = analyzePreferences(
      request({
        travelers: { adults: 3, children: 1 },
        budget: { mode: "custom", amount: 600, scope: "per-person" },
      }),
    );
    expect(prefs.days).toBe(6);
    expect(prefs.travelers).toBe(4);
    expect(prefs.budget.max).toBe(2400);
  });
});

describe("scénario 1 — destination précise, petit budget, voyage économique", () => {
  it("garde la destination, passe en économique et signale le budget serré", async () => {
    const plan = await generateTravelPlan(
      request({
        destination: known("lisbonne", "Lisbonne", "Portugal"),
        dates: { mode: "fixed", departureDate: departure, returnDate: addDays(departure, 3) },
        duration: { id: "3-4-jours", days: 4 },
        travelers: { adults: 1, children: 0 },
        budget: { mode: "range", rangeId: "moins-300", scope: "per-person" },
        styles: ["ville", "gastronomie"],
        ambiances: ["economique"],
        priorities: ["prix"],
      }),
    );
    expectCoherent(plan);
    expect(plan.destination.name).toBe("Lisbonne");
    expect(plan.destination.recommended).toBe(false);
    expect(plan.estimatedBudget.tier).toBe("eco");
    expect(plan.accommodation.type).toMatch(/Auberge/);
    expect(plan.itinerary[0]!.date).toBe(departure);
    expect(["tight", "over"]).toContain(plan.estimatedBudget.status);
    expect(plan.warnings.join(" ")).toMatch(/budget|Budget/);
    // Hors budget : OVO suggère des alternatives plus abordables.
    if (plan.estimatedBudget.status === "over") expect(plan.alternatives.length).toBeGreaterThan(0);
  });
});

describe("scénario 2 — pas de destination, plage + fête, budget moyen", () => {
  it("recommande une destination balnéaire et festive avec des soirées", async () => {
    const plan = await generateTravelPlan(
      request({
        styles: ["plage", "fete"],
        ambiances: ["festive", "sociale"],
        priorities: ["vie-nocturne", "plages"],
        budget: { mode: "range", rangeId: "500-800", scope: "per-person" },
      }),
    );
    expectCoherent(plan);
    expect(plan.destination.recommended).toBe(true);
    expect(["barcelone", "split"]).toContain(plan.destination.id);
    expect(categories(plan).filter((c) => c === "nightlife").length).toBeGreaterThanOrEqual(3);
    expect(categories(plan)).toContain("plage");
    expect(plan.estimatedBudget.status).not.toBe("over");
    expect(plan.alternatives.length).toBeGreaterThan(0);
  });
});

describe("scénario 3 — destination précise, culture, budget élevé", () => {
  it("met en avant musées et monuments en version confort", async () => {
    const plan = await generateTravelPlan(
      request({
        destination: known("rome", "Rome", "Italie"),
        duration: { id: "3-4-jours", days: null },
        budget: { mode: "range", rangeId: "plus-2000", scope: "per-person" },
        styles: ["culture", "gastronomie"],
        ambiances: ["luxueuse", "romantique"],
        priorities: ["culture", "confort"],
      }),
    );
    expectCoherent(plan);
    expect(plan.destination.name).toBe("Rome");
    expect(plan.estimatedBudget.tier).toBe("confort");
    expect(plan.estimatedBudget.status).toBe("within");
    const cultural = categories(plan).filter((c) => c === "musee" || c === "monument");
    expect(cultural.length).toBeGreaterThanOrEqual(2);
    expect(categories(plan)).not.toContain("nightlife");
    expect(plan.restaurants.some((r) => r.priceLevel === 3)).toBe(true);
  });
});

describe("scénario 4 — plusieurs voyageurs, durée longue", () => {
  it("gère le groupe, les enfants et plusieurs excursions", async () => {
    const plan = await generateTravelPlan(
      request({
        duration: { id: "1-2-semaines", days: null },
        travelers: { adults: 4, children: 2 },
        budget: { mode: "range", rangeId: "1200-2000", scope: "per-person" },
        styles: ["nature", "plage", "aventure"],
        ambiances: ["aventureuse"],
        priorities: ["activites", "nature"],
      }),
    );
    expectCoherent(plan);
    expect(plan.duration.days).toBe(10);
    expect(plan.travelers.total).toBe(6);
    expect(plan.accommodation.type).toMatch(/groupe|maison/i);
    expect(categories(plan).filter((c) => c === "excursion").length).toBeGreaterThanOrEqual(2);
    // Pas de sorties nocturnes avec des enfants.
    expect(categories(plan)).not.toContain("nightlife");
    // Le budget du groupe est cohérent avec le budget par personne.
    const { total, perPerson } = plan.estimatedBudget;
    expect(Math.abs(perPerson * 6 - total)).toBeLessThanOrEqual(60);
  });
});

describe("recommandations", () => {
  it("changent réellement selon les préférences", async () => {
    const culture = await generateTravelPlan(
      request({ styles: ["culture", "romantique"], ambiances: ["romantique"], priorities: ["culture"] }),
    );
    const party = await generateTravelPlan(
      request({
        styles: ["fete"],
        ambiances: ["festive", "economique"],
        priorities: ["prix", "vie-nocturne"],
      }),
    );
    const relax = await generateTravelPlan(
      request({
        styles: ["detente", "aventure"],
        ambiances: ["calme", "authentique"],
        priorities: ["nature"],
      }),
    );
    const ids = new Set([culture.destination.id, party.destination.id, relax.destination.id]);
    expect(ids.size).toBeGreaterThanOrEqual(2);
  });

  it("n'écarte jamais toutes les destinations, même avec un budget minuscule", () => {
    const prefs = analyzePreferences(
      request({
        duration: { id: "plus-2-semaines", days: null },
        budget: { mode: "range", rangeId: "moins-300", scope: "per-person" },
      }),
    );
    const ranking = rankDestinations(demoDestinations, prefs);
    expect(ranking).toHaveLength(demoDestinations.length);
    expect(ranking[0]!.profile.costLevel).toBeLessThanOrEqual(2);
  });

  it("est déterministe", async () => {
    const input = request({ styles: ["plage"], wishes: "Plage accessible à pied" });
    expect(await generateTravelPlan(input)).toEqual(await generateTravelPlan(input));
  });

  it("construit un programme type pour une destination hors catalogue", async () => {
    const plan = await generateTravelPlan(
      request({
        destination: {
          mode: "known",
          place: { id: "tokyo", name: "Tokyo", country: "Japon", countryCode: "JP" },
        },
      }),
    );
    expectCoherent(plan);
    expect(plan.destination.isGeneric).toBe(true);
    expect(plan.transport.toDestination.estimatedCostPerPerson).toBeGreaterThan(500);
    expect(plan.warnings.join(" ")).toMatch(/programme est un modèle/);
  });

  it("adapte le rythme : détente = moins d'activités par jour", async () => {
    const base = { destination: known("lisbonne", "Lisbonne", "Portugal") } as const;
    const relaxed = await generateTravelPlan(request({ ...base, styles: ["detente"], ambiances: ["calme"] }));
    const intense = await generateTravelPlan(
      request({
        ...base,
        styles: ["culture", "aventure"],
        ambiances: ["aventureuse"],
        priorities: ["activites"],
      }),
    );
    const count = (plan: TravelPlan) => periods(plan).filter((s) => s.activity).length;
    expect(count(relaxed)).toBeLessThan(count(intense));
  });
});
