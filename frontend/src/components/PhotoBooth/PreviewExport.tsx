"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Template, CapturedShot } from "@/types/booth";
import { api } from "@/services/api";

interface Props {
  template: Template;
  shots: CapturedShot[];
  onRetake: () => void;
  onFinish: () => void;
}

function drawPhotoInSlot(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const baseScale = Math.max(w / img.width, h / img.height);
  const drawWidth = img.width * baseScale * 1.08;
  const drawHeight = img.height * baseScale * 1.08;
  const centerX = x + w / 2;
  const centerY = y + h / 2;
  ctx.drawImage(img, centerX - drawWidth / 2, centerY - drawHeight / 2, drawWidth, drawHeight);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string) {
  ctx.save();
  clipRoundedRect(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.shadowColor = "rgba(0,0,0,0.15)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 20;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

function clipRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.clip();
}

export function PreviewExport({ template, shots, onRetake, onFinish }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Move useEffect below to fix lint

  const renderComposition = async () => {
    if (shots.length === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 2200;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    if (template.id === "film-strip") {
      bg.addColorStop(0, "#1f2229"); bg.addColorStop(1, "#12141a");
    } else if (template.id === "grid") {
      bg.addColorStop(0, "#fffdf8"); bg.addColorStop(1, "#f4efe7");
    } else if (template.id === "collage") {
      bg.addColorStop(0, "#fff6ed"); bg.addColorStop(1, "#ffe9df");
    } else {
      bg.addColorStop(0, "#edf7f3"); bg.addColorStop(1, "#dbece5");
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render Slots
    for (const slot of template.slots) {
      const shot = shots[slot.id - 1];
      const slotX = (slot.x / 100) * canvas.width;
      const slotY = (slot.y / 100) * canvas.height;
      const slotW = (slot.w / 100) * canvas.width;
      const slotH = (slot.h / 100) * canvas.height;
      const radius = Math.min(slotW, slotH) * 0.08;

      ctx.save();
      ctx.translate(slotX + slotW / 2, slotY + slotH / 2);
      ctx.rotate(((slot.rotate || 0) * Math.PI) / 180);
      ctx.translate(-(slotX + slotW / 2), -(slotY + slotH / 2));

      // Draw Frame
      drawRoundedRect(ctx, slotX, slotY, slotW, slotH, radius, template.frame);
      
      ctx.save();
      clipRoundedRect(ctx, slotX + 18, slotY + 18, slotW - 36, slotH - 36, Math.max(radius - 8, 16));

      if (shot) {
        const img = await loadImage(shot.dataUrl);
        drawPhotoInSlot(ctx, img, slotX + 18, slotY + 18, slotW - 36, slotH - 36);
      }

      ctx.restore();
      ctx.restore();
    }

    // Caption
    const captionHeight = 180;
    const captionY = canvas.height - captionHeight - 56;
    drawRoundedRect(ctx, 64, captionY, canvas.width - 128, captionHeight, 56, template.captionBg);
    ctx.fillStyle = template.captionColor;
    ctx.font = '600 42px "Inter", sans-serif';
    ctx.fillText(template.label, 112, captionY + 78);
    ctx.font = '700 58px "Inter", sans-serif';
    ctx.fillText("SnapCapture Booth", 112, captionY + 138);

    setPreviewUrl(canvas.toDataURL("image/jpeg", 0.96));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    renderComposition();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadImage = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = `snapcapture-${template.id}-${Date.now()}.jpg`;
    link.click();
  };

  const handleSaveAndFinish = async () => {
    if (!previewUrl || uploadSuccess) {
      onFinish();
      return;
    }
    
    setIsUploading(true);
    try {
      const res = await fetch(previewUrl);
      const blob = await res.blob();
      await api.uploadImage(blob, "WebUser", `snapcapture-${template.id}`);
      setUploadSuccess(true);
      setTimeout(() => onFinish(), 1500);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image to gallery. You can still download it.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-80px)] py-12 px-4">
      <div className="text-center mb-8">
        <h2 className="text-sm font-semibold tracking-wider text-accent uppercase mb-2">Final Step</h2>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Photo Booth Strip</h1>
        <p className="text-muted">High-resolution export ready for download or saving to the gallery.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-10 items-center justify-center w-full max-w-5xl">
        {/* Preview Container */}
        <div className="relative w-full max-w-sm shrink-0">
          {previewUrl ? (
            <motion.img 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              src={previewUrl} 
              alt="Final Composed Image" 
              className="w-full rounded-xl shadow-2xl booth-shadow"
            />
          ) : (
            <div className="w-full aspect-[16/22] bg-border/30 rounded-xl flex items-center justify-center animate-pulse">
              <span className="text-muted font-medium">Generating composition...</span>
            </div>
          )}
        </div>

        {/* Actions Container */}
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button 
            onClick={downloadImage}
            disabled={!previewUrl}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-secondary hover:bg-secondary-hover text-white font-medium transition-colors disabled:opacity-50"
          >
            <i className="bi bi-download"></i> Download Locally
          </button>
          
          <button 
            onClick={handleSaveAndFinish}
            disabled={!previewUrl || isUploading}
            className={`flex items-center justify-center gap-2 w-full py-4 rounded-xl font-medium transition-colors disabled:opacity-50 ${uploadSuccess ? 'bg-green-600 text-white' : 'bg-primary hover:bg-primary-hover text-white'}`}
          >
            {isUploading ? (
              <span className="animate-pulse">Uploading...</span>
            ) : uploadSuccess ? (
              <><i className="bi bi-check-circle-fill"></i> Saved! Finishing...</>
            ) : (
              <><i className="bi bi-cloud-arrow-up"></i> Save to Gallery & Finish</>
            )}
          </button>

          <div className="h-px bg-border my-2 w-full" />

          <button 
            onClick={onRetake}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-transparent border border-border hover:border-accent text-muted hover:text-white transition-colors"
          >
            <i className="bi bi-arrow-counterclockwise"></i> Retake Photos
          </button>
        </div>
      </div>
    </div>
  );
}
