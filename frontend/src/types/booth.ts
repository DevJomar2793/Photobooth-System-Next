export interface TemplateSlot {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  rotate?: number;
}

export interface Template {
  id: string;
  name: string;
  label: string;
  background: string;
  frame: string;
  captionBg: string;
  captionColor: string;
  slots: TemplateSlot[];
}

export interface CapturedShot {
  id: number;
  dataUrl: string;
}

export const TEMPLATES: Template[] = [
  {
    id: "film-strip",
    name: "Classic Film Strip",
    label: "Vertical 4-frame strip with booth footer",
    background: "linear-gradient(180deg, #1f2229 0%, #12141a 100%)",
    frame: "#f6f1e8",
    captionBg: "rgba(246, 241, 232, 0.14)",
    captionColor: "#f8f3ea",
    slots: [
      { id: 1, x: 9, y: 5, w: 82, h: 18 },
      { id: 2, x: 9, y: 26, w: 82, h: 18 },
      { id: 3, x: 9, y: 47, w: 82, h: 18 },
      { id: 4, x: 9, y: 68, w: 82, h: 18 },
    ],
  },
  {
    id: "grid",
    name: "Modern Grid",
    label: "Symmetric 2x2 layout with soft spacing",
    background: "linear-gradient(135deg, #fffdf8 0%, #f4efe7 100%)",
    frame: "#ffffff",
    captionBg: "rgba(43, 49, 62, 0.08)",
    captionColor: "#2b313e",
    slots: [
      { id: 1, x: 8, y: 8, w: 38, h: 34 },
      { id: 2, x: 54, y: 8, w: 38, h: 34 },
      { id: 3, x: 8, y: 48, w: 38, h: 34 },
      { id: 4, x: 54, y: 48, w: 38, h: 34 },
    ],
  },
  {
    id: "collage",
    name: "Playful Collage",
    label: "Layered scrapbook arrangement with mixed crops",
    background: "linear-gradient(135deg, #fff6ed 0%, #ffe9df 100%)",
    frame: "#fffdf9",
    captionBg: "rgba(102, 69, 46, 0.08)",
    captionColor: "#5f4331",
    slots: [
      { id: 1, x: 8, y: 7, w: 40, h: 28, rotate: -4 },
      { id: 2, x: 50, y: 10, w: 34, h: 22, rotate: 5 },
      { id: 3, x: 12, y: 41, w: 30, h: 28, rotate: 3 },
      { id: 4, x: 44, y: 38, w: 42, h: 32, rotate: -3 },
    ],
  },
  {
    id: "scrapbook",
    name: "Scrapbook Board",
    label: "Editorial composition with bold feature frame",
    background: "linear-gradient(145deg, #edf7f3 0%, #dbece5 100%)",
    frame: "#fefdf8",
    captionBg: "rgba(35, 63, 55, 0.08)",
    captionColor: "#233f37",
    slots: [
      { id: 1, x: 8, y: 8, w: 54, h: 46 },
      { id: 2, x: 66, y: 8, w: 24, h: 20 },
      { id: 3, x: 66, y: 32, w: 24, h: 20 },
      { id: 4, x: 12, y: 58, w: 74, h: 22 },
    ],
  },
];
