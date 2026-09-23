import { Check, Minus } from "lucide-react";
import { FEATURES, PLAN_LIMITS, planIncludes, type FeatureId } from "@/config/premium";

/** Tableau comparatif accessible, généré depuis config/premium.ts. */
export function FeatureTable() {
  const rows = Object.entries(FEATURES) as [FeatureId, (typeof FEATURES)[FeatureId]][];
  const cell = (included: boolean, soon: boolean) =>
    included ? (
      <span className="inline-flex items-center gap-1.5">
        <Check className="size-4 text-gold-300" strokeWidth={3} aria-hidden="true" />
        <span className="sr-only">Inclus</span>
        {soon && <span className="text-xs text-night-100/60">bientôt</span>}
      </span>
    ) : (
      <>
        <Minus className="size-4 text-white/30" aria-hidden="true" />
        <span className="sr-only">Non inclus</span>
      </>
    );

  return (
    <div className="overflow-hidden rounded-4xl ring-1 ring-white/10">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">Comparaison des fonctionnalités OVO Gratuit et OVO Premium</caption>
        <thead className="bg-white/[0.06] text-xs tracking-wider text-night-100/70 uppercase">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold sm:px-6">
              Fonctionnalité
            </th>
            <th scope="col" className="w-20 px-2 py-3 text-center font-semibold sm:w-32">
              Gratuit
            </th>
            <th scope="col" className="w-20 px-2 py-3 text-center font-semibold text-gold-300 sm:w-32">
              Premium
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rows.map(([id, f]) => (
            <tr key={id} className="bg-white/[0.02]">
              <th scope="row" className="px-4 py-3 font-medium sm:px-6">
                <span aria-hidden="true" className="mr-2">
                  {f.emoji}
                </span>
                {f.label}
              </th>
              <td className="px-2 py-3 text-center">{cell(planIncludes("free", id), false)}</td>
              <td className="px-2 py-3 text-center">
                {cell(planIncludes("premium", id), f.availability === "soon")}
              </td>
            </tr>
          ))}
          <tr className="bg-white/[0.02]">
            <th scope="row" className="px-4 py-3 font-medium sm:px-6">
              <span aria-hidden="true" className="mr-2">
                🗂️
              </span>
              Voyages enregistrés (maximum)
            </th>
            <td className="px-2 py-3 text-center font-semibold">{PLAN_LIMITS.free.savedTrips ?? "∞"}</td>
            <td className="px-2 py-3 text-center font-semibold text-gold-300">
              {PLAN_LIMITS.premium.savedTrips ?? "Illimité"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
