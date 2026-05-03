// koopa.js
import { loadImage } from "./loader.js";
import SpriteSheet from "./spriteSheet.js";
import Animator from "./animator.js";

async function loadKoopaSprites() {
  const image = await loadImage("/img/sprites.png");
  const sprites = new SpriteSheet(image, 16, 16);

  sprites.define("walk1", 208, 0, 16, 24);
  sprites.define("walk2", 240, 0, 16, 24);
  sprites.define("shell", 208, 192, 16, 16);

  return sprites;
}

export async function createKoopa() {
  const sprites = await loadKoopaSprites();
  const walkAnim = new Animator(["walk1", "walk2"], 0.3);

  const koopa = {
    position: { x: 0, y: 0 },
    velocity: { x: -40, y: 0 }, 
    size: { x: 16, y: 32 },

    alive: true,
    isKoopa: true,

    // ── State machine: "walking" | "shell" | "sliding" ─────────────
    state: "walking",
    shellTimer: 0, 

    setPosition(x, y) {
      this.position.x = x;
      this.position.y = y;
    },

    update(deltaTime) {
      if (!this.alive) return;

      if (this.state === "walking") {
        walkAnim.frame(deltaTime);
        this.velocity.y += 1000 * deltaTime; 
      } else if (this.state === "shell") {
        this.shellTimer -= deltaTime;
        if (this.shellTimer <= 0) {
          this._emerge();
        }
      } else if (this.state === "sliding") {
        this.velocity.y += 1000 * deltaTime; 
      }
    },

    draw(ctx) {
      if (!this.alive) return;
      const isShell = this.state !== "walking";
      const frame = isShell ? "shell" : walkAnim.frame(0);

      ctx.save();
      if (this.facing === -1 && !isShell) {
        ctx.scale(-1, 1);
        ctx.translate(-this.position.x * 2 - this.size.x, 0);
      }
      sprites.draw(frame, ctx, this.position.x, this.position.y);
      ctx.restore();
    },

    // ── stomp from Mario ────────────────────────────────────────
    stomp() {
      if (this.state === "walking") {
      
        this._enterShell();
      } else if (this.state === "shell") {
      
        this._kick();
      }
     
    },

    // ── shell hit Mario  ─────────────────────────
    hitsPlayer() {
      return this.state === "sliding";
    },

    // ── Reverse ───────────────────────────────────
    reverse() {
      this.velocity.x *= -1;
      this.facing = this.velocity.x < 0 ? -1 : 1;
    },

    isAlive() {
      return this.alive;
    },

   
    _enterShell() {
      this.state = "shell";
      this.velocity.x = 0;
      this.shellTimer = 5; 
      this.size.y = 16; 
      this.position.y += 16;
    },

    _kick() {
      this.state = "sliding";
      this.velocity.x = this.facing === 1 ? 200 : -200;
    },

    _emerge() {
      this.state = "walking";
      this.velocity.x = -40;
      this.facing = -1;
      this.position.y -= 16;
      this.size.y = 32;
    },

    facing: -1,
  };

  return koopa;
}
