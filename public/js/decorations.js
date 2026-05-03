// decorations.js
import { loadImage } from "./loader.js";

// ── Carica sprite decorativi dal tiles.png ────────────────────────
let decorSprites = null;

export async function loadDecorationSprites() {
  if (decorSprites) return decorSprites;

  const image = await loadImage("/img/tiles.png");

  decorSprites = {
    "cloud-big": { image, sx: 176, sy: 128, sw: 48, sh: 32 },
    "cloud-small": { image, sx: 176, sy: 160, sw: 48, sh: 32 },
    tree: { image, sx: 176, sy: 192, sw: 48, sh: 30 },
    bush: { image, sx: 184, sy: 192, sw: 32, sh: 16 },
  };

  return decorSprites;
}

// ── Layer decoration ─────────────────────────────────────────────

export function createDecorationLayer(
  decorations,
  sprites,
  internalWidth = 256,
  internalHeight = 272,
) {
  return function drawDecorationLayer(ctx, camera) {
    for (const { type, x, y } of decorations) {
      const spr = sprites[type];
      if (!spr) continue;

      const screenX = x - camera.position.x;
      const screenY = y - camera.position.y;

      if (screenX + spr.sw < 0 || screenX > internalWidth) continue;
      if (screenY + spr.sh < 0 || screenY > internalHeight) continue;

      ctx.drawImage(
        spr.image,
        spr.sx,
        spr.sy,
        spr.sw,
        spr.sh,
        screenX,
        screenY,
        spr.sw,
        spr.sh,
      );
    }
  };
}
