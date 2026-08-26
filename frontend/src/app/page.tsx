"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TemplateSelector } from "@/components/PhotoBooth/TemplateSelector";
import { CameraStage } from "@/components/PhotoBooth/CameraStage";
import { PreviewExport } from "@/components/PhotoBooth/PreviewExport";
import { useBoothFlow } from "@/hooks/useBoothFlow";

export default function Home() {
  const flow = useBoothFlow();

  return (
    <div className="w-full flex-grow flex flex-col">
      <AnimatePresence mode="wait">
        {flow.step === "SELECT_TEMPLATE" && (
          <motion.div 
            key="select"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full flex-grow flex flex-col"
          >
            <TemplateSelector onSelect={flow.selectTemplate} />
          </motion.div>
        )}

        {flow.step === "CAPTURE" && flow.selectedTemplate && (
          <motion.div 
            key="capture"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full flex-grow flex flex-col"
          >
            <CameraStage 
              template={flow.selectedTemplate}
              onComplete={flow.completeCapture}
              onCancel={flow.returnToTemplateSelection}
            />
          </motion.div>
        )}

        {flow.step === "REVIEW" && flow.selectedTemplate && (
          <motion.div 
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full flex-grow flex flex-col"
          >
            <PreviewExport 
              template={flow.selectedTemplate}
              shots={flow.capturedShots}
              onRetake={flow.retakePhotos}
              onFinish={flow.returnToTemplateSelection}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
