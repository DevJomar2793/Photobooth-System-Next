import { describe, expect, it } from "@jest/globals";
import { PHOTO_TEMPLATES, findTemplate } from "../constants/templates";

describe("photo templates", () => {
  it("matches the four web layouts and their four slots", () => {
    expect(PHOTO_TEMPLATES).toHaveLength(4);
    for (const template of PHOTO_TEMPLATES) {
      expect(template.slots.map((slot) => slot.id)).toEqual([1, 2, 3, 4]);
    }
  });

  it("finds a template by its API-safe id", () => {
    expect(findTemplate("film-strip")?.name).toBe("Classic Film Strip");
    expect(findTemplate("missing")).toBeUndefined();
  });
});
