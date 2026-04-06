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

  // ── Logica animazioni base ───────────────────────────────────────
  function getBaseSprite(prefix, deltaTime) {
    const walkAnim = prefix === "big" ? walkAnimBig : walkAnimSmall;

    // salto
    if (!mario.jump.onGround || mario.jump.isJumping) {
      walkAnimSmall.reset();
      walkAnimBig.reset();
      return `${prefix}/jump`;
    }

    // skid
    const isSkidding =
      (mario.velocity.x > 0 && mario.facing === -1) ||
      (mario.velocity.x < 0 && mario.facing === 1);

    if (isSkidding) {
      walkAnimSmall.reset();
      walkAnimBig.reset();
      return `${prefix}/skid`;
    }

    // camminata
    if (mario.velocity.x !== 0) {
      return walkAnim.frame(deltaTime);
    }

    // idle
    walkAnim.reset();
    return `${prefix}/idle`;
  }

  // ── Resolve sprite ───────────────────────────────────────────────
  function resolveSprite(deltaTime) {
    // ⚡ lampeggio durante power-up (mantiene animazioni!)
    if (mario.isPoweringUp) {
      const flash = Math.floor(mario.powerUpTime * 10) % 2;
      const prefix = flash === 0 ? "small" : "big";
      return getBaseSprite(prefix, deltaTime);
    }

    // normale
    const prefix = mario.isBig ? "big" : "small";
    return getBaseSprite(prefix, deltaTime);
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
    mario.lastDeltaTime = deltaTime;

    // blocco movimento durante power-up
    if (!mario.isPoweringUp) {
      originalUpdate(deltaTime);
    } else {
      mario.velocity.x = 0;
      mario.velocity.y = 0;
    }

    // gestione power-up
    if (mario.isPoweringUp) {
      mario.powerUpTime += deltaTime;

      if (mario.powerUpTime > 1) {
        mario.isPoweringUp = false;
        mario.isBig = true;
        mario.size.y = 32;
        mario.position.y -= 16;
      }
    }
  };

  return mario;
}
