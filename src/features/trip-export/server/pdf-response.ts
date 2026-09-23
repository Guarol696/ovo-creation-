import "server-only";
import type { TravelPlan } from "@/types/travel-plan";
import { buildTripPdf } from "../build-trip-pdf";
import { tripPdfFilename } from "../filename";

/** Réponse HTTP « fichier PDF à télécharger » pour un voyage. */
export async function tripPdfResponse(plan: TravelPlan) {
  const bytes = await buildTripPdf(plan);
  const filename = tripPdfFilename(plan);
  return new Response(bytes as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Content-Length": String(bytes.byteLength),
      // Document personnel : jamais mis en cache partagé ni indexé.
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

/** Erreur lisible (pas de page technique) si le voyage n'est pas accessible. */
export function pdfUnavailable(status: 404 | 400 = 404) {
  return new Response(
    status === 404
      ? "Ce voyage est introuvable ou n'est plus partagé."
      : "Ce voyage n'est plus valide : ouvre-le à nouveau depuis OVO.",
    { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } },
  );
}
