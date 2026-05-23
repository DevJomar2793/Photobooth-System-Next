"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TemplateSelector } from "@/components/PhotoBooth/TemplateSelector";
import { CameraStage } from "@/components/PhotoBooth/CameraStage";
import { PreviewExport } from "@/components/PhotoBooth/PreviewExport";
import { Template, CapturedShot } from "@/types/booth";

type Step = "SELECT_TEMPLATE" | "CAPTURE" | "REVIEW";

export default function Home() {
  const [step, setStep] = useState<Step>("SELECT_TEMPLATE");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [capturedShots, setCapturedShots] = useState<CapturedShot[]>([]);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setStep("CAPTURE");
  };

  const handleCaptureComplete = (shots: CapturedShot[]) => {
    setCapturedShots(shots);
    setStep("REVIEW");
  };

  const handleCancelCapture = () => {
    setSelectedTemplate(null);
    setCapturedShots([]);
    setStep("SELECT_TEMPLATE");
  };

  const handleRetake = () => {
    setCapturedShots([]);
    setStep("CAPTURE");
  };

  const handleFinish = () => {
    setSelectedTemplate(null);
    setCapturedShots([]);
    setStep("SELECT_TEMPLATE");
  };

  return (
    <div className="w-full flex-grow flex flex-col">
      <AnimatePresence mode="wait">
        {step === "SELECT_TEMPLATE" && (
          <motion.div 
            key="select"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full flex-grow flex flex-col"
          >
            <TemplateSelector onSelect={handleTemplateSelect} />
          </motion.div>
        )}

        {step === "CAPTURE" && selectedTemplate && (
          <motion.div 
            key="capture"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full flex-grow flex flex-col"
          >
            <CameraStage 
              template={selectedTemplate} 
              onComplete={handleCaptureComplete} 
              onCancel={handleCancelCapture}
            />
          </motion.div>
        )}

        {step === "REVIEW" && selectedTemplate && (
          <motion.div 
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full flex-grow flex flex-col"
          >
            <PreviewExport 
              template={selectedTemplate} 
              shots={capturedShots} 
              onRetake={handleRetake}
              onFinish={handleFinish}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
