import type { GalleryImage, GallerySort } from "../types/api";

export function filterAndSortImages(images: GalleryImage[], search: string, sort: GallerySort) {
  const query = search.trim().toLowerCase();
  const filtered = query
    ? images.filter((image) =>
        `${image.original_name ?? ""} ${image.user ?? ""}`.toLowerCase().includes(query),
      )
    : [...images];

  return filtered.sort((a, b) => {
    if (sort === "user") return (a.user ?? "").localeCompare(b.user ?? "");
    const aTime = a.captured_at ? new Date(a.captured_at).getTime() : 0;
    const bTime = b.captured_at ? new Date(b.captured_at).getTime() : 0;
    return sort === "oldest" ? aTime - bTime : bTime - aTime;
  });
}
