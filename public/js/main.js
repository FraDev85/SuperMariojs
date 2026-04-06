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
import { checkCollision, loadCoinSprites } from "./coin.js";
import CoinStable from "./coinStable.js";

const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

const INTERNAL_WIDTH = 256;
const INTERNAL_HEIGHT = 240;
const scale = Math.min(
  canvas.width / INTERNAL_WIDTH,
  canvas.height / INTERNAL_HEIGHT,
);

ctx.imageSmoothingEnabled = false;

const LEFT = 37;
const RIGHT = 39;
const JUMP = 32;

async function main() {
  // ── 1. Entità ──────────────────────────────────────────────────────
  const mario = await createMario();
  const level = await loadLevel("1-1", mario);
  await loadCoinSprites();

  mario.setPosition(45, 174);
  level.entities.add(mario);

  const { width: levelWidth } = level.getSize(16);

  // Monete statiche di esempio
  const stableCoins = [
    new CoinStable(80, 160),
    new CoinStable(150, 120),
    new CoinStable(200, 140),
  ];
  stableCoins.forEach((coin) => level.entities.add(coin));

  // ── 2. Camera ──────────────────────────────────────────────────────
  const camera = new Camera(mario, levelWidth, 240);
  camera.snap(INTERNAL_WIDTH);
  let cameraLeftBound = camera.position.x;

  // ── 3. Layer ───────────────────────────────────────────────────────
  const backgroundLayer = createBackgroundLayers(
    level,
    level.backgroundSprites,
  );
  level.comp.layers.push((ctx) => backgroundLayer(ctx, camera));

  const spriteLayer = createSpriteLayer(level.entities);
  level.comp.layers.push((ctx) => spriteLayer(ctx, camera));

  const cameraDebugLayer = createCameraLayer(level.entities);
  level.comp.layers.push((ctx) => cameraDebugLayer(ctx, camera));

  // ── 4. Input ───────────────────────────────────────────────────────
  const keyboard = new KeyboardState();
  keyboard.addMapping(LEFT, () => {});
  keyboard.addMapping(RIGHT, () => {});
  keyboard.addMapping(JUMP, (keyState) => {
    // 🔒 blocca il salto durante il power-up
    if (mario.isPoweringUp) return;
    if (keyState) mario.jump.start(mario);
    else mario.jump.cancel(mario);
  });
  keyboard.listenTo(window);

  function handleInput() {
    // 🔒 blocca tutto il movimento durante il power-up
    if (mario.isPoweringUp) {
      mario.velocity.x = 0;
      mario.velocity.y = 0;
      return;
    }

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

  // ── 5. Bounds ──────────────────────────────────────────────────────
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

  // ── 6. Render ──────────────────────────────────────────────────────
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#5C94FC";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(scale, scale);
    level.comp.layers.forEach((layer) => layer(ctx));
    ctx.restore();
  }

  // ── 7. Game loop ───────────────────────────────────────────────────
  const timer = new Timer(1 / 60);

  timer.update = (deltaTime) => {
    handleInput();
    mario.lastDeltaTime = deltaTime;

    // aggiorna tutte le entità
    level.update(deltaTime);

    // ── Collisioni tile ───────────────────────────────────────────
    for (const entity of level.entities) {
      if (!entity.position || !entity.velocity || entity.static) continue;

      // collisione fungo: rimbalza sui muri
      if (entity.isMushroom) {
        const prevVelX = entity.velocity.x;
        level.tileCollider.checkX(entity);
        // se ha colpito un muro (velocity.x azzerato) → inverti direzione
        if (prevVelX !== 0 && entity.velocity.x === 0) {
          entity.velocity.x = prevVelX > 0 ? -60 : 60;
        }
        level.tileCollider.checkY(entity);
        continue;
      }

      // collisione normale (Mario, monete con gravità, ecc.)
      level.tileCollider.checkX(entity);
      const prevVelY = entity.velocity.y;
      level.tileCollider.checkY(entity);

      if (prevVelY > 0 && entity.velocity.y === 0) {
        if (entity.jump) {
          entity.jump.onGround = true;
          entity.jump.isJumping = false;
        }
      }
    }

    // ── Raccolta monete e funghi ──────────────────────────────────
    for (const entity of [...level.entities]) {
      // rimuovi entità morte
      if (entity.isAlive && !entity.isAlive()) {
        level.entities.delete(entity);
        continue;
      }

      if (!entity.onCollect) continue;

      // collisione con Mario
      if (checkCollision(mario, entity)) {
        entity.onCollect(mario);
        level.entities.delete(entity);
      }
    }

    // ── Camera ────────────────────────────────────────────────────
    camera.update(INTERNAL_WIDTH, INTERNAL_HEIGHT);
    cameraLeftBound = Math.max(cameraLeftBound, camera.position.x);

    applyBounds();
    render();
  };

  timer.start();
}

main();
