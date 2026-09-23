import type { NextRequest } from "next/server";
import { canUseFeature } from "@/features/premium/server/entitlements";
import {
  pdfUnavailable,
  premiumRequired,
  requestedEdition,
  tripPdfResponse,
} from "@/features/trip-export/server/pdf-response";
import { loadTravelPlan } from "@/features/trip-results/load-plan";

/** PDF d'un voyage tout juste généré (même demande encodée que la page de résultat). */
export async function GET(request: NextRequest) {
  const edition = requestedEdition(request.nextUrl.searchParams);
  if (edition === "carnet" && !(await canUseFeature("pdf_travel_book"))) return premiumRequired();
  const result = await loadTravelPlan(request.nextUrl.searchParams.get("v") ?? undefined);
  return result.status === "ok" ? tripPdfResponse(result.plan, edition) : pdfUnavailable(400);
}
