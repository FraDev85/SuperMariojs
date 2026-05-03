// goomba.js
import { loadImage } from "./loader.js";
import SpriteSheet from "./spriteSheet.js";
import Animator from "./animator.js";

// ── Load sprite ─────────────────────────────────────────────
async function loadGoombaSprites() {
  const image = await loadImage("/img/sprites.png");
  const sprites = new SpriteSheet(image, 16, 16);

  sprites.define("walk1", 80,  0, 16, 16);
  sprites.define("walk2", 96,  0, 16, 16);
  sprites.define("dead",  112, 0, 16, 16); 

  return sprites;
}

// ── Create Goomba ───────────────────────────────────────────────
export async function createGoomba() {
  const sprites = await loadGoombaSprites();
  const walkAnim = new Animator(["walk1", "walk2"], 0.25);

  const goomba = {
    position: { x: 0, y: 0 },
    velocity: { x: -60, y: 0 }, // 
    size:     { x: 16, y: 16 },

    alive:      true,
    isGoomba:   true,   
    dead:       false,  
    deadTimer:  0,     

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

    
      this.velocity.y += 1000 * deltaTime;
    },

   
    draw(ctx) {
      const frame = this.dead ? "dead" : walkAnim.frame(0);
      sprites.draw(frame, ctx, this.position.x, this.position.y);
    },

    
    stomp() {
      if (this.dead) return;
      this.dead      = true;
      this.deadTimer = 0.5; // resta visibile 0.5s poi sparisce
      this.velocity.x = 0;
      this.velocity.y = 0;
    },

    // ── Reverse Direction──────────────────────────
    reverse() {
      this.velocity.x *= -1;
    },

    // ── State──────────────────────────────────────────────────────
    isAlive() {
      return this.alive;
    },
  };

  return goomba;
}
