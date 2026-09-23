import type { NextRequest } from "next/server";
import { pdfUnavailable, tripPdfResponse } from "@/features/trip-export/server/pdf-response";
import { loadTravelPlan } from "@/features/trip-results/load-plan";

/** PDF d'un voyage tout juste généré (même demande encodée que la page de résultat). */
export async function GET(request: NextRequest) {
  const result = await loadTravelPlan(request.nextUrl.searchParams.get("v") ?? undefined);
  return result.status === "ok" ? tripPdfResponse(result.plan) : pdfUnavailable(400);
}
