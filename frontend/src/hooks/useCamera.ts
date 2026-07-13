"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type FacingMode = "user" | "environment";

const VIDEO_CONSTRAINTS = {
  width: { ideal: 1920 },
  height: { ideal: 1080 },
} as const;

export function useCamera(initialFacingMode: FacingMode = "user") {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>(initialFacingMode);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async (mode: FacingMode) => {
    stopCamera();
    setFacingMode(mode);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, ...VIDEO_CONSTRAINTS },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      const devices = await navigator.mediaDevices.enumerateDevices();
      setHasMultipleCameras(
        devices.filter((device) => device.kind === "videoinput").length > 1,
      );
    } catch (cause) {
      console.error("Camera access denied or unavailable", cause);
      setError("Camera access is unavailable. Check your browser permissions and try again.");
    }
  }, [stopCamera]);

  useEffect(() => {
    void startCamera(initialFacingMode);
    return stopCamera;
  }, [initialFacingMode, startCamera, stopCamera]);

  const switchCamera = useCallback(() => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    void startCamera(nextMode);
  }, [facingMode, startCamera]);

  return { error, facingMode, hasMultipleCameras, switchCamera, videoRef };
}
