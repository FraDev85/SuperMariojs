import { createBackgroundLayers, createSpriteLayer } from "./layers.js";
import Level from "./level.js";
import { loadBackgroundSprites } from "./sprite.js";

export function loadImage(url) {
  return new Promise((resolve) => {
    const image = new Image();
    image.addEventListener("load", () => {
      resolve(image);
    });
    image.src = url;
  });
}

export function loadLevel(name) {
  return Promise.all([
    fetch(`/levels/${name}.json`).then((r) => r.json()),
    loadBackgroundSprites(),
  ]).then(([levelSpec, backgroundSprites]) => {
    const level = new Level();
    const backgroundLayer = createBackgroundLayers(
      levelSpec.backgrounds,
      backgroundSprites,
    );
    level.comp.layers.push(backgroundLayer);
    const spriteLayer = createSpriteLayer(level.entities);
    level.comp.layers.push(spriteLayer);
    return level;
  });
}
