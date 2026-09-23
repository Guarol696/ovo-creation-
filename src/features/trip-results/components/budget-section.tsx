"use client";

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { budgetRangeOptions, budgetScopeLabels } from "@/lib/trip/options";
import { cn, formatPrice } from "@/lib/utils";
import type { BudgetCategory, BudgetStatus, ComfortTier, TravelBudget } from "@/types/travel-plan";
import type { TripRequest } from "@/types/trip";
import { DemoNotice } from "./demo-notice";
import { SectionTitle } from "./section-title";

/** Ordre fixe = ordre de la palette validée (ne pas trier par montant). */
const CATEGORIES: { id: BudgetCategory; label: string; emoji: string; color: string }[] = [
  { id: "transport", label: "Transport", emoji: "✈️", color: "bg-viz-1" },
  { id: "accommodation", label: "Hébergement", emoji: "🛏️", color: "bg-viz-2" },
  { id: "food", label: "Nourriture", emoji: "🍽️", color: "bg-viz-3" },
  { id: "activities", label: "Activités", emoji: "🎟️", color: "bg-viz-4" },
  { id: "other", label: "Autres", emoji: "🧾", color: "bg-viz-5" },
];

const TIER_LABELS: Record<ComfortTier, string> = {
  eco: "Économique",
  standard: "Standard",
  confort: "Confort",
};

const STATUS: Record<BudgetStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  within: {
    label: "Dans ton budget",
    icon: CheckCircle2,
    className: "bg-emerald-400/15 text-emerald-200 ring-emerald-300/30",
  },
  tight: {
    label: "Un peu serré",
    icon: AlertTriangle,
    className: "bg-amber-400/15 text-amber-200 ring-amber-300/30",
  },
  over: {
    label: "Au-dessus de ton budget",
    icon: XCircle,
    className: "bg-rose-400/15 text-rose-200 ring-rose-300/30",
  },
};

function userBudgetLabel(request: TripRequest) {
  const { budget } = request;
  const scope = budgetScopeLabels[budget.scope];
  if (budget.mode === "custom") return `${formatPrice(budget.amount)} ${scope}`;
  return `${budgetRangeOptions.find((r) => r.id === budget.rangeId)?.label ?? ""} ${scope}`;
}

interface BudgetSectionProps {
  budget: TravelBudget;
  request: TripRequest;
  travelers: number;
  nights: number;
}

