import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/features/auth/server/session";
import { loadSavedTrip } from "@/features/saved-trips/server/load-saved-trip";
import { pdfUnavailable, tripPdfResponse } from "@/features/trip-export/server/pdf-response";

/** PDF d'un voyage enregistré : réservé à son propriétaire (session + RLS). */
export async function GET(_request: NextRequest, ctx: RouteContext<"/mes-voyages/[id]/pdf">) {
  if (!(await getCurrentUser())) return pdfUnavailable(404);
  const view = await loadSavedTrip((await ctx.params).id);
  return view ? tripPdfResponse(view.plan) : pdfUnavailable(404);
}
