import { Pencil, RotateCcw, Sparkles } from "lucide-react";
import type { ReactNode, Ref } from "react";
import { Button } from "@/components/ui/button";
import {
  formatBudget,
  formatDates,
  formatDestination,
  formatDuration,
  formatTravelers,
} from "@/lib/trip/format";
import { ambianceOptions, priorityOptions, travelStyleOptions, type ChoiceOption } from "@/lib/trip/options";
import type { TripRequest } from "@/types/trip";
import type { StepId } from "../types";

interface TripSummaryProps {
  request: TripRequest;
  onEdit: (step: StepId) => void;
  onGenerate: () => void;
  onRestart: () => void;
  error: string | null;
  headingRef: Ref<HTMLHeadingElement>;
}

export function TripSummary({ request, onEdit, onGenerate, onRestart, error, headingRef }: TripSummaryProps) {
  const rows: { step: StepId; emoji: string; label: string; value: ReactNode }[] = [
    { step: "destination", emoji: "📍", label: "Destination", value: formatDestination(request) },
    { step: "dates", emoji: "📅", label: "Dates", value: formatDates(request) },
    {
      step: request.dates.mode === "fixed" ? "dates" : "duration",
      emoji: "⏳",
      label: "Durée",
      value: formatDuration(request),
    },
    { step: "travelers", emoji: "👥", label: "Voyageurs", value: formatTravelers(request) },
    { step: "budget", emoji: "💶", label: "Budget", value: formatBudget(request) },
    {
      step: "styles",
      emoji: "🧭",
      label: "Style",
      value: <Chips ids={request.styles} options={travelStyleOptions} />,
    },
    {
      step: "ambiance",
      emoji: "🌈",
      label: "Ambiance",
      value: <Chips ids={request.ambiances} options={ambianceOptions} />,
    },
    {
      step: "priorities",
      emoji: "⭐",
      label: "Priorités",
      value: <Chips ids={request.priorities} options={priorityOptions} />,
    },
    {
      step: "wishes",
      emoji: "💬",
      label: "Envie particulière",
      value: request.wishes ? (
        <span className="whitespace-pre-line italic">« {request.wishes} »</span>
      ) : (
        <span className="text-white/50">Aucune précision</span>
      ),
    },
  ];

  return (
    <div className="animate-step-forward">
      <p className="text-xs font-bold tracking-[0.2em] text-gold-300 uppercase">Récapitulatif</p>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-3 font-display text-4xl leading-[1.05] font-extrabold tracking-tight text-balance outline-none sm:text-5xl"
      >
        Ton voyage est prêt à être imaginé ✈️
      </h1>
      <p className="mt-4 text-night-100/75 sm:text-lg">
        Vérifie tes réponses. Tu peux modifier chaque point avant de lancer la génération.
      </p>

      <dl className="mt-8 divide-y divide-white/10 overflow-hidden rounded-4xl bg-white/[0.04] ring-1 ring-white/10">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start gap-4 p-4 sm:p-5">
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/[0.06] text-lg"
            >
              {row.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <dt className="text-xs font-bold tracking-[0.15em] text-night-100/55 uppercase">{row.label}</dt>
              <dd className="mt-1 text-sm leading-relaxed break-words text-white sm:text-base">
                {row.value}
              </dd>
            </div>
            <button
              type="button"
              onClick={() => onEdit(row.step)}
              aria-label={`Modifier : ${row.label}`}
              className="grid size-10 shrink-0 place-items-center rounded-full text-white/60 ring-1 ring-white/15 transition hover:bg-white/10 hover:text-white"
            >
              <Pencil className="size-4" />
            </button>
          </div>
        ))}
      </dl>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-2xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200 ring-1 ring-rose-400/30"
        >
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost-light" onClick={onRestart}>
          <RotateCcw className="size-4" /> Tout recommencer
        </Button>
        <Button size="lg" onClick={onGenerate}>
          <Sparkles className="size-5" /> Générer mon voyage
        </Button>
      </div>
    </div>
  );
}

function Chips<T extends string>({ ids, options }: { ids: T[]; options: ChoiceOption<T>[] }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {ids.map((id) => {
        const option = options.find((o) => o.id === id);
        return (
          <span key={id} className="rounded-full bg-white/[0.08] px-2.5 py-1 text-sm">
            {option ? `${option.emoji} ${option.label}` : id}
          </span>
        );
      })}
    </span>
  );
}
