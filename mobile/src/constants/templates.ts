import type { PhotoTemplate } from "../types/booth";

export const PHOTO_TEMPLATES: PhotoTemplate[] = [
  {
    id: "film-strip",
    name: "Classic Film Strip",
    description: "Vertical 4-frame strip with booth footer",
    backgroundColors: ["#1F2229", "#12141A"],
    frameColor: "#F6F1E8",
    captionBackground: "rgba(246, 241, 232, 0.14)",
    captionColor: "#F8F3EA",
    slots: [
      { id: 1, x: 9, y: 5, width: 82, height: 18 },
      { id: 2, x: 9, y: 26, width: 82, height: 18 },
      { id: 3, x: 9, y: 47, width: 82, height: 18 },
      { id: 4, x: 9, y: 68, width: 82, height: 18 },
    ],
  },
  {
    id: "grid",
    name: "Modern Grid",
    description: "Symmetric 2x2 layout with soft spacing",
    backgroundColors: ["#FFFDF8", "#F4EFE7"],
    frameColor: "#FFFFFF",
    captionBackground: "rgba(43, 49, 62, 0.08)",
    captionColor: "#2B313E",
    slots: [
      { id: 1, x: 8, y: 8, width: 38, height: 34 },
      { id: 2, x: 54, y: 8, width: 38, height: 34 },
      { id: 3, x: 8, y: 48, width: 38, height: 34 },
      { id: 4, x: 54, y: 48, width: 38, height: 34 },
    ],
  },
  {
    id: "collage",
    name: "Playful Collage",
    description: "Layered scrapbook arrangement with mixed crops",
    backgroundColors: ["#FFF6ED", "#FFE9DF"],
    frameColor: "#FFFDF9",
    captionBackground: "rgba(102, 69, 46, 0.08)",
    captionColor: "#5F4331",
    slots: [
      { id: 1, x: 8, y: 7, width: 40, height: 28, rotation: -4 },
      { id: 2, x: 50, y: 10, width: 34, height: 22, rotation: 5 },
      { id: 3, x: 12, y: 41, width: 30, height: 28, rotation: 3 },
      { id: 4, x: 44, y: 38, width: 42, height: 32, rotation: -3 },
    ],
  },
  {
    id: "scrapbook",
    name: "Scrapbook Board",
    description: "Editorial composition with bold feature frame",
    backgroundColors: ["#EDF7F3", "#DBECE5"],
    frameColor: "#FEFDF8",
    captionBackground: "rgba(35, 63, 55, 0.08)",
    captionColor: "#233F37",
    slots: [
      { id: 1, x: 8, y: 8, width: 54, height: 46 },
      { id: 2, x: 66, y: 8, width: 24, height: 20 },
      { id: 3, x: 66, y: 32, width: 24, height: 20 },
      { id: 4, x: 12, y: 58, width: 74, height: 22 },
    ],
  },
];

export function findTemplate(templateId: string) {
  return PHOTO_TEMPLATES.find((template) => template.id === templateId);
}
