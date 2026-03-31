import { loadImage } from "./loader.js";
import SpriteSheet from "./spriteSheet.js";

export async function loadMarioSprite() {
  const image = await loadImage("/img/sprites.png");
  const sprites = new SpriteSheet(image, 16, 16);
  sprites.define("idle", 0, 88, 16, 16);
  return sprites;
}

export async function loadBackgroundSprites() {
  // Carica l'immagine delle tiles
  const image = await loadImage("/img/tiles.png");

  // Ogni tile è 16x16
  const sprites = new SpriteSheet(image, 16, 16);

  // Definisci tutte le tile che userai
  sprites.defineTile("ground", 0, 0); // coord X=0, Y=0 nella spritesheet
  sprites.defineTile("sky", 10, 7); // coord X=10, Y=7 nella spritesheet
  sprites.defineTile("platform", 2, 3); // coord X=2, Y=3 nella spritesheet

  // Stampa per debug: quali tile sono pronte
  console.log("Tile definite:", [...sprites.tiles.keys()]);

  return sprites;
}
