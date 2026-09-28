import { describe, expect, it } from "vitest";
import { destinationCatalog } from "@/data/destination-catalog";
import { demoDestinations } from "../data-source/demo";

/** Cohérence du catalogue de destinations (contenus écrits à la main). */
describe("catalogue de destinations", () => {
  it("identifiants uniques, reliés à la recherche du questionnaire", () => {
    const ids = demoDestinations.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    const searchable = new Set(destinationCatalog.map((d) => d.id));
    for (const id of ids) expect(searchable, `${id} absent de la recherche`).toContain(id);
  });

  for (const d of demoDestinations) {
    describe(d.name, () => {
      it("fiche complète et cohérente", () => {
        expect(d.iata, "code IATA").toMatch(/^[A-Z]{3}$/);
        expect(d.activities.length).toBeGreaterThanOrEqual(10);
        expect(d.restaurants.length).toBeGreaterThanOrEqual(4);
        expect(d.neighborhoods.length).toBeGreaterThanOrEqual(2);
        expect(d.access.routes.length).toBeGreaterThan(0);
        expect(d.bestMonths.every((m) => m >= 1 && m <= 12)).toBe(true);
        expect(d.idealDays.min).toBeLessThanOrEqual(d.idealDays.max);
        // Des soirées et de quoi remplir les matinées.
        expect(d.activities.some((a) => a.moments.includes("evening"))).toBe(true);
        expect(d.activities.filter((a) => a.moments.includes("morning")).length).toBeGreaterThanOrEqual(4);
        const all = [...d.activities.map((a) => a.id), ...d.restaurants.map((r) => r.id)];
        expect(new Set(all).size, "identifiants en double").toBe(all.length);
        for (const r of d.restaurants) {
          expect(r.real || /OVO/.test(r.name), `${r.name} : réel ou exemple OVO`).toBe(true);
          expect(r.cost).toBeGreaterThan(0);
        }
      });

      it("carte : quartiers, lieux et restaurants réels positionnés", () => {
        const geo = d.geo!;
        expect(geo).toBeDefined();
        for (const n of d.neighborhoods) expect(geo.neighborhoods[n.name], n.name).toBeDefined();
        for (const a of d.activities) expect(geo.places[a.id], a.id).toBeDefined();
        for (const r of d.restaurants.filter((r) => r.real)) expect(geo.places[r.id], r.id).toBeDefined();
        // Tous les points restent dans la région (moins de ~250 km du centre).
        for (const [id, point] of Object.entries(geo.places)) {
          expect(Math.abs(point.lat - geo.center.lat), id).toBeLessThan(2.5);
          expect(Math.abs(point.lng - geo.center.lng), id).toBeLessThan(3.5);
        }
      });
    });
  }
});
