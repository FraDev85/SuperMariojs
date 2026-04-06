// entity.js
import { loadMarioSprite } from "./sprite.js";
import Animator from "./animator.js";
import Velocity from "./traits/velocity.js";
import VelocityMovement from "./traits/velocityMovement.js";
import Gravity from "./traits/gravity.js";
import Jump from "./traits/jump.js";

export default class Entity {
  constructor() {
    this.position = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.size     = { x: 16, y: 16 };
    this.traits   = [];
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
  const mario   = new Entity();

  // ── Stato power-up ───────────────────────────────────────────────
  mario.isBig = false;

  mario.powerUp = function () {
    if (mario.isBig) return;
    mario.isBig      = true;
    mario.size.y     = 32;
    mario.position.y -= 16;
  };

  // ── Animatori ────────────────────────────────────────────────────
  const walkAnimSmall = new Animator(
    ["small/walk1", "small/walk2", "small/walk3"], 0.1
  );
  const walkAnimBig = new Animator(
    ["big/walk1", "big/walk2", "big/walk3"], 0.1
  );

  function resolveSprite(deltaTime) {
    const prefix   = mario.isBig ? "big" : "small";
    const walkAnim = mario.isBig ? walkAnimBig : walkAnimSmall;

    if (!mario.jump.onGround || mario.jump.isJumping) {
      walkAnimSmall.reset();
      walkAnimBig.reset();
      return `${prefix}/jump`;
    }

    const isSkidding =
      (mario.velocity.x > 0 && mario.facing === -1) ||
      (mario.velocity.x < 0 && mario.facing ===  1);

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
  return mario;
}
