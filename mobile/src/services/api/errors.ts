import { isAxiosError } from "axios";

export type ApiErrorKind =
  | "network"
  | "timeout"
  | "unauthorized"
  | "validation"
  | "server"
  | "unknown";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly kind: ApiErrorKind,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (!isAxiosError(error)) {
    return new ApiError("Something went wrong. Please try again.", "unknown");
  }
  if (error.code === "ECONNABORTED") {
    return new ApiError("The request timed out. Please try again.", "timeout");
  }
  if (!error.response) {
    return new ApiError("Unable to reach the server. Check your connection.", "network");
  }

  const status = error.response.status;
  if (status === 401) {
    return new ApiError("Your session is not authorized.", "unauthorized", status);
  }
  if (status === 400 || status === 422) {
    return new ApiError("The submitted photo could not be accepted.", "validation", status);
  }
  if (status >= 500) {
    return new ApiError("The server is temporarily unavailable.", "server", status);
  }
  return new ApiError("The request could not be completed.", "unknown", status);
}
