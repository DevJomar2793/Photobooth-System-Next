import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { findTemplate } from "../constants/templates";
import { clearDraft, clearDraftMetadata, loadDraft, saveDraft } from "../services/draftStorage";
import type { CapturedShot, PhotoTemplate } from "../types/booth";
import { boothReducer, initialBoothState, type BoothState } from "./boothReducer";

interface BoothContextValue extends BoothState {
  selectTemplate: (template: PhotoTemplate) => void;
  setShots: (shots: CapturedShot[]) => void;
  setFinalUri: (uri: string) => void;
  persistDraft: () => Promise<void>;
  discardDraft: () => Promise<void>;
  completeDraft: () => Promise<void>;
  reset: () => void;
}

const BoothContext = createContext<BoothContextValue | null>(null);

export function BoothProvider({ children }: React.PropsWithChildren) {
  const [state, dispatch] = useReducer(boothReducer, initialBoothState);

  useEffect(() => {
    void loadDraft().then((draft) => {
      const template = draft ? findTemplate(draft.templateId) : undefined;
      if (draft && template) {
        dispatch({ type: "RESTORE_DRAFT", template, uri: draft.finalUri });
      }
      dispatch({ type: "HYDRATION_COMPLETE" });
    });
  }, []);

  const selectTemplate = useCallback((template: PhotoTemplate) => {
    dispatch({ type: "SELECT_TEMPLATE", template });
  }, []);
  const setShots = useCallback((shots: CapturedShot[]) => {
    dispatch({ type: "SET_SHOTS", shots });
  }, []);
  const setFinalUri = useCallback((uri: string) => {
    dispatch({ type: "SET_FINAL_URI", uri });
  }, []);
  const persistDraft = useCallback(async () => {
    if (!state.template || !state.finalUri) return;
    await saveDraft(state.template.id, state.finalUri);
    dispatch({ type: "MARK_DRAFT" });
  }, [state.finalUri, state.template]);
  const discardDraft = useCallback(async () => {
    await clearDraft();
    dispatch({ type: "CLEAR_DRAFT_FLAG" });
  }, []);
  const completeDraft = useCallback(async () => {
    await clearDraftMetadata();
    dispatch({ type: "CLEAR_DRAFT_FLAG" });
  }, []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const value = useMemo(
    () => ({
      ...state,
      selectTemplate,
      setShots,
      setFinalUri,
      persistDraft,
      discardDraft,
      completeDraft,
      reset,
    }),
    [completeDraft, discardDraft, persistDraft, reset, selectTemplate, setFinalUri, setShots, state],
  );

  return <BoothContext.Provider value={value}>{children}</BoothContext.Provider>;
}

export function useBooth() {
  const context = useContext(BoothContext);
  if (!context) throw new Error("useBooth must be used inside BoothProvider");
  return context;
}
