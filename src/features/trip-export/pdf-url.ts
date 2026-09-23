import { routes } from "@/config/site";
import type { PdfEdition } from "./build-trip-pdf";

/** Origine d'un voyage affiché, pour construire son lien de PDF. */
export type PdfSource =
  | { mode: "result"; encodedRequest: string }
  | { mode: "saved"; savedTripId: string }
  | { mode: "public"; sharePath: string };

/** Lien du PDF (mêmes règles d'accès que la page ; carnet = Premium, vérifié par le serveur). */
export function tripPdfUrl(source: PdfSource, edition: PdfEdition = "standard") {
  const base =
    source.mode === "result"
      ? `${routes.tripResult}/pdf?v=${source.encodedRequest}`
      : source.mode === "saved"
        ? `${routes.myTrips}/${source.savedTripId}/pdf`
        : `${source.sharePath}/pdf`;
  if (edition === "standard") return base;
  return `${base}${base.includes("?") ? "&" : "?"}edition=${edition}`;
}
