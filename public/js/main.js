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

// ── Risoluzione interna fissa (stile NES) ─────────────────────────
// Il gioco gira sempre a 256×240, poi viene scalato al canvas reale.
// Così il JSON non dipende mai dalla dimensione del canvas.
const INTERNAL_WIDTH = 256;
const INTERNAL_HEIGHT = 240;

const scale = Math.min(
  canvas.width / INTERNAL_WIDTH,
  canvas.height / INTERNAL_HEIGHT,
);

// disabilita smoothing per mantenere i pixel nitidi
ctx.imageSmoothingEnabled = false;

const LEFT = 37;
const RIGHT = 39;
const JUMP = 32;

async function main() {
  // ── 1. Entità ──────────────────────────────────────────────────────
  const mario = await createMario();

  // ── 2. Livello ─────────────────────────────────────────────────────
  const level = await loadLevel("1-1");

  // posizione iniziale Mario — coordinate interne (256×240)
  mario.setPosition(45, 174);
  level.entities.add(mario);

  const { width: levelWidth, height: levelHeight } = level.getSize(16);

  // ── 3. Camera ──────────────────────────────────────────────────────
  // la camera usa sempre la risoluzione interna, non quella del canvas
  const camera = new Camera(mario, levelWidth, levelHeight);
  camera.snap(INTERNAL_WIDTH);
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

    if (left && !right) {
      mario.velocity.x = -100;
      mario.facing = -1;
    } else if (right && !left) {
      mario.velocity.x = 100;
      mario.facing = 1;
    } else {
      mario.velocity.x = 0;
    }
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
    // pulisci l'intero canvas reale
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // sfondo cielo
    ctx.fillStyle = "#5C94FC";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // scala al canvas reale mantenendo pixel nitidi
    ctx.save();
    ctx.scale(scale, scale);

    // disegna tutti i layer nella risoluzione interna
    level.comp.layers.forEach((layer) => layer(ctx));

    ctx.restore();
  }

  // ── 8. Game loop ───────────────────────────────────────────────────
  const timer = new Timer(1 / 60);

  timer.update = (deltaTime) => {
    handleInput();

    mario.lastDeltaTime = deltaTime;

    level.update(deltaTime);

    // collisioni
    level.entities.forEach((entity) => {
      if (entity.static) return;
      level.tileCollider.checkX(entity);

      const prevVelY = entity.velocity.y;
      level.tileCollider.checkY(entity);

      if (prevVelY > 0 && entity.velocity.y === 0) {
        if (entity.jump) {
          entity.jump.onGround = true;
          entity.jump.isJumping = false;
        }
      }
    });

    // camera — usa risoluzione interna
    camera.update(INTERNAL_WIDTH, INTERNAL_HEIGHT);
    cameraLeftBound = Math.max(cameraLeftBound, camera.position.x);

    applyBounds();
    render();
  };

  timer.start();
}

main();
