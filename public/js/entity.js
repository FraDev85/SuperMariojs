// entity.js
import { loadMarioSprite } from "./sprite.js";
import Animator from "./animator.js";
import Velocity from "./traits/velocity.js";
import VelocityMovement from "./traits/velocityMovement.js";
import Gravity from "./traits/gravity.js";
import Jump from "./traits/jump.js";

// 🎵 suono power-up
const powerUpSound = new Audio("../sounds/power-up-appears.ogg");

export default class Entity {
  constructor() {
    this.position = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.size = { x: 16, y: 16 };
    this.traits = [];

    // riferimento al tileCollider, assegnato dopo il caricamento del livello
    this._tileCollider = null;
  }

  addTrait(trait) {
    this.traits.push(trait);
    trait.entity = this;
  }

  update(deltaTime) {
    this.traits.forEach((trait) => trait.update(deltaTime, this));
  }

  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
  }
}

export async function createMario() {
  const sprites = await loadMarioSprite();
  const mario = new Entity();

  // ── Stato power-up ───────────────────────────────────────────────
  mario.isBig = false;
  mario.isPoweringUp = false;
  mario.powerUpTime = 0;

  mario.powerUp = function () {
    if (mario.isBig || mario.isPoweringUp) return;

    mario.isPoweringUp = true;
    mario.powerUpTime = 0;

    powerUpSound.currentTime = 0;
    powerUpSound.play();
  };

  // ── Animatori ────────────────────────────────────────────────────
  const walkAnimSmall = new Animator(
    ["small/walk1", "small/walk2", "small/walk3"],
    0.1,
  );

  const walkAnimBig = new Animator(
    ["big/walk1", "big/walk2", "big/walk3"],
    0.1,
  );

  function resolveSprite(deltaTime) {
    // ⚡ lampeggio durante trasformazione
    if (mario.isPoweringUp) {
      const flash = Math.floor(mario.powerUpTime * 10) % 2;
      return flash === 0 ? "small/idle" : "big/idle";
    }

    const prefix = mario.isBig ? "big" : "small";
    const walkAnim = mario.isBig ? walkAnimBig : walkAnimSmall;

    if (!mario.jump.onGround || mario.jump.isJumping) {
      walkAnimSmall.reset();
      walkAnimBig.reset();
      return `${prefix}/jump`;
    }

    const isSkidding =
      (mario.velocity.x > 0 && mario.facing === -1) ||
      (mario.velocity.x < 0 && mario.facing === 1);

    if (isSkidding) {
      walkAnimSmall.reset();
      walkAnimBig.reset();
      return `${prefix}/skid`;
    }

    if (mario.velocity.x !== 0) {
      return walkAnim.frame(deltaTime);
    }

    walkAnim.reset();
    return `${prefix}/idle`;
  }

  mario.lastDeltaTime = 0;

  // ── Draw ─────────────────────────────────────────────────────────
  mario.draw = function (ctx) {
    const spriteName = resolveSprite(mario.lastDeltaTime);

    ctx.save();

    if (mario.facing === -1) {
      ctx.scale(-1, 1);
      ctx.translate(-mario.position.x * 2 - mario.size.x, 0);
    }

    sprites.draw(spriteName, ctx, mario.position.x, mario.position.y);
    ctx.restore();
  };

  // ── Traits ───────────────────────────────────────────────────────
  mario.addTrait(new Velocity());
  mario.addTrait(new VelocityMovement());
  mario.addTrait(new Gravity());

  const jump = new Jump();
  mario.addTrait(jump);
  mario.jump = jump;

  mario.facing = 1;

  // ── Override update ──────────────────────────────────────────────
  const originalUpdate = mario.update.bind(mario);

  mario.update = function (deltaTime) {
    this.lastDeltaTime = deltaTime;

    // update normale
    originalUpdate(deltaTime);

    // ⏱ gestione power-up
    if (this.isPoweringUp) {
      this.powerUpTime += deltaTime;

      if (this.powerUpTime > 1) {
        this.isPoweringUp = false;
        this.isBig = true;
        this.size.y = 32;

        // ── Controlla spazio libero sopra prima di spostare ────────
        // Bisogna verificare ENTRAMBE le colonne di Mario (sinistra e destra)
        // per gestire i casi in cui è a cavallo di due tile.
        const tc = this._tileCollider;
        let spaceAbove = true;

        if (tc) {
          const tileRow = tc.toIndex(this.position.y - 1); // riga immediatamente sopra
          const tileXLeft = tc.toIndex(this.position.x);
          const tileXRight = tc.toIndex(this.position.x + this.size.x - 1);

          for (let tx = tileXLeft; tx <= tileXRight; tx++) {
            const tile = tc.getTileByIndex(tx, tileRow);
            if (tile && tile.name !== "sky") {
              spaceAbove = false;
              break;
            }
          }
        }

        if (spaceAbove) {
          // spazio libero: Mario cresce verso l'alto normalmente
          this.position.y -= 16;
        } else {
          // tile solida sopra: Mario rimane fermo e si espande verso il basso
          // (position.y invariata — la tile del piano è già sotto di lui)
          // La size.y è già 32, quindi il collider inferiore scende di 16px;
          // il prossimo checkY lo risistemerà a terra automaticamente.
        }
      }
    }
  };

  return mario;
}
