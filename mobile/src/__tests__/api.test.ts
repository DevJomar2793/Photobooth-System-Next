import { describe, expect, it } from "@jest/globals";
import { AxiosError } from "axios";
import { apiUrl } from "../services/api/apiClient";
import { normalizeApiError } from "../services/api/errors";

describe("API helpers", () => {
  it("builds absolute endpoint URLs", () => {
    expect(apiUrl("/api/images")).toMatch(/^https?:\/\/.+\/api\/images$/);
  });

  it("turns timeouts into a user-safe error", () => {
    const error = normalizeApiError(new AxiosError("timeout", "ECONNABORTED"));
    expect(error.kind).toBe("timeout");
    expect(error.message).not.toContain("ECONNABORTED");
  });
});
