import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { FEATURES, featuresOf, PLAN_LIMITS, planIncludes, type FeatureId } from "@/config/premium";
import { generateTravelPlan } from "@/features/trip-engine";
import { buildTripPdf } from "@/features/trip-export/build-trip-pdf";
import { buildChecklist } from "@/features/trip-export/checklist";
import { tripPdfFilename } from "@/features/trip-export/filename";
import { tripPdfUrl } from "@/features/trip-export/pdf-url";
import { addDays, todayIso } from "@/lib/dates";
import type { TripRequest } from "@/types/trip";
import { resolveEntitlements, type SubscriptionRow } from "../plan";

const now = new Date("2026-09-24T12:00:00Z");
const row = (overrides: Partial<SubscriptionRow>): SubscriptionRow => ({
  plan: "premium",
  status: "active",
  started_at: "2026-09-01T00:00:00Z",
  expires_at: null,
  ...overrides,
});

describe("plan de l'utilisateur", () => {
  it("sans abonnement : gratuit", () => {
    expect(resolveEntitlements(null, now)).toMatchObject({
      plan: "free",
      isPremium: false,
      limits: PLAN_LIMITS.free,
    });
  });

  it("Premium actif, en essai, ou sans date de fin", () => {
    expect(resolveEntitlements(row({}), now).isPremium).toBe(true);
    expect(resolveEntitlements(row({ status: "trialing" }), now).isPremium).toBe(true);
    expect(resolveEntitlements(row({ expires_at: "2026-12-01T00:00:00Z" }), now)).toMatchObject({
      isPremium: true,
      limits: PLAN_LIMITS.premium,
    });
  });

  it("Premium expiré, annulé ou plan gratuit : retour au gratuit", () => {
    expect(resolveEntitlements(row({ expires_at: "2026-09-20T00:00:00Z" }), now).isPremium).toBe(false);
    expect(resolveEntitlements(row({ status: "canceled" }), now).isPremium).toBe(false);
    expect(resolveEntitlements(row({ status: "expired" }), now).isPremium).toBe(false);
    expect(resolveEntitlements(row({ plan: "free" }), now).plan).toBe("free");
  });
});

describe("déclaration des fonctionnalités", () => {
  it("les fonctionnalités existantes restent gratuites", () => {
    for (const id of [
      "trip_creation",
      "itinerary",
      "budget",
      "map",
      "saved_trips",
      "share_link",
      "pdf_export",
    ] as FeatureId[]) {
      expect(FEATURES[id].plan).toBe("free");
      expect(planIncludes("free", id)).toBe(true);
    }
  });

  it("Premium inclut tout ; le gratuit n'inclut pas les fonctionnalités Premium", () => {
    for (const id of Object.keys(FEATURES) as FeatureId[]) expect(planIncludes("premium", id)).toBe(true);
    for (const f of featuresOf("premium")) expect(planIncludes("free", f.id)).toBe(false);
    expect(featuresOf("premium").some((f) => f.availability === "available")).toBe(true);
  });

  it("limites cohérentes", () => {
    const free = PLAN_LIMITS.free.savedTrips ?? Infinity;
    const premium = PLAN_LIMITS.premium.savedTrips ?? Infinity;
    expect(premium).toBeGreaterThan(free);
  });
});

describe("carnet de voyage PDF (Premium)", () => {
  const departure = addDays(todayIso(), 40);
  const request = {
    destination: { mode: "known", place: { id: "londres", name: "Londres", country: "Royaume-Uni" } },
    dates: { mode: "fixed", departureDate: departure, returnDate: addDays(departure, 4) },
    duration: { id: "5-7-jours", days: 5 },
    travelers: { adults: 2, children: 1 },
    budget: { mode: "range", rangeId: "500-800", scope: "per-person" },
    styles: ["culture", "fete"],
    ambiances: ["sociale"],
    priorities: ["culture"],
    wishes: null,
  } as TripRequest;

  it("checklist adaptée : passeport, livre sterling, adaptateur, enfants", async () => {
    const plan = await generateTravelPlan(request);
    const items = buildChecklist(plan)
      .flatMap((g) => g.items)
      .join("\n");
    expect(items).toMatch(/Passeport valide/);
    expect(items).toMatch(/livre sterling/);
    expect(items).toMatch(/type G/);
    expect(items).toMatch(/enfants/);
  });

  it("édition carnet : plus de pages, titre et nom de fichier dédiés, lien ?edition=carnet", async () => {
    const plan = await generateTravelPlan(request);
    const standard = await PDFDocument.load(await buildTripPdf(plan));
    const carnet = await PDFDocument.load(await buildTripPdf(plan, { edition: "carnet" }));
    expect(carnet.getPageCount()).toBeGreaterThanOrEqual(standard.getPageCount() + 2);
    expect(carnet.getTitle()).toBe("Mon voyage à Londres — Carnet de voyage OVO Premium");
    expect(tripPdfFilename(plan, "carnet")).toBe(`ovo-carnet-londres-${departure}.pdf`);
    expect(tripPdfUrl({ mode: "saved", savedTripId: "abc" }, "carnet")).toBe(
      "/mes-voyages/abc/pdf?edition=carnet",
    );
    expect(tripPdfUrl({ mode: "result", encodedRequest: "xyz" }, "carnet")).toBe(
      "/voyage/resultat/pdf?v=xyz&edition=carnet",
    );
  });
});
