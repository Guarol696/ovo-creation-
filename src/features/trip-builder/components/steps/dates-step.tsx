"use client";

import { useId, type ReactNode } from "react";
import { addDays, formatMonthFr, nightsBetween, todayIso, upcomingMonths } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { DATE_LIMITS } from "../../validation";
import { ChoiceCard } from "../choice-card";
import { FieldLabel, inputClassName } from "../field";
import type { StepProps } from "../step-props";

export function DatesStep({ draft, update }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <ChoiceCard
          emoji="📅"
          label="J'ai des dates précises"
          description="Je connais mon départ et mon retour"
          selected={draft.datesMode === "fixed"}
          onSelect={() => update({ datesMode: "fixed" })}
        />
        <ChoiceCard
          emoji="🌊"
          label="Je suis flexible sur les dates"
          description="OVO trouvera le meilleur moment"
          selected={draft.datesMode === "flexible"}
          onSelect={() => update({ datesMode: "flexible" })}
        />
      </div>

      {draft.datesMode === "fixed" && <FixedDates {...{ draft, update }} />}
      {draft.datesMode === "flexible" && <FlexibleMonth {...{ draft, update }} />}
    </div>
  );
}

function FixedDates({ draft, update }: Pick<StepProps, "draft" | "update">) {
  const departureId = useId();
  const returnId = useId();
  const today = todayIso();
  const maxDeparture = addDays(today, DATE_LIMITS.maxDaysAhead);
  const minReturn = draft.departureDate ? addDays(draft.departureDate, 1) : addDays(today, 1);
  const maxReturn = draft.departureDate
    ? addDays(draft.departureDate, DATE_LIMITS.maxNights)
    : addDays(maxDeparture, DATE_LIMITS.maxNights);
  const nights =
    draft.departureDate && draft.returnDate ? nightsBetween(draft.departureDate, draft.returnDate) : null;

  return (
    <div className="animate-fade-up space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor={departureId}>Départ</FieldLabel>
          <input
            id={departureId}
            type="date"
            required
            min={today}
            max={maxDeparture}
            value={draft.departureDate}
            onChange={(e) => {
              const departureDate = e.target.value;
              // Le retour devient incohérent : on le réinitialise.
              const keepReturn = draft.returnDate && departureDate && draft.returnDate > departureDate;
              update({ departureDate, returnDate: keepReturn ? draft.returnDate : "" });
            }}
            className={inputClassName}
          />
        </div>
        <div>
          <FieldLabel htmlFor={returnId}>Retour</FieldLabel>
          <input
            id={returnId}
            type="date"
            required
            min={minReturn}
            max={maxReturn}
            value={draft.returnDate}
            onChange={(e) => update({ returnDate: e.target.value })}
            className={inputClassName}
          />
        </div>
      </div>

      {nights !== null && nights > 0 && (
        <p className="animate-fade-up text-sm text-night-100/80">
          🌙{" "}
          <strong className="text-white">
            {nights} nuit{nights > 1 ? "s" : ""}
          </strong>{" "}
          · {nights + 1} jours sur place
        </p>
      )}
    </div>
  );
}

function FlexibleMonth({ draft, update }: Pick<StepProps, "draft" | "update">) {
  const months = upcomingMonths(12);

  return (
    <div className="animate-fade-up">
      <FieldLabel>Une période en tête ? (facultatif)</FieldLabel>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <li className="col-span-2 sm:col-span-4">
          <MonthChip
            selected={draft.preferredMonth === null}
            onClick={() => update({ preferredMonth: null })}
          >
            Peu importe, je suis vraiment flexible
          </MonthChip>
        </li>
        {months.map((month) => (
          <li key={month}>
            <MonthChip
              selected={draft.preferredMonth === month}
              onClick={() => update({ preferredMonth: month })}
            >
              <span className="capitalize">{formatMonthFr(month)}</span>
            </MonthChip>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MonthChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "min-h-12 w-full rounded-2xl px-3 text-sm font-medium ring-1 transition-all active:scale-95",
        selected
          ? "bg-sun-400/15 text-white ring-2 ring-sun-400"
          : "bg-white/[0.04] text-white/80 ring-white/10 hover:bg-white/[0.08]",
      )}
    >
      {children}
    </button>
  );
}
