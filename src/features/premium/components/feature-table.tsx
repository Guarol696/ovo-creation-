import { Check, Minus } from "lucide-react";
import { FEATURES, PLAN_LIMITS, PLAN_ORDER, PLANS, planIncludes, type FeatureId } from "@/config/premium";
import { cn } from "@/lib/utils";

/** Tableau comparatif accessible (généré depuis config/premium.ts). */
export function FeatureTable() {
  const rows = Object.entries(FEATURES) as [FeatureId, (typeof FEATURES)[FeatureId]][];
  return (
    <div className="overflow-hidden rounded-4xl ring-1 ring-white/10">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">Comparaison des fonctionnalités des offres OVO</caption>
        <thead className="bg-white/[0.06] text-[0.7rem] tracking-wider text-night-100/70 uppercase">
          <tr>
            <th scope="col" className="px-3 py-3 font-semibold sm:px-6">
              Fonctionnalité
            </th>
            {PLAN_ORDER.map((plan) => (
              <th
                key={plan}
                scope="col"
                className={cn(
                  "w-14 px-1 py-3 text-center font-semibold sm:w-28",
                  plan === "medium" && "text-sun-300",
                  plan === "premium" && "text-gold-300",
                )}
              >
                {PLANS[plan].shortName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rows.map(([id, f]) => (
            <tr key={id} className="bg-white/[0.02]">
              <th scope="row" className="px-3 py-3 font-medium sm:px-6">
                <span aria-hidden="true" className="mr-2">
                  {f.emoji}
                </span>
                {f.label}
              </th>
              {PLAN_ORDER.map((plan) => (
                <td key={plan} className="px-1 py-3 text-center">
                  {planIncludes(plan, id) ? (
                    <>
                      <Check className="mx-auto size-4 text-gold-300" strokeWidth={3} aria-hidden="true" />
                      <span className="sr-only">Inclus</span>
                    </>
                  ) : (
                    <>
                      <Minus className="mx-auto size-4 text-white/30" aria-hidden="true" />
                      <span className="sr-only">Non inclus</span>
                    </>
                  )}
                </td>
              ))}
            </tr>
          ))}
          <tr className="bg-white/[0.02]">
            <th scope="row" className="px-3 py-3 font-medium sm:px-6">
              <span aria-hidden="true" className="mr-2">
                🗂️
              </span>
              Voyages enregistrés (max.)
            </th>
            {PLAN_ORDER.map((plan) => (
              <td key={plan} className="px-1 py-3 text-center font-semibold">
                {PLAN_LIMITS[plan].savedTrips ?? "∞"}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
