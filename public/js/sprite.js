import { loadImage } from "./loader.js";
import SpriteSheet from "./spriteSheet.js";

export async function loadMarioSprite() {
  const image = await loadImage("/img/sprites.png");
  const sprites = new SpriteSheet(image, 16, 16);

  // ── Mario small (riga 5, y=88) ────────────────────────────────────
  sprites.define("small/idle", 0, 88, 16, 16);
  sprites.define("small/walk1", 16, 88, 16, 16);
  sprites.define("small/walk2", 32, 88, 16, 16);
  sprites.define("small/walk3", 48, 88, 16, 16);
  sprites.define("small/jump", 80, 88, 16, 16);
  sprites.define("small/skid", 64, 88, 16, 16);

  sprites.define("big/idle", 112, 88, 16, 32);
  sprites.define("big/walk1", 128, 88, 16, 32);
  sprites.define("big/walk2", 144, 88, 16, 32);
  sprites.define("big/walk3", 160, 88, 16, 32);
  sprites.define("big/jump", 192, 88, 16, 32);
  sprites.define("big/skid", 176, 88, 16, 32);

  return sprites;
}

export async function loadBackgroundSprites() {
  const image = await loadImage("/img/tiles.png");
  const sprites = new SpriteSheet(image, 16, 16);

  sprites.defineTile("ground", 0, 0);
  sprites.defineTile("sky", 10, 7);
  sprites.defineTile("platform", 2, 3);

  return sprites;
}
