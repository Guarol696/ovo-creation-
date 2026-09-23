import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/features/auth/server/session";
import { canUseFeature } from "@/features/premium/server/entitlements";
import { loadSavedTrip } from "@/features/saved-trips/server/load-saved-trip";
import {
  pdfUnavailable,
  premiumRequired,
  requestedEdition,
  tripPdfResponse,
} from "@/features/trip-export/server/pdf-response";

/** PDF d'un voyage enregistré : réservé à son propriétaire (session + RLS). */
export async function GET(request: NextRequest, ctx: RouteContext<"/mes-voyages/[id]/pdf">) {
  if (!(await getCurrentUser())) return pdfUnavailable(404);
  const edition = requestedEdition(request.nextUrl.searchParams);
  if (edition === "carnet" && !(await canUseFeature("pdf_travel_book"))) return premiumRequired();
  const view = await loadSavedTrip((await ctx.params).id);
  return view ? tripPdfResponse(view.plan, edition) : pdfUnavailable(404);
}
