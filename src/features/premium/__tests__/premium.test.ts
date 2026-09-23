import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { FEATURES, PLAN_LIMITS, PLANS, planIncludes, plansIncluding, type FeatureId } from "@/config/premium";
import { generateTravelPlan } from "@/features/trip-engine";
import { buildTripPdf } from "@/features/trip-export/build-trip-pdf";
import { buildChecklist } from "@/features/trip-export/checklist";
import { tripPdfFilename } from "@/features/trip-export/filename";
import { tripPdfUrl } from "@/features/trip-export/pdf-url";
import { addDays, todayIso } from "@/lib/dates";
import type { TripRequest } from "@/types/trip";
import { hasFeatureAccess, resolveEntitlements, statusLabel, type SubscriptionRow } from "../plan";

const now = new Date("2026-09-24T12:00:00Z");
const row = (overrides: Partial<SubscriptionRow>): SubscriptionRow => ({
  plan: "premium",
  subscription_status: "active",
  current_period_start: "2026-09-01T00:00:00Z",
  current_period_end: "2026-10-01T00:00:00Z",
  cancel_at_period_end: false,
  ...overrides,
});

describe("hasFeatureAccess (droits issus de l'abonnement réel)", () => {
  it("Free < Medium < Premium, et un abonnement terminé ne donne plus rien", () => {
    const medium = resolveEntitlements(row({ plan: "medium" }), now);
    const premium = resolveEntitlements(row({}), now);
    const ended = resolveEntitlements(row({ subscription_status: "canceled" }), now);
    const unpaid = resolveEntitlements(row({ subscription_status: "unpaid" }), now);
    expect(hasFeatureAccess(resolveEntitlements(null, now), "pdf_export")).toBe(true);
    expect(hasFeatureAccess(resolveEntitlements(null, now), "pdf_travel_book")).toBe(false);
    expect(hasFeatureAccess(medium, "pdf_travel_book")).toBe(true);
    expect(hasFeatureAccess(medium, "share_expiring_links")).toBe(false);
    expect(hasFeatureAccess(premium, "share_expiring_links")).toBe(true);
    expect(hasFeatureAccess(premium, "pdf_travel_book")).toBe(true);
    expect(hasFeatureAccess(ended, "pdf_travel_book")).toBe(false);
    expect(hasFeatureAccess(unpaid, "pdf_travel_book")).toBe(false);
  });
});

describe("offre de l'utilisateur (statuts Stripe)", () => {
  it("sans abonnement : gratuit", () => {
    expect(resolveEntitlements(null, now)).toMatchObject({
      plan: "free",
      isPaid: false,
      limits: PLAN_LIMITS.free,
    });
  });

  it("actif ou en essai : offre souscrite", () => {
    expect(resolveEntitlements(row({}), now)).toMatchObject({
      plan: "premium",
      isPremium: true,
      limits: PLAN_LIMITS.premium,
    });
    expect(resolveEntitlements(row({ plan: "medium", subscription_status: "trialing" }), now)).toMatchObject({
      plan: "medium",
      isPaid: true,
      isPremium: false,
      limits: PLAN_LIMITS.medium,
    });
  });

  it("paiement échoué (past_due) : accès maintenu, alerte", () => {
    const e = resolveEntitlements(row({ subscription_status: "past_due" }), now);
    expect(e).toMatchObject({ plan: "premium", paymentIssue: true });
    expect(statusLabel(e)).toMatch(/Paiement échoué/);
  });

  it("annulé, impayé, incomplet, en pause : retour au gratuit", () => {
    for (const status of ["canceled", "unpaid", "incomplete", "incomplete_expired", "paused"] as const) {
      const e = resolveEntitlements(row({ subscription_status: status }), now);
      expect(e.plan).toBe("free");
      expect(e.subscribedPlan).toBe("premium");
    }
  });

  it("période terminée depuis plus de 48 h : gratuit (webhook manquant)", () => {
    expect(resolveEntitlements(row({ current_period_end: "2026-09-23T00:00:00Z" }), now).plan).toBe(
      "premium",
    );
    expect(resolveEntitlements(row({ current_period_end: "2026-09-20T00:00:00Z" }), now).plan).toBe("free");
  });

  it("annulation programmée : actif jusqu'à la fin de période", () => {
    const e = resolveEntitlements(row({ cancel_at_period_end: true }), now);
    expect(e.plan).toBe("premium");
    expect(statusLabel(e)).toBe("Actif, annulation programmée");
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

  it("Premium ⊃ Medium ⊃ Gratuit", () => {
    for (const id of Object.keys(FEATURES) as FeatureId[]) expect(planIncludes("premium", id)).toBe(true);
    expect(planIncludes("medium", "pdf_travel_book")).toBe(true);
    expect(planIncludes("free", "pdf_travel_book")).toBe(false);
    expect(planIncludes("medium", "share_expiring_links")).toBe(false);
    expect(plansIncluding("pdf_travel_book")).toEqual(["OVO Medium", "OVO Premium"]);
    expect(plansIncluding("share_expiring_links")).toEqual(["OVO Premium"]);
  });

  it("prix et limites centralisés et cohérents", () => {
    expect(PLANS.medium.monthlyPrice).toBe(5.99);
    expect(PLANS.premium.monthlyPrice).toBe(9.99);
    const limit = (p: keyof typeof PLAN_LIMITS) => PLAN_LIMITS[p].savedTrips ?? Infinity;
    expect(limit("medium")).toBeGreaterThan(limit("free"));
    expect(limit("premium")).toBeGreaterThan(limit("medium"));
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
