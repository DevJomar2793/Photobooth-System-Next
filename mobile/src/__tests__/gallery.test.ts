import { describe, expect, it } from "@jest/globals";
import type { GalleryImage } from "../types/api";
import { filterAndSortImages } from "../utils/gallery";

const images: GalleryImage[] = [
  { id: 1, filename: "one.jpg", original_name: "Classic", user: "Zoe", captured_at: "2026-01-01T00:00:00Z", width: 1, height: 1, file_size: 1, url: "/one" },
  { id: 2, filename: "two.jpg", original_name: "Grid", user: "Ana", captured_at: "2026-02-01T00:00:00Z", width: 1, height: 1, file_size: 1, url: "/two" },
];

describe("gallery filtering", () => {
  it("searches names and users", () => {
    expect(filterAndSortImages(images, "classic", "newest").map((image) => image.id)).toEqual([1]);
    expect(filterAndSortImages(images, "ana", "newest").map((image) => image.id)).toEqual([2]);
  });

  it("sorts by date and user", () => {
    expect(filterAndSortImages(images, "", "newest").map((image) => image.id)).toEqual([2, 1]);
    expect(filterAndSortImages(images, "", "oldest").map((image) => image.id)).toEqual([1, 2]);
    expect(filterAndSortImages(images, "", "user").map((image) => image.id)).toEqual([2, 1]);
  });
});
