// brickBlock.js
import { loadImage } from "./loader.js";
import SpriteSheet from "./spriteSheet.js";

const brickSound = new Audio("../sounds/brick-destroy.ogg");
brickSound.volume = 0.7;

async function loadBrickSprites() {
  const image = await loadImage("/img/tiles.png");
  const sprites = new SpriteSheet(image, 16, 16);

  sprites.define("brick", 128, 0, 16, 16);

  // 4 frammenti 8x8 ricavati dai quadranti del brick
  sprites.define("frag-tl", 128, 0,  8, 8);
  sprites.define("frag-tr", 136, 0,  8, 8);
  sprites.define("frag-bl", 128, 8,  8, 8);
  sprites.define("frag-br", 136, 8,  8, 8);

  return sprites;
}

// ── Particella frammento ──────────────────────────────────────────
class BrickParticle {
  constructor(x, y, vx, vy, frame) {
    this.x    = x;
    this.y    = y;
    this.vx   = vx;
    this.vy   = vy;
    this.frame = frame;
    this.alive = true;
  }

  update(deltaTime) {
    this.vy += 600 * deltaTime;   // gravità
    this.x  += this.vx * deltaTime;
    this.y  += this.vy * deltaTime;
    if (this.y > 400) this.alive = false; // fuori schermo
  }

  draw(sprites, ctx) {
    sprites.draw(this.frame, ctx, this.x, this.y);
  }
}

// ── Brick block ───────────────────────────────────────────────────
export async function createBrickBlock() {
  const sprites = await loadBrickSprites();

  // bump animation state
  let bumpOffset   = 0;
  let bumpVelocity = 0;
  let isBumping    = false;
  const BUMP_GRAVITY = 600;

  // destroy particles
  let particles  = [];
  let destroyed  = false;

  const block = {
    position: { x: 0, y: 0 },
    size:     { x: 16, y: 16 },
    solid:    true,
    static:   true,
    isBrick:  true,
    hit:      false,

    setPosition(x, y) {
      this.position.x = x;
      this.position.y = y;
    },

    // ── Chiamato dal tileCollider quando Mario colpisce da sotto ───
    triggerBump(level, mario) {
      if (this.hit) return;

      // Mario piccolo → solo bump, niente distruzione
      if (!mario || !mario.isBig) {
        if (isBumping) return;
        isBumping    = true;
        bumpVelocity = -120;
        return;
      }

      // Mario grande → distruggi
      this._destroy(level);
    },

    _destroy(level) {
      this.hit      = true;
      destroyed     = true;

      // Suono
      brickSound.currentTime = 0;
      brickSound.play().catch(() => {});

      // Spawna 4 frammenti che volano via
      const cx = this.position.x;
      const cy = this.position.y;
      particles = [
        new BrickParticle(cx,     cy,     -80, -320, "frag-tl"),
        new BrickParticle(cx + 8, cy,      80, -320, "frag-tr"),
        new BrickParticle(cx,     cy + 8, -60, -200, "frag-bl"),
        new BrickParticle(cx + 8, cy + 8,  60, -200, "frag-br"),
      ];

      // Rimuovi la tile dalla matrice così non è più solida
      if (level) {
        const tileX = Math.floor(this.position.x / 16);
        const tileY = Math.floor(this.position.y / 16);
        level.tiles.set(tileX, tileY, { name: "sky" });
      }
    },

    update(deltaTime) {
      // Aggiorna particelle
      for (const p of particles) p.update(deltaTime);
      particles = particles.filter(p => p.alive);

      if (!isBumping) return;

      bumpVelocity += BUMP_GRAVITY * deltaTime;
      bumpOffset   += bumpVelocity * deltaTime;

      if (bumpOffset >= 0) {
        bumpOffset   = 0;
        bumpVelocity = 0;
        isBumping    = false;
      }
    },

    draw(ctx) {
      // Disegna frammenti anche dopo la distruzione
      for (const p of particles) p.draw(sprites, ctx);
      if (destroyed) return;

      sprites.draw("brick", ctx, this.position.x, this.position.y + bumpOffset);
    },
  };

  return block;
}
