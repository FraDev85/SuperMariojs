// questionBlock.js
import { loadImage } from "./loader.js";
import SpriteSheet from "./spriteSheet.js";
import Animator from "./animator.js";
import Coin from "./coin.js";

async function loadQuestionBlockSprites() {
  const image = await loadImage("/img/tiles.png");
  const sprites = new SpriteSheet(image, 16, 16);

  sprites.define("q1", 64, 0, 16, 16);
  sprites.define("q2", 80, 0, 16, 16);
  sprites.define("q3", 96, 0, 16, 16);
  sprites.define("hit", 112, 0, 16, 16);

  return sprites;
}

export async function createQuestionBlock(level) {
  const sprites = await loadQuestionBlockSprites();

  const block = {
    position: { x: 0, y: 0 },
    size: { x: 16, y: 16 },
    solid: true,
    static: true,
    hit: false,
    type: "coin", // 🔥 pronto per mushroom

    setPosition(x, y) {
      this.position.x = x;
      this.position.y = y;
    },
  };

  // ─────────────────────────────
  // 🎯 BUMP PHYSICS
  // ─────────────────────────────
  let bumpOffset = 0;
  let bumpVelocity = 0;
  let isBumping = false;

  const GRAVITY = 600;

  block.triggerBump = function () {
    if (block.hit) return;

    // attiva animazione bump
    isBumping = true;
    bumpVelocity = -150;

    // spawn contenuto
    if (block.type === "coin") {
      const coin = new Coin(block.position.x, block.position.y - 16);
      coin.onCollect();

      if (level && level.toSpawn) {
        level.toSpawn.push(coin);
      }
    }

    // 👉 qui in futuro:
    // if (block.type === "mushroom") spawn fungo

    block.hit = true;
  };

  // ─────────────────────────────
  // 🎞️ ANIMAZIONE
  // ─────────────────────────────
  const anim = new Animator(["q1", "q2", "q3"], 0.2);

  block.update = function (deltaTime) {
    // animazione solo se non colpito
    if (!block.hit) {
      anim.frame(deltaTime);
    }

    // bump
    if (!isBumping) return;

    bumpVelocity += GRAVITY * deltaTime;
    bumpOffset += bumpVelocity * deltaTime;

    if (bumpOffset >= 0) {
      bumpOffset = 0;
      bumpVelocity = 0;
      isBumping = false;
    }
  };

  // ─────────────────────────────
  // 🖼️ DRAW
  // ─────────────────────────────
  block.draw = function (ctx) {
    let frame;

    if (block.hit) {
      frame = "hit";
    } else {
      frame = anim.frame(0); // usa stato corrente
    }

    sprites.draw(frame, ctx, block.position.x, block.position.y + bumpOffset);
  };

  return block;
}
