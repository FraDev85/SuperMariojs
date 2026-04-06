// questionBlock.js
import { loadImage } from "./loader.js";
import SpriteSheet from "./spriteSheet.js";
import Animator from "./animator.js";
import Coin from "./coin.js";
import { createMushroom } from "./mushroom.js";

async function loadQuestionBlockSprites() {
  const image = await loadImage("/img/tiles.png");
  const sprites = new SpriteSheet(image, 16, 16);

  sprites.define("q1",  64,  0, 16, 16);
  sprites.define("q2",  80,  0, 16, 16);
  sprites.define("q3",  96,  0, 16, 16);
  sprites.define("hit", 112, 0, 16, 16);

  return sprites;
}

export async function createQuestionBlock(level, type = "coin") {
  const sprites = await loadQuestionBlockSprites();

  const block = {
    position: { x: 0, y: 0 },
    size:     { x: 16, y: 16 },
    solid:    true,
    static:   true,
    hit:      false,
    type,     // "coin" o "mushroom"

    setPosition(x, y) {
      this.position.x = x;
      this.position.y = y;
    },
  };

  // ── Bump ─────────────────────────────────────────────────────────
  let bumpOffset   = 0;
  let bumpVelocity = 0;
  let isBumping    = false;
  const GRAVITY    = 600;

  block.triggerBump = async function () {
    if (block.hit) return;

    isBumping    = true;
    bumpVelocity = -150;
    block.hit    = true;

    if (block.type === "coin") {
      // ── Moneta ───────────────────────────────────────────────────
      const coin = new Coin(block.position.x, block.position.y - 16);
      coin.onCollect(); // suono
      if (level && level.toSpawn) level.toSpawn.push(coin);

    } else if (block.type === "mushroom") {
      // ── Fungo — emerge dal blocco e cammina ──────────────────────
      const mushroom = await createMushroom();
      mushroom.setPosition(block.position.x, block.position.y - 16);
      if (level && level.toSpawn) level.toSpawn.push(mushroom);
    }
  };

  // ── Animazione ───────────────────────────────────────────────────
  const anim = new Animator(["q1", "q2", "q3"], 0.2);

  block.update = function (deltaTime) {
    if (!block.hit) anim.frame(deltaTime);

    if (!isBumping) return;

    bumpVelocity += GRAVITY * deltaTime;
    bumpOffset   += bumpVelocity * deltaTime;

    if (bumpOffset >= 0) {
      bumpOffset   = 0;
      bumpVelocity = 0;
      isBumping    = false;
    }
  };

  // ── Draw ─────────────────────────────────────────────────────────
  block.draw = function (ctx) {
    const frame = block.hit ? "hit" : anim.frame(0);
    sprites.draw(frame, ctx, block.position.x, block.position.y + bumpOffset);
  };

  return block;
}
