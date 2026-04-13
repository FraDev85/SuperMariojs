// goomba.js
import { loadImage } from "./loader.js";
import SpriteSheet from "./spriteSheet.js";
import Animator from "./animator.js";

// ── Caricamento sprite ─────────────────────────────────────────────
async function loadGoombaSprites() {
  const image = await loadImage("/img/sprites.png");
  const sprites = new SpriteSheet(image, 16, 16);

  sprites.define("walk1", 80,  0, 16, 16);
  sprites.define("walk2", 96,  0, 16, 16);
  sprites.define("dead",  112, 0, 16, 16); // schiacciato

  return sprites;
}

// ── Creazione Goomba ───────────────────────────────────────────────
export async function createGoomba() {
  const sprites = await loadGoombaSprites();
  const walkAnim = new Animator(["walk1", "walk2"], 0.25);

  const goomba = {
    position: { x: 0, y: 0 },
    velocity: { x: -60, y: 0 }, // cammina verso sinistra
    size:     { x: 16, y: 16 },

    alive:      true,
    isGoomba:   true,   // flag per il game loop
    dead:       false,  // schiacciato
    deadTimer:  0,      // quanto resta visibile dopo la morte

    // ── Posizione ──────────────────────────────────────────────────
    setPosition(x, y) {
      this.position.x = x;
      this.position.y = y;
    },

    // ── Update ─────────────────────────────────────────────────────
    update(deltaTime) {
      if (this.dead) {
        this.deadTimer -= deltaTime;
        if (this.deadTimer <= 0) {
          this.alive = false;
        }
        return;
      }

      walkAnim.frame(deltaTime);

      // Gravità interna (checkY in main.js applica la fisica)
      this.velocity.y += 1000 * deltaTime;
    },

    // ── Draw ───────────────────────────────────────────────────────
    draw(ctx) {
      const frame = this.dead ? "dead" : walkAnim.frame(0);
      sprites.draw(frame, ctx, this.position.x, this.position.y);
    },

    // ── Calpestato da Mario ────────────────────────────────────────
    stomp() {
      if (this.dead) return;
      this.dead      = true;
      this.deadTimer = 0.5; // resta visibile 0.5s poi sparisce
      this.velocity.x = 0;
      this.velocity.y = 0;
    },

    // ── Inverte direzione (muro o bordo) ──────────────────────────
    reverse() {
      this.velocity.x *= -1;
    },

    // ── Stato ──────────────────────────────────────────────────────
    isAlive() {
      return this.alive;
    },
  };

  return goomba;
}
