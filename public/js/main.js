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
import { createGoomba } from "./goomba.js";

const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

const INTERNAL_WIDTH  = 256;
const INTERNAL_HEIGHT = 240;
const scale = Math.min(
  canvas.width  / INTERNAL_WIDTH,
  canvas.height / INTERNAL_HEIGHT,
);

ctx.imageSmoothingEnabled = false;

const LEFT  = 37;
const RIGHT = 39;
const JUMP  = 32;

// ── Audio morte Mario ──────────────────────────────────────────────
const deathSound = new Audio("../sounds/mario-death.ogg");

async function main() {
  // ── 1. Entità ──────────────────────────────────────────────────────
  const mario = await createMario();
  const level = await loadLevel("1-1", mario);
  await loadCoinSprites();

  mario.setPosition(45, 174);
  level.entities.add(mario);

  const { width: levelWidth } = level.getSize(16);

  // ── Monete statiche ────────────────────────────────────────────────
  const stableCoins = [
    new CoinStable(80,  160),
    new CoinStable(150, 120),
    new CoinStable(200, 140),
  ];
  stableCoins.forEach((coin) => level.entities.add(coin));

  // ── Goomba dal livello ─────────────────────────────────────────────
  // Posizioni definite qui; in futuro puoi spostarle nel JSON del livello
  const goombaSpawns = [
    { x: 400, y: 174 },
    { x: 600, y: 174 },
    { x: 900, y: 174 },
  ];

  for (const { x, y } of goombaSpawns) {
    const goomba = await createGoomba();
    goomba.setPosition(x, y);
    level.entities.add(goomba);
  }

  // ── 2. Stato Mario ─────────────────────────────────────────────────
  let marioAlive   = true;
  let marioDeadTimer = 0;

  // ── 3. Camera ──────────────────────────────────────────────────────
  const camera = new Camera(mario, levelWidth, 240);
  camera.snap(INTERNAL_WIDTH);
  let cameraLeftBound = camera.position.x;

  // ── 4. Layer ───────────────────────────────────────────────────────
  const backgroundLayer = createBackgroundLayers(level, level.backgroundSprites);
  level.comp.layers.push((ctx) => backgroundLayer(ctx, camera));

  const spriteLayer = createSpriteLayer(level.entities);
  level.comp.layers.push((ctx) => spriteLayer(ctx, camera));

  // ── 5. Input ───────────────────────────────────────────────────────
  const keyboard = new KeyboardState();
  keyboard.addMapping(LEFT,  () => {});
  keyboard.addMapping(RIGHT, () => {});
  keyboard.addMapping(JUMP, (keyState) => {
    if (!marioAlive) return;
    if (mario.isPoweringUp) return;
    if (keyState) mario.jump.start(mario);
    else          mario.jump.cancel(mario);
  });
  keyboard.listenTo(window);

  function handleInput() {
    if (!marioAlive || mario.isPoweringUp) {
      mario.velocity.x = 0;
      return;
    }

    const left  = keyboard.keyStates.get(LEFT)  === 1;
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

    // Morte per caduta fuori schermo
    if (mario.position.y > INTERNAL_HEIGHT + 64) {
      killMario("fall");
    }
  }

  // ── 7. Morte Mario ─────────────────────────────────────────────────
  function killMario(cause) {
    if (!marioAlive) return;
    marioAlive = false;
    marioDeadTimer = 3; // secondi prima del respawn

    mario.velocity.x = 0;
    mario.velocity.y = -400; // balzo verso l'alto
    mario.jump.onGround = false;

    // Disabilita collisioni tile per Mario morto (traversa il pavimento)
    mario._dead = true;

    deathSound.currentTime = 0;
    deathSound.play().catch(() => {}); // catch per autoplay policy
  }

  // ── 8. Collisione Mario ↔ Goomba ──────────────────────────────────
  function checkGoombaCollisions(marioVelY = mario.velocity.y) {
    if (!marioAlive) return;

    for (const entity of level.entities) {
      if (!entity.isGoomba || entity.dead) continue;
      if (!checkCollision(mario, entity)) continue;

      // ── Stomp: Mario colpisce il Goomba dall'alto ──────────────
      // La gravità accumula velocity.y anche a terra, quindi non basta
      // la velocity come discriminante. Usiamo l'overlap verticale:
      // - overlap piccolo (<=6px) + Mario stava cadendo = entrato dall'alto
      // - overlap grande = Mario era gia di fianco al Goomba
      const marioBottom     = mario.position.y + mario.size.y;
      const goombaTop       = entity.position.y;
      const verticalOverlap = marioBottom - goombaTop;
      const isStomp         = marioVelY > 0 && verticalOverlap >= 0 && verticalOverlap <= 6;

      if (isStomp) {
        entity.stomp();
        // Rimbalzino di Mario dopo lo stomp
        mario.velocity.y = -200;
        mario.jump.onGround = false;
        mario.jump.isJumping = true;
      } else {
        // ── Tocco laterale → Mario muore (o perde power-up) ────────
        if (mario.isBig) {
          // Mario grande → diventa piccolo
          shrinkMario();
        } else {
          killMario("goomba");
        }
      }
    }
  }

  // ── 9. Rimpicciolimento Mario ──────────────────────────────────────
  let isShrinking = false;
  function shrinkMario() {
    if (isShrinking) return;
    isShrinking = true;

    // Riposiziona in basso (hitbox piccola)
    mario.isBig = false;
    const oldBottom = mario.position.y + mario.size.y;
    mario.size.y = 16;
    mario.position.y = oldBottom - mario.size.y;

    // Breve invincibilità
    setTimeout(() => { isShrinking = false; }, 1500);
  }

  // ── 10. Render ─────────────────────────────────────────────────────
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#5C94FC";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(scale, scale);
    level.comp.layers.forEach((layer) => layer(ctx));
    ctx.restore();

    // ── Game Over overlay ────────────────────────────────────────
    if (!marioAlive && marioDeadTimer <= 0) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.font = "bold 32px monospace";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
      ctx.font = "16px monospace";
      ctx.fillText("Premi F5 per ricominciare", canvas.width / 2, canvas.height / 2 + 40);
    }
  }

  // ── 11. Game loop ──────────────────────────────────────────────────
  const timer = new Timer(1 / 60);

  timer.update = (deltaTime) => {
    handleInput();
    mario.lastDeltaTime = deltaTime;

    // ── Countdown morte Mario ────────────────────────────────────
    if (!marioAlive) {
      marioDeadTimer -= deltaTime;

      // Durante la morte Mario vola per aria (solo gravità, niente tile)
      mario.velocity.y += 1200 * deltaTime;
      mario.position.y += mario.velocity.y * deltaTime;

      camera.update(INTERNAL_WIDTH, INTERNAL_HEIGHT);
      render();
      return;
    }

    // ── Aggiorna entità ──────────────────────────────────────────
    level.update(deltaTime);

    // Salva la velocity.y di Mario PRIMA che checkY la azzeri —
    // serve per rilevare correttamente lo stomp sui Goomba
    const marioVelYBeforeCheck = mario.velocity.y;

    // ── Collisioni tile ──────────────────────────────────────────
    for (const entity of level.entities) {
      if (!entity.position || !entity.velocity) continue;
      if (entity.static) continue;

      // ── Goomba ──────────────────────────────────────────────────
      if (entity.isGoomba) {
        if (entity.dead) continue;

        entity.position.x += entity.velocity.x * deltaTime;
        const prevVelX = entity.velocity.x;
        level.tileCollider.checkX(entity);
        if (prevVelX !== 0 && entity.velocity.x === 0) {
          entity.reverse();
        }

        entity.position.y += entity.velocity.y * deltaTime;
        level.tileCollider.checkY(entity);
        continue;
      }

      // ── Fungo ────────────────────────────────────────────────────
      if (entity.isMushroom) {
        if (entity.emerging) continue;

        entity.position.x += entity.velocity.x * deltaTime;
        const prevVelX = entity.velocity.x;
        level.tileCollider.checkX(entity);
        if (prevVelX !== 0 && entity.velocity.x === 0) {
          entity.reverse();
        }

        entity.position.y += entity.velocity.y * deltaTime;
        level.tileCollider.checkY(entity);
        continue;
      }

      // ── Mario e entità normali ────────────────────────────────────
      level.tileCollider.checkX(entity);
      const prevVelY = entity.velocity.y;
      level.tileCollider.checkY(entity);

      if (prevVelY > 0 && entity.velocity.y === 0) {
        if (entity.jump) {
          entity.jump.onGround  = true;
          entity.jump.isJumping = false;
        }
      }
    }

    // ── Raccolta monete / funghi + pulizia entità morte ──────────
    for (const entity of [...level.entities]) {
      if (entity.isAlive && !entity.isAlive()) {
        level.entities.delete(entity);
        continue;
      }
      if (!entity.onCollect) continue;
      if (checkCollision(mario, entity)) {
        entity.onCollect(mario);
        level.entities.delete(entity);
      }
    }

    // ── Collisioni Mario ↔ Goomba ────────────────────────────────
    checkGoombaCollisions(marioVelYBeforeCheck);

    // ── Camera ───────────────────────────────────────────────────
    camera.update(INTERNAL_WIDTH, INTERNAL_HEIGHT);
    cameraLeftBound = Math.max(cameraLeftBound, camera.position.x);

    applyBounds();
    render();
  };

  timer.start();
}

main();
