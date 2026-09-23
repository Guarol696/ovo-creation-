import { describe, expect, it } from "vitest";
import { addDays, todayIso } from "@/lib/dates";
import type { TravelPlan } from "@/types/travel-plan";
import type { TripRequest } from "@/types/trip";
import { generateTravelPlan } from "../generate-travel-plan";

/**
 * Étape 4 — transport, hébergement et budget intégré.
 * Vérifie la cohérence des montants entre les cartes et le budget.
 */

const departure = addDays(todayIso(), 45);

function request(overrides: Partial<TripRequest>): TripRequest {
  return {
    destination: { mode: "open" },
    dates: { mode: "flexible", preferredMonth: null },
    duration: { id: "5-7-jours", days: null },
    travelers: { adults: 2, children: 0 },
    budget: { mode: "range", rangeId: "500-800", scope: "per-person" },
    styles: ["ville"],
    ambiances: ["sociale"],
    priorities: [],
    wishes: null,
    ...overrides,
  } as TripRequest;
}

const known = (
  id: string,
  name: string,
  country: string,
  countryCode?: string,
): TripRequest["destination"] => ({
  mode: "known",
  place: { id, name, country, countryCode },
});

/** Les montants du budget reprennent exactement ceux des cartes. */
function expectBudgetConsistency(plan: TravelPlan) {
  const { breakdown, total, perPerson } = plan.estimatedBudget;
  const people = plan.travelers.total;
  const { main, local } = plan.transport;

  expect(breakdown.accommodation).toBe(plan.accommodation.main.estimatedTotal);
  expect(breakdown.transport).toBe(
    main.estimatedRoundTripTotal + local.estimatedCostPerDayPerPerson * plan.duration.days * people,
  );
  expect(Object.values(breakdown).reduce((a, b) => a + b, 0)).toBe(total);
  expect(perPerson).toBe(Math.round(total / people));

  // Cartes : prix cohérents entre nuit, séjour, personne et groupe.
  const acc = plan.accommodation.main;
  expect(acc.estimatedTotal).toBe(acc.estimatedPricePerNight * acc.nights);
  expect(acc.nights).toBe(Math.max(1, plan.duration.nights));
  expect(acc.guests).toBe(people);
  expect(
    Math.abs(main.estimatedRoundTripPerPerson * people - main.estimatedRoundTripTotal),
  ).toBeLessThanOrEqual(people);

  // Toujours des données de démonstration clairement identifiées.
  expect(["demo", "generic"]).toContain(plan.transport.source);
  expect(["demo", "generic"]).toContain(plan.accommodation.source);
  expect(acc.name).toMatch(/OVO/);
  expect(acc.rating).toBeGreaterThanOrEqual(4);
  expect(acc.rating).toBeLessThanOrEqual(5);
  expect(plan.transport.local.options.length).toBeGreaterThan(0);
  for (const alt of plan.accommodation.alternatives) expect(alt.type).not.toBe(acc.type);
  for (const alt of plan.transport.alternatives) expect(alt.mode).not.toBe(main.mode);
}

describe("test 1 — destination connue + petit budget", () => {
  it("Lisbonne en solo : avion, auberge de jeunesse, budget cohérent", async () => {
    const plan = await generateTravelPlan(
      request({
        destination: known("lisbonne", "Lisbonne", "Portugal", "PT"),
        dates: { mode: "fixed", departureDate: departure, returnDate: addDays(departure, 3) },
        duration: { id: "3-4-jours", days: 4 },
        travelers: { adults: 1, children: 0 },
        budget: { mode: "range", rangeId: "moins-300", scope: "per-person" },
        ambiances: ["economique"],
        priorities: ["prix"],
      }),
    );
    expectBudgetConsistency(plan);
    expect(plan.transport.main.mode).toBe("avion");
    expect(plan.transport.main.from).toBe("Paris");
    expect(plan.transport.main.to).toBe("Lisbonne");
    expect(plan.accommodation.main.type).toBe("auberge");
    expect(plan.accommodation.main.nights).toBe(3);
    expect(plan.estimatedBudget.tier).toBe("eco");
  });
});

describe("test 2 — destination connue + gros budget", () => {
  it("Londres à deux : train, hôtel confort avec services", async () => {
    const plan = await generateTravelPlan(
      request({
        destination: known("londres", "Londres", "Royaume-Uni", "GB"),
        duration: { id: "3-4-jours", days: null },
        budget: { mode: "range", rangeId: "plus-2000", scope: "per-person" },
        styles: ["culture", "shopping"],
        ambiances: ["luxueuse"],
        priorities: ["confort"],
      }),
    );
    expectBudgetConsistency(plan);
    expect(plan.transport.main.mode).toBe("train");
    expect(plan.transport.alternatives.map((a) => a.mode)).toContain("avion");
    expect(plan.accommodation.main.type).toBe("hotel");
    expect(plan.accommodation.main.tier).toBe("confort");
    expect(plan.accommodation.main.amenities).toEqual(expect.arrayContaining(["Petit-déjeuner", "Spa"]));
    expect(plan.estimatedBudget.status).toBe("within");
  });
});

