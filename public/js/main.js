import { loadLevel } from "./loader.js";
import Timer from "./timer.js";
import { createMario } from "./Entities.js";
import KeyboardState from "./keyBoardState.js";

const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

Promise.all([loadLevel("1-1"), createMario()]).then(([level, mario]) => {
  mario.position.set(45, 175);
  mario.velocity.set(0, 0);
  level.entities.add(mario);

  const keyboard = new KeyboardState();

  keyboard.addMapping(37, (keyState) => {
    mario.velocity.x = keyState ? -100 : 0;
  });

  keyboard.addMapping(39, (keyState) => {
    mario.velocity.x = keyState ? 100 : 0;
  });

  keyboard.addMapping(32, (keyState) => {
    if (keyState) {
      mario.jump.start();
    } else {
      mario.jump.cancel();
    }
  });

  keyboard.listenTo(window);

  const timer = new Timer(1 / 60);

  timer.update = function updateLogic(dtime) {
    level.update(dtime); // 🔥 FIX
  };

  function render() {
    level.comp.draw(ctx);
  }

  function gameLoop(time) {
    timer.update(time);
    render();
    requestAnimationFrame(gameLoop);
  }

  timer.start();
  requestAnimationFrame(gameLoop);
});
