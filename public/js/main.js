import { loadLevel } from "./loader.js";
import { loadMarioSprite, loadBackgroundSprites } from "./sprite.js";
import Compositor from "./compositor.js";
import { createBackgroundLayers } from "./layers.js";

function createSpriteLayer(sprite, position) {
  return function drawSpriteLayer(ctx) {
    for (let i = 0; i < 15; ++i) {
      sprite.draw("idle", ctx, position.x * i * 16, position.y);
    }
  };
}

const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

Promise.all([
  loadBackgroundSprites(),
  loadLevel("1-1"),
  loadMarioSprite(),
]).then(([backgroundSprites, Level, marioSprite]) => {
  const backgroundLayer = createBackgroundLayers(
    Level.backgrounds,
    backgroundSprites
  );
  const comp = new Compositor();
  comp.push(backgroundLayer);

  const position = {
    x: 0,
    y: 0,
  };

  const spriteLayer = createSpriteLayer(marioSprite, position);
  comp.layers.push(spriteLayer);

  function update() {
    comp.draw(ctx);
    position.x++;
    position.y++;
    requestAnimationFrame(update);
  }

  update();
});
