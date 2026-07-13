import { CapturedShot, Template } from "@/types/booth";

const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 2200;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function clipRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.clip();
}

function fillRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, fill: string) {
  ctx.save();
  ctx.fillStyle = fill;
  ctx.shadowColor = "rgba(0,0,0,0.15)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 20;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
  ctx.restore();
}

function drawCoverImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.max(width / image.width, height / image.height) * 1.08;
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function createBackground(ctx: CanvasRenderingContext2D, background: string) {
  const colors = background.match(/#[\da-f]{3,8}/gi);
  if (!colors || colors.length < 2) return background;

  const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });
  return gradient;
}

export async function renderComposition(template: Template, shots: CapturedShot[]) {
  if (shots.length === 0) return null;

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = createBackground(ctx, template.background);
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const slot of template.slots) {
    const x = (slot.x / 100) * canvas.width;
    const y = (slot.y / 100) * canvas.height;
    const width = (slot.w / 100) * canvas.width;
    const height = (slot.h / 100) * canvas.height;
    const radius = Math.min(width, height) * 0.08;
    const inset = 18;

    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(((slot.rotate ?? 0) * Math.PI) / 180);
    ctx.translate(-(x + width / 2), -(y + height / 2));
    fillRoundedRect(ctx, x, y, width, height, radius, template.frame);

    const shot = shots[slot.id - 1];
    if (shot) {
      ctx.save();
      clipRoundedRect(ctx, x + inset, y + inset, width - inset * 2, height - inset * 2, Math.max(radius - 8, 16));
      drawCoverImage(ctx, await loadImage(shot.dataUrl), x + inset, y + inset, width - inset * 2, height - inset * 2);
      ctx.restore();
    }
    ctx.restore();
  }

  const captionHeight = 180;
  const captionY = canvas.height - captionHeight - 56;
  fillRoundedRect(ctx, 64, captionY, canvas.width - 128, captionHeight, 56, template.captionBg);
  ctx.fillStyle = template.captionColor;
  ctx.font = '600 42px "Inter", sans-serif';
  ctx.fillText(template.label, 112, captionY + 78);
  ctx.font = '700 58px "Inter", sans-serif';
  ctx.fillText("SnapCapture Booth", 112, captionY + 138);

  return canvas.toDataURL("image/jpeg", 0.96);
}
