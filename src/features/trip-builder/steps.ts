import type { StepId, TripDraft } from "./types";

export interface StepDefinition {
  id: StepId;
  /** Libellé court (résumé, fil d'Ariane). */
  label: string;
  question: string;
  hint?: string;
  optional?: boolean;
  /** Une étape peut être masquée selon les réponses précédentes. */
  isVisible?: (draft: TripDraft) => boolean;
}

export const STEPS: StepDefinition[] = [
  {
    id: "destination",
    label: "Destination",
    question: "Tu veux partir où ?",
    hint: "Une idée précise ou pas du tout : les deux nous vont.",
  },
  {
    id: "dates",
    label: "Dates",
    question: "Quand veux-tu partir ?",
    hint: "Choisis tes dates ou dis-nous simplement que tu es flexible.",
  },
  {
    id: "duration",
    label: "Durée",
    question: "Tu pars combien de temps ?",
    hint: "Une estimation suffit, on ajustera ensemble.",
    // Inutile si les dates exactes sont connues : la durée en découle.
    isVisible: (draft) => draft.datesMode !== "fixed",
  },
  {
    id: "travelers",
    label: "Voyageurs",
    question: "Vous partez à combien ?",
  },
  {
    id: "budget",
    label: "Budget",
    question: "Quel est ton budget ?",
    hint: "Transport, hébergement et activités compris.",
  },
  {
    id: "styles",
    label: "Style",
    question: "Quel type de voyage te ressemble ?",
    hint: "Choisis-en autant que tu veux.",
  },
  {
    id: "ambiance",
    label: "Ambiance",
    question: "Quelle ambiance recherches-tu ?",
    hint: "Plusieurs choix possibles.",
  },
  {
    id: "priorities",
    label: "Priorités",
    question: "Qu'est-ce qui compte le plus pour toi ?",
    hint: "Sélectionne ce qui fera vraiment la différence.",
  },
  {
    id: "wishes",
    label: "Envie particulière",
    question: "Une envie particulière ?",
    hint: "Facultatif — mais ça nous aide à viser juste.",
    optional: true,
  },
];

export function getVisibleSteps(draft: TripDraft) {
  return STEPS.filter((step) => step.isVisible?.(draft) ?? true);
}
