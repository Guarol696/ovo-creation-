"use client";

import {
  useCallback,
  useEffect,
  useId,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import { Container } from "@/components/ui/container";
import type { DestinationPlace } from "@/types/trip";
import { prepareTripRequest } from "../actions";
import { clearProgress, isDraftEmpty, loadProgress, saveProgress } from "../draft-storage";
import { draftReducer, initialDraft } from "../state";
import { getVisibleSteps } from "../steps";
import { toTripRequest } from "../to-trip-request";
import type { MultiChoiceField, StepId, TripDraft } from "../types";
import { validateStep } from "../validation";
import { GenerationScreen } from "./generation-screen";
import { ProgressHeader } from "./progress-header";
import { StepNavigation } from "./step-navigation";
import type { StepProps } from "./step-props";
import { BudgetStep } from "./steps/budget-step";
import { DatesStep } from "./steps/dates-step";
import { DestinationStep } from "./steps/destination-step";
import { DurationStep } from "./steps/duration-step";
import { MultiChoiceStep } from "./steps/multi-choice-step";
import { TravelersStep } from "./steps/travelers-step";
import { WishesStep } from "./steps/wishes-step";
import { ambianceOptions, priorityOptions, travelStyleOptions } from "@/lib/trip/options";
import { TripSummary } from "./trip-summary";

type View = "questions" | "summary" | "generating" | "ready";

/** Durée minimale de l'écran de transition, pour une animation lisible. */
const MIN_TRANSITION_MS = 2200;

const stepComponents: Record<StepId, (props: StepProps) => ReactNode> = {
  destination: DestinationStep,
  dates: DatesStep,
  duration: DurationStep,
  travelers: TravelersStep,
  budget: BudgetStep,
  styles: (props) => <MultiChoiceStep {...props} field="styles" options={travelStyleOptions} />,
  ambiance: (props) => (
    <MultiChoiceStep
      {...props}
      field="ambiances"
      options={ambianceOptions}
      variant="card"
      columns="grid-cols-1 min-[420px]:grid-cols-2"
    />
  ),
  priorities: (props) => <MultiChoiceStep {...props} field="priorities" options={priorityOptions} />,
  wishes: WishesStep,
};

interface TripBuilderProps {
  /** Destination pré-sélectionnée (ex. depuis une carte « Inspiration »). */
  initialDestination?: DestinationPlace | null;
}

const subscribeNoop = () => () => {};

/**
 * Le questionnaire est rendu uniquement côté client : son état initial
 * dépend de la sauvegarde locale du navigateur.
 */
export function TripBuilder(props: TripBuilderProps) {
  const isClient = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  return isClient ? (
    <TripBuilderFlow {...props} />
  ) : (
    <div aria-busy="true" className="min-h-svh bg-night-950" />
  );
}

interface InitialState {
  draft: TripDraft;
  stepId: StepId;
  view: View;
  restored: boolean;
}

/** Reprend le questionnaire sauvegardé et applique la destination pré-sélectionnée. */
function restoreInitialState(initialDestination: DestinationPlace | null): InitialState {
  const saved = loadProgress();
  const hasSaved = saved !== null && !isDraftEmpty(saved.draft);
  let draft: TripDraft = hasSaved ? saved.draft : initialDraft;

  if (initialDestination) {
    draft = { ...draft, destinationMode: "known", destination: initialDestination };
    return { draft, stepId: "destination", view: "questions", restored: hasSaved };
  }
  if (!hasSaved) return { draft, stepId: "destination", view: "questions", restored: false };

  const visible = getVisibleSteps(draft);
  const stepId = visible.some((s) => s.id === saved.stepId) ? saved.stepId : "destination";
  const view = saved.view === "summary" && toTripRequest(draft) !== null ? "summary" : "questions";
  return { draft, stepId, view, restored: true };
}

function TripBuilderFlow({ initialDestination = null }: TripBuilderProps) {
  const formId = useId();
  const [initial] = useState(() => restoreInitialState(initialDestination));
  const [draft, dispatch] = useReducer(draftReducer, initial.draft);
  const [view, setView] = useState<View>(initial.view);
  const [stepId, setStepId] = useState<StepId>(initial.stepId);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [editingFromSummary, setEditingFromSummary] = useState(false);
  const [restored, setRestored] = useState(initial.restored);
  const [, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasNavigated = useRef(false);

  // La destination de l'URL est appliquée une seule fois : on nettoie l'URL
  // pour qu'un rechargement ne ramène pas à la première étape.
  useEffect(() => {
    if (initialDestination) window.history.replaceState(null, "", window.location.pathname);
  }, [initialDestination]);

  // Sauvegarde automatique à chaque changement (navigateur uniquement).
  useEffect(() => {
    saveProgress({ draft, stepId, view: view === "questions" ? "questions" : "summary" });
  }, [draft, stepId, view]);

  // À chaque changement d'écran : retour en haut et focus sur le titre.
  useEffect(() => {
    if (!hasNavigated.current) return;
    window.scrollTo({ top: 0, behavior: "instant" });
    headingRef.current?.focus({ preventScroll: true });
  }, [stepId, view]);

  const visibleSteps = getVisibleSteps(draft);
  const currentIndex = Math.max(
    0,
    visibleSteps.findIndex((s) => s.id === stepId),
  );
  const currentStep = visibleSteps[currentIndex] ?? visibleSteps[0]!;
  const isLastStep = currentIndex === visibleSteps.length - 1;

  const update = useCallback((patch: Partial<TripDraft>) => {
    dispatch({ type: "patch", patch });
    setError(null);
  }, []);

  const toggle = useCallback((field: MultiChoiceField, value: string) => {
    dispatch({ type: "toggle", field, value });
    setError(null);
  }, []);

  function navigate(next: { view: View; stepId?: StepId }, dir: 1 | -1) {
    hasNavigated.current = true;
    setDirection(dir);
    setError(null);
    setRestored(false);
    if (next.stepId) setStepId(next.stepId);
    setView(next.view);
  }

  /** Première étape encore invalide, ou null si tout est bon. */
  function firstInvalidStep(): StepId | null {
    return getVisibleSteps(draft).find((s) => validateStep(s.id, draft) !== null)?.id ?? null;
  }

  function handleNext(event: FormEvent) {
    event.preventDefault();
    const stepError = validateStep(currentStep.id, draft);
    if (stepError) {
      setError(stepError);
      return;
    }
    if (editingFromSummary || isLastStep) {
      const invalid = firstInvalidStep();
      if (invalid) {
        navigate({ view: "questions", stepId: invalid }, 1);
        return;
      }
      setEditingFromSummary(false);
      navigate({ view: "summary" }, 1);
      return;
    }
    navigate({ view: "questions", stepId: visibleSteps[currentIndex + 1]!.id }, 1);
  }

  function handleBack() {
    if (currentIndex === 0) return;
    navigate({ view: "questions", stepId: visibleSteps[currentIndex - 1]!.id }, -1);
  }

  function handleEdit(step: StepId) {
    setEditingFromSummary(true);
    navigate({ view: "questions", stepId: step }, -1);
  }

  function handleRestart() {
    clearProgress();
    dispatch({ type: "reset" });
    setEditingFromSummary(false);
    setSubmitError(null);
    navigate({ view: "questions", stepId: "destination" }, -1);
  }

  function handleGenerate() {
    const request = toTripRequest(draft);
    if (!request) {
      const invalid = firstInvalidStep();
      if (invalid) navigate({ view: "questions", stepId: invalid }, -1);
      return;
    }
    setSubmitError(null);
    navigate({ view: "generating" }, 1);

    startTransition(async () => {
      try {
        const [result] = await Promise.all([
          prepareTripRequest(request),
          new Promise((resolve) => setTimeout(resolve, MIN_TRANSITION_MS)),
        ]);
        if (result.ok) {
          setView("ready");
        } else {
          setSubmitError(result.error);
          navigate({ view: "summary" }, -1);
        }
      } catch {
        setSubmitError("Impossible de joindre OVO pour le moment. Vérifie ta connexion et réessaie.");
        navigate({ view: "summary" }, -1);
      }
    });
  }

  const summaryRequest = view === "summary" ? toTripRequest(draft) : null;
  const StepComponent = stepComponents[currentStep.id];
  const nextLabel = editingFromSummary
    ? "Valider"
    : isLastStep
      ? currentStep.optional && !draft.wishes.trim()
        ? "Passer et voir le récap"
        : "Voir mon récap"
      : "Continuer";

  return (
    <div className="relative isolate flex min-h-svh flex-col overflow-x-clip bg-night-950 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 right-[-15%] size-[34rem] rounded-full bg-sun-500/15 blur-[120px]" />
        <div className="absolute top-1/2 left-[-20%] size-[30rem] rounded-full bg-night-500/25 blur-[120px]" />
      </div>

      <div className="flex-1 pt-24 pb-12 sm:pt-32 sm:pb-16">
        <Container className="max-w-3xl">
          {view === "questions" && (
            <>
              <ProgressHeader
                current={currentIndex + 1}
                total={visibleSteps.length}
                label={currentStep.label}
                optional={currentStep.optional}
                restored={restored}
                onRestart={handleRestart}
              />

              <form
                id={formId}
                key={currentStep.id}
                noValidate
                onSubmit={handleNext}
                aria-labelledby={`${formId}-title`}
                className={direction === 1 ? "animate-step-forward" : "animate-step-backward"}
              >
                <h1
                  id={`${formId}-title`}
                  ref={headingRef}
                  tabIndex={-1}
                  className="font-display text-4xl leading-[1.05] font-extrabold tracking-tight text-balance outline-none sm:text-5xl"
                >
                  {currentStep.question}
                </h1>
                {currentStep.hint && <p className="mt-3 text-night-100/70 sm:text-lg">{currentStep.hint}</p>}

                <div className="mt-8">
                  <StepComponent draft={draft} update={update} toggle={toggle} />
                </div>

                <p
                  role="alert"
                  className={
                    error
                      ? "mt-6 animate-fade-up rounded-2xl bg-rose-500/15 px-4 py-3 text-sm font-medium text-rose-200 ring-1 ring-rose-400/30"
                      : "sr-only"
                  }
                >
                  {error}
                </p>
              </form>
            </>
          )}

          {view === "summary" && summaryRequest && (
            <TripSummary
              request={summaryRequest}
              onEdit={handleEdit}
              onGenerate={handleGenerate}
              onRestart={handleRestart}
              error={submitError}
              headingRef={headingRef}
            />
          )}

          {(view === "generating" || view === "ready") && (
            <GenerationScreen
              status={view === "ready" ? "ready" : "pending"}
              onBackToSummary={() => navigate({ view: "summary" }, -1)}
              headingRef={headingRef}
            />
          )}
        </Container>
      </div>

      {view === "questions" && (
        <StepNavigation
          formId={formId}
          canGoBack={currentIndex > 0}
          onBack={handleBack}
          nextLabel={nextLabel}
        />
      )}
    </div>
  );
}
