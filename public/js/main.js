import { loadLevel } from "./loader.js";
import { loadBackgroundSprites } from "./sprite.js";
import Timer from "./timer.js";
import Compositor from "./compositor.js";
import { createBackgroundLayers, createSpriteLayer } from "./layers.js";
import { createMario } from "./Entities.js";

const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

Promise.all([loadBackgroundSprites(), loadLevel("1-1"), createMario()]).then(
  ([backgroundSprites, level, mario]) => {
    const backgroundLayer = createBackgroundLayers(
      level.backgrounds,
      backgroundSprites
    );
    const comp = new Compositor();
    comp.push(backgroundLayer);

    mario.position.set(45, 175);
    mario.velocity.set(3, 0);

    const spriteLayer = createSpriteLayer(mario);
    comp.layers.push(spriteLayer);

    const dtime = 1 / 60;
    const timer = new Timer(1 / 60);

    timer.update = function updateLogic(dtime) {
      mario.update(dtime);
    };
    function render() {
      comp.draw(ctx);
    }

    function gameLoop(time) {
      timer.update(dtime);
      render();
      requestAnimationFrame(gameLoop);
    }

    timer.start();
    requestAnimationFrame(gameLoop);
  }
);
