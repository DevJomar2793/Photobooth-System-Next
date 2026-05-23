/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Template, CapturedShot } from "@/types/booth";

interface Props {
  template: Template;
  onComplete: (shots: CapturedShot[]) => void;
  onCancel: () => void;
}

export function CameraStage({ template, onComplete, onCancel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [hasMultipleCams, setHasMultipleCams] = useState(false);
  const [capturedShots, setCapturedShots] = useState<CapturedShot[]>([]);
  const [countdown, setCountdown] = useState<number>(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [timerSec, setTimerSec] = useState<number>(3);

  const startCamera = useCallback(async (mode = facingMode) => {
    setFacingMode(mode);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      setHasMultipleCams(devices.filter((d) => d.kind === "videoinput").length > 1);
    } catch (err) {
      console.error("Camera access denied or unavailable", err);
    }
  }, [stream, facingMode]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchCamera = () => {
    startCamera(facingMode === "user" ? "environment" : "user");
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    if (facingMode === "user") {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    const newShot = { id: Date.now(), dataUrl };
    
    setCapturedShots((prev) => {
      const next = [...prev, newShot];
      if (next.length === 4) {
        setTimeout(() => onComplete(next), 800);
      }
      return next;
    });

    // Flash effect
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 800);
  };

  const triggerCapture = () => {
    if (countdown > 0 || capturedShots.length >= 4) return;
    if (timerSec === 0) {
      takePhoto();
      return;
    }
    
    setCountdown(timerSec);
    let currentCount = timerSec;
    const interval = setInterval(() => {
      currentCount -= 1;
      setCountdown(currentCount);
      if (currentCount <= 0) {
        clearInterval(interval);
        takePhoto();
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto py-8 px-4 h-[calc(100vh-80px)]">
      <div className="w-full flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Capture {capturedShots.length + 1} of 4</h2>
          <p className="text-sm text-muted">Layout: {template.name}</p>
        </div>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-border hover:bg-secondary-hover transition-colors text-sm font-medium">
          Cancel & Change Layout
        </button>
      </div>

      <div className="relative w-full flex-grow flex items-center justify-center bg-black/40 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
        />
        <canvas ref={canvasRef} className="hidden" />

        <AnimatePresence>
          {countdown > 0 && (
            <motion.div 
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="absolute z-20 flex items-center justify-center w-32 h-32 rounded-full bg-black/50 backdrop-blur-md text-6xl font-bold text-white border-4 border-accent"
            >
              {countdown}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isFlashing && (
            <motion.div 
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 bg-white z-30"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Toolbar */}
      <div className="w-full mt-6 flex items-center justify-between glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="flex gap-2 bg-black/30 p-1 rounded-lg">
            {[0, 3, 5].map((time) => (
              <button
                key={time}
                onClick={() => setTimerSec(time)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${timerSec === time ? 'bg-accent text-black shadow-md' : 'text-muted hover:text-white hover:bg-white/10'}`}
              >
                {time}s
              </button>
            ))}
          </div>
          {hasMultipleCams && (
            <button onClick={switchCamera} className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <i className="bi bi-arrow-repeat text-xl"></i>
            </button>
          )}
        </div>

        <button
          onClick={triggerCapture}
          disabled={countdown > 0 || capturedShots.length >= 4}
          className="relative w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center group disabled:opacity-50 transition-all hover:border-white/60"
        >
          <span className="absolute w-14 h-14 bg-white rounded-full group-hover:scale-95 transition-transform group-active:scale-90" />
        </button>

        {/* Mini Film strip preview */}
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => {
            const shot = capturedShots[i];
            return (
              <div key={i} className={`w-12 h-16 rounded-md overflow-hidden border-2 transition-all ${shot ? 'border-accent' : 'border-border bg-black/50'} flex items-center justify-center`}>
                {shot ? (
                  <img src={shot.dataUrl} alt={`Shot ${i+1}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-muted font-bold">{i + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
