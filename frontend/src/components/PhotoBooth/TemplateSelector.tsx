"use client";

import React from "react";
import { motion } from "framer-motion";
import { TEMPLATES, Template } from "@/types/booth";

interface Props {
  onSelect: (template: Template) => void;
}

export function TemplateSelector({ onSelect }: Props) {
  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h2 className="text-sm font-semibold tracking-wider text-accent uppercase mb-2">Step 1</h2>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Layout</h1>
        <p className="text-muted max-w-lg mx-auto">
          Select a template for your photo session. You will take 4 shots that will automatically be arranged into your chosen design.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {TEMPLATES.map((template, index) => (
          <motion.button
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(template)}
            className="group relative flex flex-col items-center glass-panel rounded-2xl p-6 text-left hover:border-accent transition-colors duration-300 overflow-hidden"
          >
            {/* Visual Mini Template Representation */}
            <div 
              className="w-32 h-44 mb-6 rounded-lg relative shadow-lg overflow-hidden flex-shrink-0"
              style={{ background: template.background }}
            >
              {template.slots.map((slot) => (
                <div
                  key={slot.id}
                  className="absolute rounded-[2px]"
                  style={{
                    left: `${slot.x}%`,
                    top: `${slot.y}%`,
                    width: `${slot.w}%`,
                    height: `${slot.h}%`,
                    transform: `rotate(${slot.rotate || 0}deg)`,
                    background: template.frame,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                  }}
                />
              ))}
              
              {/* Mini Caption */}
              <div 
                className="absolute bottom-2 left-2 right-2 h-4 rounded-sm flex items-center justify-center text-[5px] font-bold"
                style={{ background: template.captionBg, color: template.captionColor }}
              >
                SnapCapture Booth
              </div>
            </div>

            <div className="w-full">
              <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">{template.name}</h3>
              <p className="text-xs text-muted leading-relaxed">{template.label}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
