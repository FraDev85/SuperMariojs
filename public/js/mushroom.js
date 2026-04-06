// mushroom.js
import { loadImage } from "./loader.js";
import SpriteSheet from "./spriteSheet.js";

async function loadMushroomSprites() {
  const image = await loadImage("/img/sprites.png");
  const sprites = new SpriteSheet(image, 16, 16);

  // fungo rosso a x=0, y=160
  sprites.define("mushroom", 0, 152, 16, 16);

  return sprites;
}

export async function createMushroom() {
  const sprites = await loadMushroomSprites();

  const mushroom = {
    position: { x: 0, y: 0 },
    velocity: { x: 60, y: 0 }, // si muove a destra
    size: { x: 16, y: 16 },
    static: false,
    alive: true,

    setPosition(x, y) {
      this.position.x = x;
      this.position.y = y;
    },

    // ── Update ─────────────────────────────────────────────────────
    update(deltaTime) {
      // niente — gravità e movimento gestiti dal tileCollider in main.js
    },

    // ── Draw ───────────────────────────────────────────────────────
    draw(ctx) {
      sprites.draw("mushroom", ctx, this.position.x, this.position.y);
    },

    // ── Raccolta da Mario ──────────────────────────────────────────
    onCollect(mario) {
      this.alive = false;
      mario.powerUp(); // trasforma Mario in big
    },

    isAlive() {
      return this.alive;
    },
  };

  return mushroom;
}
