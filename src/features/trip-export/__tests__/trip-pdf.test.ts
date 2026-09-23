import { writeFileSync } from "node:fs";
import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { generateTravelPlan } from "@/features/trip-engine";
import { addDays, todayIso } from "@/lib/dates";
import type { TripRequest } from "@/types/trip";
import { buildTripPdf } from "../build-trip-pdf";
import { tripPdfFilename } from "../filename";
import { pdfSafe } from "../pdf-text";

const departure = addDays(todayIso(), 45);
const base = {
  destination: { mode: "known", place: { id: "lisbonne", name: "Lisbonne", country: "Portugal" } },
  dates: { mode: "fixed", departureDate: departure, returnDate: addDays(departure, 4) },
  duration: { id: "5-7-jours", days: 5 },
  travelers: { adults: 2, children: 0 },
  budget: { mode: "range", rangeId: "500-800", scope: "per-person" },
  styles: ["culture", "gastronomie"],
  ambiances: ["authentique"],
  priorities: ["culture"],
  wishes: null,
} as TripRequest;

/** Écrit les PDF d'exemple pour inspection visuelle (OVO_PDF_OUT=dossier). */
const out = process.env.OVO_PDF_OUT;

describe("texte compatible PDF", () => {
  it("garde les accents, remplace ce que la police ne sait pas dessiner", () => {
    expect(pdfSafe("Où On Va ? « Été » œuvre — 12 €")).toBe("Où On Va ? « Été » œuvre — 12 €");
    expect(pdfSafe("≈ 1 560 € 🎉 ✓")).toBe("env. 1 560 €");
    expect(pdfSafe("12 → 17 juin")).toBe("12 – 17 juin");
    expect(pdfSafe("🍽️ Midi")).toBe("Midi");
  });
});

describe("nom du fichier", () => {
  it("clair, sans accents, avec la date de départ ou le mois", async () => {
    const fixed = await generateTravelPlan(base);
    expect(tripPdfFilename(fixed)).toBe(`ovo-voyage-lisbonne-${departure}.pdf`);
    const flexible = await generateTravelPlan({
      ...base,
      destination: { mode: "known", place: { id: "athenes", name: "Athènes", country: "Grèce" } },
      dates: { mode: "flexible", preferredMonth: "2026-12" },
      duration: { id: "3-4-jours", days: null },
    } as TripRequest);
    expect(tripPdfFilename(flexible)).toBe("ovo-voyage-athenes-2026-12.pdf");
  });
});

describe("export PDF", () => {
  it("voyage de 5 jours : couverture + sections, métadonnées, pages A4", async () => {
    const plan = await generateTravelPlan(base);
    const bytes = await buildTripPdf(plan, { generatedAt: new Date(2026, 8, 24) });
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe("%PDF-");
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(5);
    expect(doc.getTitle()).toBe("Mon voyage à Lisbonne — OVO");
    for (const page of doc.getPages()) {
      expect(Math.round(page.getWidth())).toBe(595);
      expect(Math.round(page.getHeight())).toBe(842);
    }
    if (out) writeFileSync(`${out}/${tripPdfFilename(plan)}`, bytes);
  });

  it("toutes les destinations, 2 à 7 jours, famille et destination libre : aucun caractère bloquant", async () => {
    const cases: TripRequest[] = [
      {
        ...base,
        dates: { mode: "fixed", departureDate: departure, returnDate: addDays(departure, 1) },
        duration: { id: "weekend", days: 2 },
      },
      {
        ...base,
        dates: { mode: "fixed", departureDate: departure, returnDate: addDays(departure, 6) },
        duration: { id: "5-7-jours", days: 7 },
        travelers: { adults: 2, children: 2 },
      },
      {
        ...base,
        destination: { mode: "known", place: { id: "custom:tbilissi", name: "Tbilissi", country: "" } },
      },
      ...[
        "barcelone",
        "rome",
        "amsterdam",
        "marrakech",
        "londres",
        "prague",
        "budapest",
        "athenes",
        "split",
      ].map(
        (id) =>
          ({ ...base, destination: { mode: "known", place: { id, name: id, country: "" } } }) as TripRequest,
      ),
      {
        ...base,
        destination: { mode: "open" },
        styles: ["fete", "plage"],
        ambiances: ["festive"],
      } as TripRequest,
    ];
    for (const request of cases) {
      const plan = await generateTravelPlan(request);
      const doc = await PDFDocument.load(await buildTripPdf(plan));
      expect(doc.getPageCount()).toBeGreaterThanOrEqual(4);
      if (out && request.duration.days === 7) writeFileSync(`${out}/7-jours.pdf`, await buildTripPdf(plan));
    }
  });
});
