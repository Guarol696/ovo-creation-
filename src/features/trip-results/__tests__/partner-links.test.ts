import { describe, expect, it } from "vitest";
import { affiliate } from "@/config/affiliate";
import { generateTravelPlan } from "@/features/trip-engine/generate-travel-plan";
import { addDays, todayIso } from "@/lib/dates";
import type { TripRequest } from "@/types/trip";
import { activityTicketLink, mapsLink, partnerLinks, viaTravelpayouts } from "../partner-links";

const departure = addDays(todayIso(), 45);

function request(overrides: Partial<TripRequest>): TripRequest {
  return {
    destination: { mode: "known", place: { id: "lisbonne", name: "Lisbonne", country: "Portugal" } },
    dates: { mode: "fixed", departureDate: departure, returnDate: addDays(departure, 4) },
    duration: { id: "5-7-jours", days: null },
    travelers: { adults: 2, children: 1 },
    budget: { mode: "range", rangeId: "500-800", scope: "per-person" },
    styles: ["ville", "culture"],
    ambiances: ["sociale"],
    priorities: [],
    wishes: null,
    ...overrides,
  } as TripRequest;
}

describe("liens partenaires", () => {
  it("vols : recherche Aviasales datée avec le marker OVO", async () => {
    const plan = await generateTravelPlan(request({}));
    const { flights } = partnerLinks(plan);
    const dd = (iso: string) => iso.slice(8, 10) + iso.slice(5, 7);
    expect(flights?.href).toBe(
      `https://www.aviasales.com/search/PAR${dd(departure)}LIS${dd(addDays(departure, 4))}2?marker=${affiliate.marker}`,
    );
  });

  it("vols : recherche flexible sans dates fixes", async () => {
    const plan = await generateTravelPlan(request({ dates: { mode: "flexible", preferredMonth: null } }));
    const { flights } = partnerLinks(plan);
    expect(flights?.href).toMatch(/^https:\/\/www\.google\.com\/travel\/flights\?/);
    expect(decodeURIComponent(flights!.href)).toContain("Lisbonne");
  });

  it("hébergements : ville, dates et voyageurs pré-remplis", async () => {
    const plan = await generateTravelPlan(request({}));
    const url = new URL(partnerLinks(plan).hotels.href);
    expect(url.hostname).toBe("www.booking.com");
    expect(url.searchParams.get("ss")).toBe("Lisbonne, Portugal");
    expect(url.searchParams.get("checkin")).toBe(departure);
    expect(url.searchParams.get("group_adults")).toBe("2");
    expect(url.searchParams.get("group_children")).toBe("1");
  });

  it("billets : seulement pour les activités payantes et réservables", async () => {
    const plan = await generateTravelPlan(request({}));
    for (const activity of plan.activities) {
      const link = activityTicketLink(activity, "Lisbonne");
      if (activity.estimatedCostPerPerson === 0 || activity.category === "nightlife") expect(link).toBeNull();
      if (link) expect(link.href).toContain("getyourguide");
    }
  });

  it("passe par Travelpayouts uniquement quand le programme est renseigné", () => {
    const target = "https://www.getyourguide.fr/s/?q=Rome";
    expect(viaTravelpayouts(target, { trs: "", p: "", campaignId: "" })).toBe(target);
    const wrapped = new URL(viaTravelpayouts(target, { trs: "1", p: "2", campaignId: "3" }));
    expect(wrapped.hostname).toBe("tp.media");
    expect(wrapped.searchParams.get("marker")).toBe(affiliate.marker);
    expect(wrapped.searchParams.get("u")).toBe(target);
  });

  it("Google Maps : recherche du lieu dans la ville", () => {
    const url = new URL(mapsLink("Time Out Market", "Lisbonne"));
    expect(url.searchParams.get("query")).toBe("Time Out Market, Lisbonne");
  });
});
