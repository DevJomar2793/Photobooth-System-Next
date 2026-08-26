import type { CapturedShot, PhotoTemplate } from "../types/booth";

export interface BoothState {
  template: PhotoTemplate | null;
  shots: CapturedShot[];
  finalUri: string | null;
  hasDraft: boolean;
  isHydrating: boolean;
}

export type BoothAction =
  | { type: "SELECT_TEMPLATE"; template: PhotoTemplate }
  | { type: "SET_SHOTS"; shots: CapturedShot[] }
  | { type: "SET_FINAL_URI"; uri: string }
  | { type: "RESTORE_DRAFT"; template: PhotoTemplate; uri: string }
  | { type: "HYDRATION_COMPLETE" }
  | { type: "MARK_DRAFT" }
  | { type: "CLEAR_DRAFT_FLAG" }
  | { type: "RESET" };

export const initialBoothState: BoothState = {
  template: null,
  shots: [],
  finalUri: null,
  hasDraft: false,
  isHydrating: true,
};

export function boothReducer(state: BoothState, action: BoothAction): BoothState {
  switch (action.type) {
    case "SELECT_TEMPLATE":
      return { ...state, template: action.template, shots: [], finalUri: null };
    case "SET_SHOTS":
      return { ...state, shots: action.shots, finalUri: null };
    case "SET_FINAL_URI":
      return { ...state, finalUri: action.uri };
    case "RESTORE_DRAFT":
      return { ...state, template: action.template, finalUri: action.uri, shots: [], hasDraft: true };
    case "HYDRATION_COMPLETE":
      return { ...state, isHydrating: false };
    case "MARK_DRAFT":
      return { ...state, hasDraft: true };
    case "CLEAR_DRAFT_FLAG":
      return { ...state, hasDraft: false };
    case "RESET":
      return { ...initialBoothState, isHydrating: false };
  }
}
