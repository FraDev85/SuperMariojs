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
  // ── 1. Entità ──────────────────────────────────────────────────────
  const mario = await createMario();

  // ── 2. Livello ─────────────────────────────────────────────────────
  const level = await loadLevel("1-1");

  mario.setPosition(45, 174);
  level.entities.add(mario);

  const { width: levelWidth, height: levelHeight } = level.getSize(16);

  // ── 3. Camera ──────────────────────────────────────────────────────
  const camera = new Camera(mario, levelWidth, levelHeight);
  camera.snap(canvas.width);
  let cameraLeftBound = camera.position.x;

  // ── 4. Layer ───────────────────────────────────────────────────────
  const backgroundLayer = createBackgroundLayers(
    level,
    level.backgroundSprites,
  );
  level.comp.layers.push((ctx) => backgroundLayer(ctx, camera));

  const spriteLayer = createSpriteLayer(level.entities);
  level.comp.layers.push((ctx) => spriteLayer(ctx, camera));

  const cameraDebugLayer = createCameraLayer(level.entities);
  level.comp.layers.push((ctx) => cameraDebugLayer(ctx, camera));

  // ── 5. Input ───────────────────────────────────────────────────────
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

  // ── 6. Bounds ──────────────────────────────────────────────────────
  function applyBounds() {
    if (mario.position.x < cameraLeftBound) {
      mario.position.x = cameraLeftBound;
      if (mario.velocity.x < 0) mario.velocity.x = 0;
    }

    const rightBound = levelWidth - mario.size.x;
    if (mario.position.x > rightBound) {
      mario.position.x = rightBound;
      if (mario.velocity.x > 0) mario.velocity.x = 0;
    }
  }

  // ── 7. Render ──────────────────────────────────────────────────────
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    level.comp.layers.forEach((layer) => layer(ctx));

    // overlay debug
    ctx.save();
    ctx.font = "10px monospace";
    ctx.fillStyle = "white";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 4;

    [
      `mario.x:    ${mario.position.x.toFixed(1)}`,
      `mario.y:    ${mario.position.y.toFixed(1)}`,
      `vel.x:      ${mario.velocity.x.toFixed(1)}`,
      `vel.y:      ${mario.velocity.y.toFixed(1)}`,
      `camera.x:   ${camera.position.x.toFixed(1)}`,
      `leftBound:  ${cameraLeftBound.toFixed(1)}`,
      `onGround:   ${mario.jump?.onGround}`,
    ].forEach((line, i) => ctx.fillText(line, 8, 14 + i * 14));

    ctx.restore();
  }

  // ── 8. Game loop ───────────────────────────────────────────────────
  const timer = new Timer(1 / 60);

  timer.update = (deltaTime) => {
    handleInput();
    level.update(deltaTime);

    level.entities.forEach((entity) => {
      level.tileCollider.checkX(entity);

      const prevVelY = entity.velocity.y;
      level.tileCollider.checkY(entity);

      if (prevVelY > 0 && entity.velocity.y === 0) {
        if (entity.jump) entity.jump.onGround = true;
      }
    });

    // camera
    camera.update(canvas.width, canvas.height);
    cameraLeftBound = Math.max(cameraLeftBound, camera.position.x);

    // bounds Mario
    applyBounds();

    render();
  };

  timer.start();
}

main();