export function BudgetSection({ budget, request, travelers, nights }: BudgetSectionProps) {
  const details: Partial<Record<BudgetCategory, string>> = {
    transport: "Aller-retour + déplacements sur place",
    accommodation: `${nights} nuit${nights > 1 ? "s" : ""}`,
    other: "Assurance, souvenirs, imprévus",
  };
  const [active, setActive] = useState<BudgetCategory | null>(null);
  const status = STATUS[budget.status];
  const percent = (value: number) => Math.round((value / budget.total) * 100);
  const activeCategory = CATEGORIES.find((c) => c.id === active);

  return (
    <section id="budget" className="scroll-mt-20 py-14 sm:py-20">
      <Container>
        <SectionTitle eyebrow="Budget" title="Combien ça va coûter ?">
          <p>Une première estimation, pour savoir où va ton argent.</p>
        </SectionTitle>

        <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
          {/* Chiffres clés */}
          <div className="flex flex-col justify-between gap-6 rounded-4xl bg-white/[0.04] p-6 ring-1 ring-white/10 sm:p-8">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-night-100/60 uppercase">
                {travelers > 1 ? "Total pour le groupe" : "Total estimé"}
              </p>
              <p className="mt-2 font-display text-5xl font-extrabold tracking-tight tabular-nums sm:text-6xl">
                {formatPrice(budget.total)}
              </p>
              {travelers > 1 && (
                <p className="mt-2 text-lg text-night-100/80">
                  ≈ <strong className="text-white tabular-nums">{formatPrice(budget.perPerson)}</strong> par
                  personne
                </p>
              )}
            </div>
            <div className="space-y-3">
              <p
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1",
                  status.className,
                )}
              >
                <status.icon className="size-4" /> {status.label}
              </p>
              <p className="text-sm text-night-100/70">
                Ton budget : <span className="text-white">{userBudgetLabel(request)}</span>
                <br />
                Niveau de confort proposé : <span className="text-white">{TIER_LABELS[budget.tier]}</span>
              </p>
            </div>
          </div>

          {/* Répartition */}
          <div className="rounded-4xl bg-white/[0.04] p-6 ring-1 ring-white/10 sm:p-8">
            <p className="text-xs font-bold tracking-[0.18em] text-night-100/60 uppercase">Répartition</p>
            <p aria-live="polite" className="mt-2 min-h-6 text-sm text-night-100/80">
              {activeCategory
                ? `${activeCategory.label} · ${formatPrice(budget.breakdown[activeCategory.id])} (${percent(budget.breakdown[activeCategory.id])} %)`
                : "Survole une catégorie pour le détail."}
            </p>

            <div
              role="img"
              aria-label={`Répartition du budget : ${CATEGORIES.map((c) => `${c.label} ${percent(budget.breakdown[c.id])} %`).join(", ")}`}
              className="mt-3 flex h-5 gap-0.5 overflow-hidden rounded-[4px]"
            >
              {CATEGORIES.filter((c) => budget.breakdown[c.id] > 0).map((c) => (
                <div
                  key={c.id}
                  onMouseEnter={() => setActive(c.id)}
                  onMouseLeave={() => setActive(null)}
                  style={{ flexGrow: budget.breakdown[c.id] }}
                  className={cn(
                    "h-full min-w-1 basis-0 transition-opacity duration-200",
                    c.color,
                    active && active !== c.id && "opacity-35",
                  )}
                />
              ))}
            </div>

            <table className="mt-6 w-full text-sm">
              <caption className="sr-only">Détail du budget estimé par catégorie</caption>
              <thead className="sr-only">
                <tr>
                  <th scope="col">Catégorie</th>
                  <th scope="col">Montant</th>
                  <th scope="col">Part</th>
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.map((c) => (
                  <tr
                    key={c.id}
                    tabIndex={0}
                    onMouseEnter={() => setActive(c.id)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(c.id)}
                    onBlur={() => setActive(null)}
                    className={cn(
                      "border-b border-white/5 transition-opacity outline-none last:border-0 focus-visible:bg-white/5",
                      active && active !== c.id && "opacity-50",
                    )}
                  >
                    <th scope="row" className="py-3 text-left font-medium">
                      <span className="flex items-center gap-2.5">
                        <span aria-hidden="true" className={cn("size-3 shrink-0 rounded-[3px]", c.color)} />
                        <span aria-hidden="true">{c.emoji}</span>
                        <span>
                          {c.label}
                          {details[c.id] && (
                            <span className="block text-xs font-normal text-night-100/55">
                              {details[c.id]}
                            </span>
                          )}
                        </span>
                      </span>
                    </th>
                    <td className="py-3 text-right font-semibold tabular-nums">
                      {formatPrice(budget.breakdown[c.id])}
                    </td>
                    <td className="w-14 py-3 text-right text-night-100/60 tabular-nums">
                      {percent(budget.breakdown[c.id])} %
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" className="pt-4 text-left font-bold">
                    {travelers > 1 ? "Total pour le groupe" : "Total estimé"}
                  </th>
                  <td className="pt-4 text-right font-bold tabular-nums">{formatPrice(budget.total)}</td>
                  <td />
                </tr>
                {travelers > 1 && (
                  <tr>
                    <th scope="row" className="pt-1 text-left font-medium text-night-100/70">
                      Par personne
                    </th>
                    <td className="pt-1 text-right font-semibold text-night-100/85 tabular-nums">
                      {formatPrice(budget.perPerson)}
                    </td>
                    <td />
                  </tr>
                )}
              </tfoot>
            </table>
          </div>
        </div>

        <DemoNotice className="mt-5" />
      </Container>
    </section>
  );
}
