import { loadLevel } from "./loader.js";
import { loadBackgroundSprites } from "./sprite.js";
import Timer from "./timer.js";
import Compositor from "./compositor.js";
import { createBackgroundLayers, createSpriteLayer } from "./layers.js";
import { createMario } from "./Entities.js";
import KeyboardState from "./keyBoardState.js";

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
    mario.velocity.set(0, 0); // Inizia fermo

    // Configura i controlli
    const keyboard = new KeyboardState();

    // Freccia sinistra (keyCode 37)
    keyboard.addMapping(37, (keyState) => {
      if (keyState) {
        mario.velocity.x = -100; // Muovi a sinistra
      } else {
        mario.velocity.x = 0; // Ferma quando rilasci
      }
    });

    // Freccia destra (keyCode 39)
    keyboard.addMapping(39, (keyState) => {
      if (keyState) {
        mario.velocity.x = 100; // Muovi a destra
      } else {
        mario.velocity.x = 0; // Ferma quando rilasci
      }
    });

    // Spazio per saltare (keyCode 32)
    keyboard.addMapping(32, (keyState) => {
      if (keyState) {
        mario.jump.start(); // Inizia il salto
      } else {
        mario.jump.cancel(); // Cancella il salto se rilasci
      }
    });

    // Collega la tastiera alla finestra
    keyboard.listenTo(window);

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
