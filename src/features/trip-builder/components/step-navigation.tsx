import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepNavigationProps {
  formId: string;
  canGoBack: boolean;
  onBack: () => void;
  nextLabel: string;
}

/** Barre d'actions collée en bas de l'écran (zone du pouce sur mobile). */
export function StepNavigation({ formId, canGoBack, onBack, nextLabel }: StepNavigationProps) {
  return (
    <div className="sticky bottom-0 z-30 border-t border-white/10 bg-night-950/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-8 sm:py-4">
        <Button
          variant="outline-light"
          onClick={onBack}
          disabled={!canGoBack}
          aria-label="Étape précédente"
          className="min-h-12 px-4 sm:px-5"
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Retour</span>
        </Button>
        <Button type="submit" form={formId} className="min-h-12 flex-1 sm:flex-none sm:px-8">
          {nextLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
}
