import { loadImage } from "./loader.js";
import SpriteSheet from "./spriteSheet.js";

export async function loadMarioSprite() {
  const image = await loadImage("/img/sprites.png");
  const sprites = new SpriteSheet(image, 27, 27);
  sprites.define("idle", 0, 88, 16, 16);
  return sprites;
}

export async function loadBackgroundSprites() {
  const image = await loadImage("/img/tiles.png");
  const sprites = new SpriteSheet(image, 16, 16);
  sprites.defineTile("ground", 0, 0);
  sprites.defineTile("sky", 10, 7);
  return sprites;
}
