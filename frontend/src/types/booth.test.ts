import { describe, expect, it } from "vitest";
import { TEMPLATES } from "./booth";

describe("photo booth templates", () => {
  it("keeps four uniquely numbered capture slots in each layout", () => {
    for (const template of TEMPLATES) {
      expect(template.slots.map((slot) => slot.id)).toEqual([1, 2, 3, 4]);
    }
  });
});
