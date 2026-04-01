// main.js
import { loadLevel } from "./loader.js";
import Timer from "./timer.js";
import { createMario } from "./entity.js";
import KeyboardState from "./keyBoardState.js";
import Camera from "./Camera.js";
import {
  createBackgroundLayers,
  createSpriteLayer,
  createCameraLayer,
} from "./layers.js";

const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

const LEFT = 37;
const RIGHT = 39;
const JUMP = 32;

async function main() {
  // 🎯 1. Crea Mario
  const mario = await createMario();

  // 🎯 2. Carica il livello
  const level = await loadLevel("1-1"); // carica tiles, collider e backgroundSprites

  // Posizione iniziale di Mario
  mario.setPosition(45, 174);
  level.entities.add(mario);

  // Dimensioni del livello in pixel
  const { width: levelWidth, height: levelHeight } = level.getSize(16);

  // 🎯 3. Crea la camera
  const camera = new Camera(mario, levelWidth, levelHeight);

  // 🎯 4. Crea i layer dopo la camera
  const backgroundLayer = createBackgroundLayers(
    level,
    level.backgroundSprites,
  );
  level.comp.layers.push((ctx) => backgroundLayer(ctx, camera));

  const spriteLayer = createSpriteLayer(level.entities);
  level.comp.layers.push((ctx) => spriteLayer(ctx, camera));

  const cameraDebugLayer = createCameraLayer(level.entities);
  level.comp.layers.push((ctx) => cameraDebugLayer(ctx, camera));

  // 🎮 5. Gestione input
  const keyboard = new KeyboardState();
  keyboard.addMapping(LEFT, () => {});
  keyboard.addMapping(RIGHT, () => {});
  keyboard.addMapping(JUMP, (keyState) => {
    if (keyState) mario.jump.start(mario);
    else mario.jump.cancel(mario);
  });
  keyboard.listenTo(window);

  function handleInput() {
    const left = keyboard.keyStates.get(LEFT) === 1;
    const right = keyboard.keyStates.get(RIGHT) === 1;

    if (left && !right) mario.velocity.x = -100;
    else if (right && !left) mario.velocity.x = 100;
    else mario.velocity.x = 0;
  }

  // 🎨 Render
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Disegna tutti i layer con la camera
    level.comp.layers.forEach((layer) => layer(ctx));
  }

  // ⏱️ Game loop
  const timer = new Timer(1 / 60);

  timer.update = (deltaTime) => {
    handleInput(); // input Mario
    level.update(deltaTime); // aggiorna entità
    camera.update(canvas.width, canvas.height); // camera segue Mario
    render(); // disegna tutto
  };

  timer.start();
}

main();
