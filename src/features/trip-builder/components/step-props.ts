import type { MultiChoiceField, TripDraft } from "../types";

/** Props communes à tous les composants d'étape. */
export interface StepProps {
  draft: TripDraft;
  update: (patch: Partial<TripDraft>) => void;
  toggle: (field: MultiChoiceField, value: string) => void;
}
