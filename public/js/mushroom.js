// mushroom.js
import { loadImage } from "./loader.js";
import SpriteSheet from "./spriteSheet.js";

// ── Caricamento sprite ─────────────────────────────────────────────
async function loadMushroomSprites() {
  const image = await loadImage("/img/sprites.png");
  const sprites = new SpriteSheet(image, 16, 16);

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
    isMushroom: true, // 🍄 flag per il game loop — attiva collisioni + reverse

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
      // 🍄 uscita dal blocco — solo animazione verticale, niente fisica esterna
      if (this.emerging) {
        const speed = 30;

        this.emergeProgress += speed * deltaTime;
        this.position.y -= speed * deltaTime;

        if (this.emergeProgress >= 16) {
          this.emerging = false;
          this.velocity.x = 60; // parte verso destra al termine dell'emersione
        }

        return;
      }

      // ⬇️ gravità — applicata qui; checkY nel game loop risolve la posizione
      this.velocity.y += 1000 * deltaTime;

      // ➡️ movimento orizzontale — checkX nel game loop chiama reverse() se colpisce un muro
      // Non aggiorniamo position qui: ci pensa il tileCollider tramite checkX/checkY
      // (il movimento effettivo della posizione avviene nelle chiamate check* in main.js)
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

    // ── Collisione muro → inverte direzione ────────────────────────
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
