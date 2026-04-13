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
import HUD from "./hud.js";
import TitleScreen from "./titleScreen.js";

const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

const INTERNAL_WIDTH = 256;
const INTERNAL_HEIGHT = 240;
const scale = Math.min(
  canvas.width / INTERNAL_WIDTH,
  canvas.height / INTERNAL_HEIGHT,
);

ctx.imageSmoothingEnabled = false;
const powerUPDown = new Audio("../sounds/power-up-consume.ogg");
powerUPDown.volume = 0.5;
const LEFT = 37;
const RIGHT = 39;
const JUMP = 32;

// ── Audio morte Mario ──────────────────────────────────────────────
const deathSound = new Audio("../sounds/die.ogg");
deathSound.volume = 0.5;

async function main() {
  // ── 0. Title Screen ────────────────────────────────────────────────
  await showTitleScreen();

  // ── 1. Entità ──────────────────────────────────────────────────────
  const mario = await createMario();
  const level = await loadLevel("1-1", mario);
  await loadCoinSprites();

  // ── HUD ───────────────────────────────────────────────────────────
  const hud = new HUD();
  await hud.load();
  hud.lives = 3;

  // Callback monete da CoinStable/raccolta manuale
  mario._onCoinCollect = () => hud.addCoin();
  // Callback monete da question block → contate subito all'uscita
  level.onCoinCollected = () => hud.addCoin();

  mario.setPosition(45, 174);
  level.entities.add(mario);

  const { width: levelWidth } = level.getSize(16);

  // ── Monete statiche ────────────────────────────────────────────────
  const stableCoins = [
    new CoinStable(80, 160),
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
  let marioAlive = true;
  let marioDeadTimer = 0;
  let invincibleTimer = 0; // invincibilità temporanea dopo rimpicciolimento
  const INVINCIBLE_DURATION = 2; // secondi di invincibilità dopo danno

  // ── 3. Camera ──────────────────────────────────────────────────────
  const camera = new Camera(mario, levelWidth, 240);
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

  // ── 5. Input ───────────────────────────────────────────────────────
  const keyboard = new KeyboardState();
  keyboard.addMapping(LEFT, () => {});
  keyboard.addMapping(RIGHT, () => {});
  keyboard.addMapping(JUMP, (keyState) => {
    if (!marioAlive) return;
    if (mario.isPoweringUp) return;
    if (keyState) mario.jump.start(mario);
    else mario.jump.cancel(mario);
  });
  keyboard.listenTo(window);

  function handleInput() {
    if (!marioAlive || mario.isPoweringUp) {
      mario.velocity.x = 0;
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
    if (invincibleTimer > 0) return; // protetto dopo un danno
    marioAlive = false;
    marioDeadTimer = 3; // secondi animazione prima del Game Over

    mario.velocity.x = 0;
    mario.velocity.y = -400;
    mario.jump.onGround = false;
    mario._dead = true;
  }

  // ── 8. Collisione Mario ↔ Goomba ──────────────────────────────────
  function checkGoombaCollisions(marioVelY = mario.velocity.y) {
    if (!marioAlive) return;
    if (invincibleTimer > 0) return; // invincibile → ignora danni

    for (const entity of level.entities) {
      if (!entity.isGoomba || entity.dead) continue;
      if (!checkCollision(mario, entity)) continue;

      // ── Stomp: Mario colpisce il Goomba dall'alto ──────────────
      // La gravità accumula velocity.y anche a terra, quindi non basta
      // la velocity come discriminante. Usiamo l'overlap verticale:
      // - overlap piccolo (<=6px) + Mario stava cadendo = entrato dall'alto
      // - overlap grande = Mario era gia di fianco al Goomba
      const marioBottom = mario.position.y + mario.size.y;
      const goombaTop = entity.position.y;
      const verticalOverlap = marioBottom - goombaTop;
      const isStomp =
        marioVelY > 0 && verticalOverlap >= 0 && verticalOverlap <= 6;

      if (isStomp) {
        entity.stomp();
        hud.addScore(100); // 100 punti per Goomba calpestato
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
  function shrinkMario() {
    if (invincibleTimer > 0) return; // già in stato di grazia → ignora

    mario.isBig = false;
    mario.isPoweringUp = false;
    const oldBottom = mario.position.y + mario.size.y;
    mario.size.y = 16;
    mario.position.y = oldBottom - mario.size.y;
    powerUPDown.currentTime = 0;

    powerUPDown.play().catch(() => {});

    // Invincibilità temporanea per evitare danni doppi
    invincibleTimer = INVINCIBLE_DURATION;
  }

  // ── 10. Render ─────────────────────────────────────────────────────
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#5C94FC";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(scale, scale);
    level.comp.layers.forEach((layer) => layer(ctx));
    // ── HUD sopra tutto ──────────────────────────────────────────
    hud.draw(ctx);
    ctx.restore();

    // ── Lampeggio Mario durante invincibilità ────────────────────
    // Passa il timer all'entità Mario così il layer sprite può lampeggiarlo
    mario._invincibleTimer = invincibleTimer;

    // ── Game Over overlay ────────────────────────────────────────
    if (!marioAlive && marioDeadTimer <= 0) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.font = "bold 32px monospace";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
      ctx.font = "16px monospace";
      ctx.fillText(
        "Premi F5 per ricominciare",
        canvas.width / 2,
        canvas.height / 2 + 40,
      );
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

      // Animazione morte: Mario vola in aria senza tile
      mario.velocity.y += 1200 * deltaTime;
      mario.position.y += mario.velocity.y * deltaTime;

      camera.update(INTERNAL_WIDTH, INTERNAL_HEIGHT);
      render();

      // Animazione finita → Game Over fermo (1 sola vita)
      return;
    }

    // ── Countdown invincibilità post-respawn ─────────────────────
    if (invincibleTimer > 0) {
      invincibleTimer -= deltaTime;
      if (invincibleTimer < 0) invincibleTimer = 0;
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
          entity.jump.onGround = true;
          entity.jump.isJumping = false;
        }
      }
    }

    // ── Raccolta monete / funghi + pulizia entità morte ──────────
    for (const entity of [...level.entities]) {
      // ① Prima controlla collisione con Mario (anche se la moneta sta scadendo)
      if (entity.onCollect && checkCollision(mario, entity)) {
        entity.onCollect(mario);
        level.entities.delete(entity);
        continue;
      }
      // ② Poi elimina entità morte/scadute
      if (entity.isAlive && !entity.isAlive()) {
        level.entities.delete(entity);
      }
    }

    // ── Collisioni Mario ↔ Goomba ────────────────────────────────
    checkGoombaCollisions(marioVelYBeforeCheck);

    // ── Camera ───────────────────────────────────────────────────
    camera.update(INTERNAL_WIDTH, INTERNAL_HEIGHT);
    cameraLeftBound = Math.max(cameraLeftBound, camera.position.x);

    applyBounds();
    hud.update(deltaTime);
    render();
  };

  timer.start();
}

function showTitleScreen() {
  return new Promise((resolve) => {
    const title = new TitleScreen(canvas, ctx, scale);
    title.load().then(() => {
      title.onStart = () => {
        title.destroy();
        resolve();
      };

      // Loop della title screen
      let lastTime = 0;
      function titleLoop(time) {
        if (!title.active) return; // uscita → avvia gioco
        const delta = lastTime ? (time - lastTime) / 1000 : 0;
        lastTime = time;
        title.update(delta);
        title.draw();
        requestAnimationFrame(titleLoop);
      }
      requestAnimationFrame(titleLoop);
    });
  });
}

main();
