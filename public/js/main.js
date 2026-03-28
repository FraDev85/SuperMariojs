import { loadLevel } from "./loader.js";
import Timer from "./timer.js";
import { createMario } from "./entity.js";
import KeyboardState from "./keyBoardState.js";

const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

Promise.all([loadLevel("1-1"), createMario()]).then(([level, mario]) => {
  mario.position.set(45, 175);
  mario.velocity.x = 0;
  mario.velocity.y = 0;

  level.entities.add(mario);

  const keyboard = new KeyboardState();

  keyboard.addMapping(37, (keyState) => {
    mario.velocity.x = keyState ? -100 : 0;
  });
  keyboard.addMapping(39, (keyState) => {
    mario.velocity.x = keyState ? 100 : 0;
  });
  keyboard.addMapping(32, (keyState) => {
    if (keyState) mario.jump.start(mario);
    else mario.jump.cancel();
  });

  keyboard.listenTo(window);

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    level.comp.draw(ctx);
  }

  const timer = new Timer(1 / 60);
  timer.update = (dtime) => {
    level.update(dtime);
    render();
  };

  timer.start();
});
