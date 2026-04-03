// questionBlock.js
import { loadImage } from "./loader.js";
import SpriteSheet from "./spriteSheet.js";
import Animator from "./animator.js";

async function loadQuestionBlockSprites() {
  const image = await loadImage("/img/tiles.png");
  const sprites = new SpriteSheet(image, 16, 16);

  sprites.define("q1", 64, 0, 16, 16);
  sprites.define("q2", 80, 0, 16, 16);
  sprites.define("q3", 96, 0, 16, 16);
  sprites.define("hit", 112, 0, 16, 16);

  return sprites;
}

export async function createQuestionBlock() {
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

  // ── Bump ─────────────────────────────────────────────────────────
  let bumpOffset = 0;
  let bumpVelocity = 0;
  let isBumping = false;

  block.triggerBump = function () {
    if (isBumping || block.hit) return;
    isBumping = true;
    bumpVelocity = -120; // negativo = sale
  };

  // ── Animatore ────────────────────────────────────────────────────
  const anim = new Animator(["q1", "q2", "q3"], 0.2);
  let animTime = 0;

  // ── Update ───────────────────────────────────────────────────────
  block.update = function (deltaTime) {
    if (!block.hit) {
      animTime += deltaTime;
    }

    if (!isBumping) return;

    bumpVelocity += 300 * deltaTime;
    bumpOffset += bumpVelocity * deltaTime;

    // appena torna a 0 il bump è finito
    if (bumpOffset >= 0) {
      bumpOffset = 0;
      bumpVelocity = 0;
      isBumping = false;
    }
  };

  // ── Draw ─────────────────────────────────────────────────────────
  block.draw = function (ctx) {
    const frameIndex = Math.floor(animTime / 0.2) % 3;
    const frameNames = ["q1", "q2", "q3"];
    const frame = block.hit ? "hit" : frameNames[frameIndex];

    sprites.draw(frame, ctx, block.position.x, block.position.y + bumpOffset);
  };

  return block;
}
