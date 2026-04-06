// mushroom.js
import { loadImage } from "./loader.js";
import SpriteSheet from "./spriteSheet.js";

// ── Caricamento sprite ─────────────────────────────────────────────
async function loadMushroomSprites() {
  const image = await loadImage("/img/sprites.png");
  const sprites = new SpriteSheet(image, 16, 16);

  // posizione sprite fungo (modifica se serve)
  sprites.define("mushroom", 0, 152, 16, 16);

  return sprites;
}

// ── Creazione fungo ────────────────────────────────────────────────
export async function createMushroom() {
  const sprites = await loadMushroomSprites();

  const mushroom = {
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    size: { x: 16, y: 16 },

    alive: true,

    // animazione uscita dal blocco
    emerging: true,
    emergeProgress: 0,

    // ── Posizione ──────────────────────────────────────────────────
    setPosition(x, y) {
      this.position.x = x;
      this.position.y = y;
    },

    // ── Update ─────────────────────────────────────────────────────
    update(deltaTime) {
      // 🍄 uscita dal blocco
      if (this.emerging) {
        const speed = 30;

        this.emergeProgress += speed * deltaTime;
        this.position.y -= speed * deltaTime;

        if (this.emergeProgress >= 16) {
          this.emerging = false;
          this.velocity.x = 60; // parte verso destra
        }

        return;
      }

      // ➡️ movimento orizzontale
      this.position.x += this.velocity.x * deltaTime;

      // ⬇️ gravità
      this.velocity.y += 1000 * deltaTime;
      this.position.y += this.velocity.y * deltaTime;
    },

    // ── Draw ───────────────────────────────────────────────────────
    draw(ctx) {
      sprites.draw("mushroom", ctx, this.position.x, this.position.y);
    },

    // ── Raccolta ───────────────────────────────────────────────────
    onCollect(mario) {
      if (!this.alive) return;

      this.alive = false;
      mario.powerUp();
    },

    // ── Collisione muro ────────────────────────────────────────────
    reverse() {
      this.velocity.x *= -1;
    },

    // ── Stato ──────────────────────────────────────────────────────
    isAlive() {
      return this.alive;
    },
  };

  return mushroom;
}
