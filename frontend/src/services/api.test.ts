import { describe, expect, it } from "vitest";
import { api } from "./api";

describe("API URL helpers", () => {
  it("creates relative URLs when no backend URL is configured", () => {
    expect(api.imageUrl("photo.jpg")).toBe("/uploads/images/photo.jpg");
    expect(api.downloadUrl(42)).toBe("/api/images/42/download");
  });
});
