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
    velocity: { x: -40, y: 0 }, // più lento del Goomba
    size: { x: 16, y: 32 }, // alto 32px quando cammina

    alive: true,
    isKoopa: true, // flag per main.js (fisica + collisioni)

    // ── State machine: "walking" | "shell" | "sliding" ─────────────
    state: "walking",
    shellTimer: 0, // Koopa riemerge dopo 5s se il guscio è fermo

    setPosition(x, y) {
      this.position.x = x;
      this.position.y = y;
    },

    update(deltaTime) {
      if (!this.alive) return;

      if (this.state === "walking") {
        walkAnim.frame(deltaTime);
        this.velocity.y += 1000 * deltaTime; // gravità
      } else if (this.state === "shell") {
        // guscio fermo: conto alla rovescia prima di riemerge
        this.shellTimer -= deltaTime;
        if (this.shellTimer <= 0) {
          this._emerge();
        }
      } else if (this.state === "sliding") {
        this.velocity.y += 1000 * deltaTime; // gravità anche da guscio
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

    // ── Calpestato da Mario ────────────────────────────────────────
    stomp() {
      if (this.state === "walking") {
        // prima calpestata → diventa guscio fermo
        this._enterShell();
      } else if (this.state === "shell") {
        // seconda calpestata su guscio fermo → lancia il guscio
        this._kick();
      }
      // se "sliding" non fa nulla (già in movimento, Mario rimbalza)
    },

    // ── Guscio colpisce Mario lateralmente ─────────────────────────
    hitsPlayer() {
      return this.state === "sliding";
    },

    // ── Inverte direzione (muro) ───────────────────────────────────
    reverse() {
      this.velocity.x *= -1;
      this.facing = this.velocity.x < 0 ? -1 : 1;
    },

    isAlive() {
      return this.alive;
    },

    // ── Privati ────────────────────────────────────────────────────
    _enterShell() {
      this.state = "shell";
      this.velocity.x = 0;
      this.shellTimer = 5; // 5 secondi prima di riemerge
      this.size.y = 16; // hitbox ridotta a 16px nel guscio
      // riallinea la base del Koopa (era alto 32, ora 16)
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
      // ripristina hitbox alta, riallineando in basso
      this.position.y -= 16;
      this.size.y = 32;
    },

    facing: -1,
  };

  return koopa;
}
