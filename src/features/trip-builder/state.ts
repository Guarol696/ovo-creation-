import type { MultiChoiceField, TripDraft } from "./types";

export const initialDraft: TripDraft = {
  destinationMode: null,
  destination: null,
  datesMode: null,
  departureDate: "",
  returnDate: "",
  preferredMonth: null,
  durationId: null,
  travelersCount: null,
  children: 0,
  budgetMode: null,
  budgetRangeId: null,
  customBudget: "",
  budgetScope: "per-person",
  styles: [],
  ambiances: [],
  priorities: [],
  wishes: "",
};

export type DraftAction =
  | { type: "patch"; patch: Partial<TripDraft> }
  | { type: "toggle"; field: MultiChoiceField; value: string }
  | { type: "hydrate"; draft: TripDraft }
  | { type: "reset" };

export function draftReducer(state: TripDraft, action: DraftAction): TripDraft {
  switch (action.type) {
    case "patch":
      return { ...state, ...action.patch };
    case "toggle": {
      const current = state[action.field] as string[];
      const next = current.includes(action.value)
        ? current.filter((v) => v !== action.value)
        : [...current, action.value];
      return { ...state, [action.field]: next };
    }
    case "hydrate":
      return action.draft;
    case "reset":
      return initialDraft;
  }
}
