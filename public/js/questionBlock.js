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
    hit: false,
    static: true,

    setPosition(x, y) {
      this.position.x = x;
      this.position.y = y;
    },
  };

  // ── Bump ──────────────────────────────
  let bumpOffset = 0;
  let bumpVelocity = 0;
  let isBumping = false;

  block.triggerBump = function () {
    if (block.hit) return;

    console.log("Trigger bump");

    // Creazione moneta
    const coin = new Coin(block.position.x, block.position.y - 16);
    if (level && level.toSpawn) {
      level.toSpawn.push(coin);
    } else {
      console.warn("Level o level.toSpawn non definito");
    }

    // Suono alla comparsa
    coin.onCollect();

    block.hit = true;
  };

  // ── Animatore ─────────────────────────
  const anim = new Animator(["q1", "q2", "q3"], 0.2);
  let animTime = 0;

  block.update = function (deltaTime) {
    if (!block.hit) animTime += deltaTime;

    if (!isBumping) return;

    bumpVelocity += 300 * deltaTime;
    bumpOffset += bumpVelocity * deltaTime;

    if (bumpOffset >= 0) {
      bumpOffset = 0;
      bumpVelocity = 0;
      isBumping = false;
    }
  };

  // ── Draw ──────────────────────────────
  block.draw = function (ctx) {
    const frameNames = ["q1", "q2", "q3"];
    const frame = block.hit
      ? "hit"
      : frameNames[Math.floor(animTime / 0.2) % 3];
    sprites.draw(frame, ctx, block.position.x, block.position.y + bumpOffset);
  };

  return block;
}
