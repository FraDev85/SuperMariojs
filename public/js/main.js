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
  // ── Entità ─────────────────────────────
  const mario = await createMario();
  const level = await loadLevel("1-1");
  await loadCoinSprites();

  mario.setPosition(45, 174);
  level.entities.add(mario);

  const { width: levelWidth, height: levelHeight } = level.getSize(16);

  // Monete libere sul background
  const stableCoins = [
    new CoinStable(80, 160),
    new CoinStable(150, 120),
    new CoinStable(200, 140),
  ];

  stableCoins.forEach((coin) => level.entities.add(coin));

  // ── Camera ─────────────────────────────
  const camera = new Camera(mario, levelWidth, levelHeight);
  camera.snap(INTERNAL_WIDTH);
  let cameraLeftBound = camera.position.x;

  // ── Layer ──────────────────────────────
  const backgroundLayer = createBackgroundLayers(
    level,
    level.backgroundSprites,
  );
  level.comp.layers.push((ctx) => backgroundLayer(ctx, camera));

  const spriteLayer = createSpriteLayer(level.entities);
  level.comp.layers.push((ctx) => spriteLayer(ctx, camera));

  const cameraDebugLayer = createCameraLayer(level.entities);
  level.comp.layers.push((ctx) => cameraDebugLayer(ctx, camera));

  // ── Input ──────────────────────────────
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

  // ── Render ─────────────────────────────
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#5C94FC";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(scale, scale);
    level.comp.layers.forEach((layer) => layer(ctx));
    ctx.restore();
  }

  // ── Timer / Loop ───────────────────────
  const timer = new Timer(1 / 60);
  timer.update = (deltaTime) => {
    handleInput();
    mario.lastDeltaTime = deltaTime;

    // Aggiorna tutte le entità
    for (const entity of Array.from(level.entities)) {
      if (entity.update) entity.update(deltaTime);
    }

    // Spawna le monete dai blocchi
    for (const e of level.toSpawn) {
      level.entities.add(e);
    }
    level.toSpawn.length = 0;

    // ── Collisioni ─────────────────────────
    for (const entity of Array.from(level.entities)) {
      // Collisione con tile
      if (
        entity.position &&
        entity.velocity &&
        !entity.static &&
        level.tileCollider
      ) {
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

      // Raccolta monete (sia Coin che CoinStable)
      if (entity.onCollect && checkCollision(mario, entity)) {
        console.log("COLLISIONE MONETA");
        entity.onCollect();
        level.entities.delete(entity);
      }

      // Rimuovi Coin con lifetime finita
      if (entity.isAlive && !entity.isAlive()) {
        level.entities.delete(entity);
      }
    }

    camera.update(INTERNAL_WIDTH, INTERNAL_HEIGHT);
    cameraLeftBound = Math.max(cameraLeftBound, camera.position.x);

    applyBounds();
    render();
  };

  timer.start();
}

main();
