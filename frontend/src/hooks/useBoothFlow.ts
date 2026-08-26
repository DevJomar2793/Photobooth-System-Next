"use client";

import { useCallback, useState } from "react";
import { CapturedShot, Template } from "@/types/booth";

export type BoothStep = "SELECT_TEMPLATE" | "CAPTURE" | "REVIEW";

export function useBoothFlow() {
  const [step, setStep] = useState<BoothStep>("SELECT_TEMPLATE");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [capturedShots, setCapturedShots] = useState<CapturedShot[]>([]);

  const selectTemplate = useCallback((template: Template) => {
    setSelectedTemplate(template);
    setStep("CAPTURE");
  }, []);

  const completeCapture = useCallback((shots: CapturedShot[]) => {
    setCapturedShots(shots);
    setStep("REVIEW");
  }, []);

  const returnToTemplateSelection = useCallback(() => {
    setSelectedTemplate(null);
    setCapturedShots([]);
    setStep("SELECT_TEMPLATE");
  }, []);

  const retakePhotos = useCallback(() => {
    setCapturedShots([]);
    setStep("CAPTURE");
  }, []);

  return {
    capturedShots,
    completeCapture,
    retakePhotos,
    returnToTemplateSelection,
    selectTemplate,
    selectedTemplate,
    step,
  };
}
