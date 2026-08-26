const defaultApiUrl = "https://atbackend-photobooth-system-next.onrender.com";

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL?.trim() || defaultApiUrl
).replace(/\/$/, "");

export const API_TIMEOUT_MS = 20_000;
export const CAPTURE_COUNT = 4;
export const TIMER_OPTIONS = [0, 3, 5] as const;