describe("test 3 — destination inconnue", () => {
  it("destination française hors catalogue : le train est privilégié", async () => {
    const plan = await generateTravelPlan(
      request({
        destination: {
          mode: "known",
          place: { id: "nice", name: "Nice", country: "France", countryCode: "FR" },
        },
      }),
    );
    expectBudgetConsistency(plan);
    expect(plan.destination.isGeneric).toBe(true);
    expect(plan.transport.main.mode).toBe("train");
    expect(plan.transport.source).toBe("generic");
  });

  it("destination libre lointaine : avion avec escale possible", async () => {
    const plan = await generateTravelPlan(
      request({
        destination: {
          mode: "known",
          place: { id: "custom:bali", name: "Bali", country: "Indonésie", countryCode: "ID" },
        },
      }),
    );
    expectBudgetConsistency(plan);
    expect(plan.transport.main.mode).toBe("avion");
    expect(plan.transport.main.estimatedRoundTripPerPerson).toBeGreaterThan(500);
  });

  it("destination non choisie : OVO recommande et chiffre le transport", async () => {
    const plan = await generateTravelPlan(request({ styles: ["plage", "fete"], ambiances: ["festive"] }));
    expectBudgetConsistency(plan);
    expect(plan.destination.recommended).toBe(true);
    expect(plan.transport.main.to).toBe(plan.destination.name);
  });
});

describe("test 4 — plusieurs voyageurs", () => {
  it("5 amis vers Amsterdam : voiture partagée ou train, appartement", async () => {
    const plan = await generateTravelPlan(
      request({
        destination: known("amsterdam", "Amsterdam", "Pays-Bas", "NL"),
        travelers: { adults: 5, children: 0 },
        budget: { mode: "range", rangeId: "300-500", scope: "per-person" },
        priorities: ["prix"],
      }),
    );
    expectBudgetConsistency(plan);
    expect(plan.transport.main.mode).toBe("voiture");
    // Une voiture pour 5 : le prix par personne est le coût du véhicule divisé.
    expect(plan.transport.main.estimatedRoundTripTotal).toBe(180);
    expect(plan.accommodation.main.type).toBe("appartement");
    expect(plan.accommodation.main.capacityLabel).toMatch(/Logement entier/);
  });

  it("famille avec enfants : pas d'auberge, total groupe cohérent", async () => {
    const plan = await generateTravelPlan(
      request({
        destination: known("rome", "Rome", "Italie", "IT"),
        travelers: { adults: 2, children: 2 },
        styles: ["culture"],
      }),
    );
    expectBudgetConsistency(plan);
    expect([plan.accommodation.main, ...plan.accommodation.alternatives].map((o) => o.type)).not.toContain(
      "auberge",
    );
    expect(plan.estimatedBudget.perPerson * 4).toBeGreaterThan(plan.estimatedBudget.total - 4);
  });

  it("sans voiture en solo", async () => {
    const plan = await generateTravelPlan(
      request({
        destination: known("amsterdam", "Amsterdam", "Pays-Bas", "NL"),
        travelers: { adults: 1, children: 0 },
      }),
    );
    expectBudgetConsistency(plan);
    expect([plan.transport.main, ...plan.transport.alternatives].map((o) => o.mode)).not.toContain("voiture");
  });
});

describe("test 5 — voyage court", () => {
  it("week-end de 2 jours : 1 nuit, hôtel, budget cohérent", async () => {
    const plan = await generateTravelPlan(
      request({
        destination: known("prague", "Prague", "Tchéquie", "CZ"),
        dates: { mode: "fixed", departureDate: departure, returnDate: addDays(departure, 1) },
        duration: { id: "weekend", days: 2 },
        priorities: ["rapidite"],
      }),
    );
    expectBudgetConsistency(plan);
    expect(plan.duration).toEqual({ days: 2, nights: 1 });
    expect(plan.accommodation.main.nights).toBe(1);
    expect(plan.accommodation.main.type).toBe("hotel");
    expect(plan.transport.main.mode).toBe("avion");
  });
});

describe("test 6 — voyage long", () => {
  it("plus de 2 semaines : appartement, séjour chiffré sur toutes les nuits", async () => {
    const plan = await generateTravelPlan(
      request({
        destination: known("marrakech", "Marrakech", "Maroc", "MA"),
        duration: { id: "plus-2-semaines", days: null },
        budget: { mode: "range", rangeId: "1200-2000", scope: "per-person" },
        styles: ["detente", "culture"],
      }),
    );
    expectBudgetConsistency(plan);
    expect(plan.duration.days).toBe(16);
    expect(plan.accommodation.main.nights).toBe(15);
    expect(plan.accommodation.main.type).toBe("appartement");
    expect(plan.itinerary).toHaveLength(16);
  });
});

describe("cohérence du choix de transport", () => {
  it("privilégie la vitesse si demandé, l'économie sinon", async () => {
    const base = {
      destination: known("amsterdam", "Amsterdam", "Pays-Bas", "NL"),
      travelers: { adults: 1, children: 0 },
    };
    const fast = await generateTravelPlan(request({ ...base, priorities: ["rapidite"] }));
    const cheap = await generateTravelPlan(
      request({ ...base, priorities: ["prix"], ambiances: ["economique"] }),
    );
    const neutral = await generateTravelPlan(request(base));
    expect(neutral.transport.main.mode).toBe("train");
    expect(cheap.transport.main.mode).toBe("bus");
    expect(cheap.transport.main.estimatedRoundTripPerPerson).toBeLessThan(
      fast.transport.main.estimatedRoundTripPerPerson,
    );
  });

  it("Lisbonne et Barcelone : avion", async () => {
    for (const [id, name, country] of [
      ["lisbonne", "Lisbonne", "Portugal"],
      ["barcelone", "Barcelone", "Espagne"],
    ] as const) {
      const plan = await generateTravelPlan(request({ destination: known(id, name, country) }));
      expect(plan.transport.main.mode).toBe("avion");
    }
  });
});
