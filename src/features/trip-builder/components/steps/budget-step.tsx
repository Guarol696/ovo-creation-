"use client";

import { useId } from "react";
import { budgetRangeOptions, CUSTOM_BUDGET_LIMITS } from "@/lib/trip/options";
import { cn, formatPrice } from "@/lib/utils";
import type { BudgetScope } from "@/types/trip";
import { parseAmount } from "../../validation";
import { ChoiceCard } from "../choice-card";
import { FieldLabel, inputClassName } from "../field";
import { SegmentedControl } from "../segmented-control";
import type { StepProps } from "../step-props";

export function BudgetStep({ draft, update }: StepProps) {
  const inputId = useId();
  const people = draft.travelersCount ?? 1;
  const isGroup = people > 1;
  const scope: BudgetScope = isGroup ? draft.budgetScope : "per-person";
  const amount = parseAmount(draft.customBudget);

  return (
    <div className="space-y-6">
      {isGroup && (
        <div>
          <FieldLabel>Ton budget est…</FieldLabel>
          <SegmentedControl<BudgetScope>
            label="Portée du budget"
            value={scope}
            onChange={(budgetScope) => update({ budgetScope })}
            options={[
              { value: "per-person", label: "Par personne" },
              { value: "total", label: `Pour les ${people}` },
            ]}
          />
        </div>
      )}

      <div>
        <FieldLabel>{scope === "per-person" ? "Budget par personne" : "Budget total du groupe"}</FieldLabel>
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3">
          {budgetRangeOptions.map((range) => (
            <ChoiceCard
              key={range.id}
              variant="chip"
              label={range.label}
              description={range.description}
              selected={draft.budgetMode === "range" && draft.budgetRangeId === range.id}
              onSelect={() => update({ budgetMode: "range", budgetRangeId: range.id, budgetScope: scope })}
            />
          ))}
        </div>
      </div>

      <div
        className={cn(
          "rounded-3xl p-4 ring-1 transition-all sm:p-5",
          draft.budgetMode === "custom"
            ? "bg-sun-400/10 ring-2 ring-sun-400"
            : "bg-white/[0.04] ring-white/10",
        )}
      >
        <FieldLabel htmlFor={inputId}>Ou indique ton montant exact</FieldLabel>
        <div className="relative">
          <input
            id={inputId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Ex. 650"
            maxLength={9}
            value={draft.customBudget}
            onFocus={() => update({ budgetMode: "custom", budgetScope: scope })}
            onChange={(e) =>
              update({
                customBudget: e.target.value.replace(/[^\d\s]/g, ""),
                budgetMode: "custom",
                budgetScope: scope,
              })
            }
            className={cn(inputClassName, "pr-12 font-display text-xl font-bold")}
          />
          <span
            aria-hidden="true"
            className="absolute top-1/2 right-4 -translate-y-1/2 text-lg font-bold text-white/50"
          >
            €
          </span>
        </div>
        {draft.budgetMode === "custom" && amount !== null && amount > 0 && isGroup && (
          <p className="mt-3 text-sm text-night-100/75">
            {scope === "total"
              ? `≈ ${formatPrice(amount / people)} par personne`
              : `≈ ${formatPrice(amount * people)} pour le groupe`}
          </p>
        )}
        <p className="mt-2 text-xs text-night-100/55">
          Minimum {CUSTOM_BUDGET_LIMITS.minPerPerson} € par personne.
        </p>
      </div>

      <p className="text-sm leading-relaxed text-night-100/70">
        💡 On l&apos;utilise pour te proposer un voyage réaliste : transport, hébergement et activités
        compris.
      </p>
    </div>
  );
}
