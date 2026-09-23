import type { TravelPlan } from "@/types/travel-plan";

const slug = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "voyage";

/**
 * Nom du fichier téléchargé : clair, sans accents ni espaces.
 * « ovo-voyage-lisbonne-2026-11-12.pdf » (dates fixes),
 * « ovo-voyage-rome-2026-12.pdf » (mois souhaité) ou « ovo-voyage-split.pdf ».
 */
export function tripPdfFilename(plan: TravelPlan) {
  const when = plan.dates.departureDate ?? plan.dates.preferredMonth;
  return `ovo-voyage-${slug(plan.destination.name)}${when ? `-${when}` : ""}.pdf`;
}
