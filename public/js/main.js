import { loadLevel } from "./loader.js";
import Timer from "./timer.js";
import { createMario } from "./entity.js";
import KeyboardState from "./keyBoardState.js";
import Camera from "./Camera.js";

const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

const LEFT = 37;
const RIGHT = 39;
const JUMP = 32;

Promise.all([loadLevel("1-1"), createMario()]).then(([level, mario]) => {
  // Posizione iniziale
  mario.setPosition(45, 174);
  level.entities.add(mario);

  const { width: levelWidth, height: levelHeight } = level.getSize(16);
  const camera = new Camera(mario, levelWidth, levelHeight);

  // 🎮 Input
  const keyboard = new KeyboardState();

  // inizializza i tasti
  keyboard.addMapping(LEFT, () => {});
  keyboard.addMapping(RIGHT, () => {});
  keyboard.addMapping(JUMP, (keyState) => {
    if (keyState) mario.jump.start(mario);
    else mario.jump.cancel();
  });

  keyboard.listenTo(window);

  // 🧠 Gestione movimento
  function handleInput() {
    const left = keyboard.keyStates.get(LEFT);
    const right = keyboard.keyStates.get(RIGHT);

    if (left && !right) {
      mario.velocity.x = -100;
    } else if (right && !left) {
      mario.velocity.x = 100;
    } else {
      mario.velocity.x = 0;
    }
  }

  // 🎨 Render
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-camera.position.x, -camera.position.y);

    level.comp.draw(ctx);

    ctx.restore();
  }

  // ⏱️ Game loop
  const timer = new Timer(1 / 60);

  timer.update = (deltaTime) => {
    handleInput(); // <-- QUI gestiamo i tasti

    level.update(deltaTime);
    mario.update(deltaTime);
    camera.update(canvas.width, canvas.height);

    render();
  };

  timer.start();
});
