import type { NextRequest } from "next/server";
import { loadSharedTrip } from "@/features/sharing/server/load-shared-trip";
import { pdfUnavailable, tripPdfResponse } from "@/features/trip-export/server/pdf-response";

/** PDF d'un voyage partagé (mêmes règles d'accès que la page publique). */
export async function GET(_request: NextRequest, ctx: RouteContext<"/voyage/partage/[token]/pdf">) {
  const trip = await loadSharedTrip((await ctx.params).token).catch(() => null);
  return trip ? tripPdfResponse(trip.plan) : pdfUnavailable(404);
}
