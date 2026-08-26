import { describe, expect, it } from "@jest/globals";
import { boothReducer, type BoothState } from "../context/boothReducer";
import { PHOTO_TEMPLATES } from "../constants/templates";

const initialState: BoothState = {
  template: null,
  shots: [],
  finalUri: null,
  hasDraft: false,
  isHydrating: false,
};

describe("booth session reducer", () => {
  it("starts a clean capture when a template is selected", () => {
    const selected = boothReducer(initialState, { type: "SELECT_TEMPLATE", template: PHOTO_TEMPLATES[0] });
    expect(selected.template?.id).toBe("film-strip");
    expect(selected.shots).toEqual([]);
  });

  it("restores and resets an offline draft", () => {
    const restored = boothReducer(initialState, { type: "RESTORE_DRAFT", template: PHOTO_TEMPLATES[1], uri: "file:///draft.jpg" });
    expect(restored.hasDraft).toBe(true);
    expect(restored.finalUri).toBe("file:///draft.jpg");
    expect(boothReducer(restored, { type: "RESET" })).toEqual(initialState);
  });
});
