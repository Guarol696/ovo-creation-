import { RotateCcw } from "lucide-react";

interface ProgressHeaderProps {
  current: number;
  total: number;
  label: string;
  optional?: boolean;
  restored: boolean;
  onRestart: () => void;
}

export function ProgressHeader({
  current,
  total,
  label,
  optional,
  restored,
  onRestart,
}: ProgressHeaderProps) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="mb-8 sm:mb-10">
      {restored && (
        <div className="mb-6 flex animate-fade-up flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/[0.05] px-4 py-2.5 text-sm ring-1 ring-white/10">
          <span className="text-night-100/80">👋 On a gardé tes réponses, reprends où tu en étais.</span>
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex min-h-9 items-center gap-1.5 font-semibold text-sun-400 hover:text-sun-300"
          >
            <RotateCcw className="size-3.5" /> Recommencer
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <p className="text-sm font-semibold whitespace-nowrap text-white">
          Étape {current} <span className="text-white/45">/ {total}</span>
        </p>
        <p className="flex min-w-0 flex-wrap items-center justify-end gap-x-2 gap-y-1 text-xs font-bold tracking-[0.18em] text-gold-300 uppercase">
          {label}
          {optional && (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold tracking-normal text-white/75 normal-case">
              Facultatif
            </span>
          )}
        </p>
      </div>
      <div
        role="progressbar"
        aria-label="Progression du questionnaire"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-valuetext={`Étape ${current} sur ${total}`}
        className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"
      >
        <div
          className="h-full rounded-full bg-linear-to-r from-gold-300 via-sun-400 to-sun-600 shadow-[0_0_16px] shadow-sun-500/60 transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
