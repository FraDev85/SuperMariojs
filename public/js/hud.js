// hud.js
import { loadImage } from "./loader.js";

// ── Mappa carattere → posizione nel font sprite (8x8 per char) ────
// Riga 0 (y=0):  [vuoto] 0 1 2 3 4 5 6 7 8 9 A B C D E F
// Riga 1 (y=8):  G H I J K L M N O P Q R S T U V W
// Riga 2 (y=16): X Y Z © ! - × .
const CHAR_MAP = {
  "0": { x:   8, y:  0 }, "1": { x:  16, y:  0 },
  "2": { x:  24, y:  0 }, "3": { x:  32, y:  0 },
  "4": { x:  40, y:  0 }, "5": { x:  48, y:  0 },
  "6": { x:  56, y:  0 }, "7": { x:  64, y:  0 },
  "8": { x:  72, y:  0 }, "9": { x:  80, y:  0 },
  "A": { x:  88, y:  0 }, "B": { x:  96, y:  0 },
  "C": { x: 104, y:  0 }, "D": { x: 112, y:  0 },
  "E": { x: 120, y:  0 }, "F": { x: 128, y:  0 },

  "G": { x:   0, y:  8 }, "H": { x:   8, y:  8 },
  "I": { x:  16, y:  8 }, "J": { x:  24, y:  8 },
  "K": { x:  32, y:  8 }, "L": { x:  40, y:  8 },
  "M": { x:  48, y:  8 }, "N": { x:  56, y:  8 },
  "O": { x:  64, y:  8 }, "P": { x:  72, y:  8 },
  "Q": { x:  80, y:  8 }, "R": { x:  88, y:  8 },
  "S": { x:  96, y:  8 }, "T": { x: 104, y:  8 },
  "U": { x: 112, y:  8 }, "V": { x: 120, y:  8 },
  "W": { x: 128, y:  8 },

  "X": { x:   0, y: 16 }, "Y": { x:   8, y: 16 },
  "Z": { x:  16, y: 16 }, "©": { x:  24, y: 16 },
  "!": { x:  32, y: 16 }, "-": { x:  40, y: 16 },
  "x": { x:  48, y: 16 }, ".": { x:  56, y: 16 },
};

// ─────────────────────────────────────────────────────────────────
export default class HUD {
  constructor() {
    this.fontImage = null;
    this.coins  = 0;
    this.score  = 0;
    this.lives  = 3;
    this.time   = 400;
    this._timeAcc = 0;
  }

  async load() {
    this.fontImage = await loadImage("/img/font.png");
  }

  addCoin() {
    this.coins++;
    if (this.coins >= 100) {
      this.coins = 0;
      this.lives++;
    }
    this.addScore(200);
  }

  addScore(points) {
    this.score += points;
    if (this.score > 9999999) this.score = 9999999;
  }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
  }

  update(deltaTime) {
    if (this.time <= 0) return;
    this._timeAcc += deltaTime;
    if (this._timeAcc >= 1) {
      this._timeAcc -= 1;
      this.time = Math.max(0, this.time - 1);
    }
  }

  draw(ctx) {
    if (!this.fontImage) return;

    // MARIO + score
    this._drawText(ctx, "MARIO", 16, 8);
    this._drawText(ctx, String(this.score).padStart(6, "0"), 16, 17);

    // Monete: simbolo © + numero
    this._drawText(ctx, "©", 88, 17);
    this._drawText(ctx, String(this.coins).padStart(2, "0"), 104, 17);

    // World
    this._drawText(ctx, "WORLD", 136, 8);
    this._drawText(ctx, "1-1",   144, 17);

    // Timer
    this._drawText(ctx, "TIME",  200, 8);
    this._drawText(ctx, String(Math.ceil(this.time)).padStart(3, "0"), 204, 17);
  }

  _drawText(ctx, text, x, y) {
    let curX = x;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i].toUpperCase();
      if (ch === " ") { curX += 8; continue; }
      const pos = CHAR_MAP[ch] || CHAR_MAP[text[i]]; // prova anche minuscolo per © e -
      if (!pos) { curX += 8; continue; }

      ctx.drawImage(
        this.fontImage,
        pos.x, pos.y, 8, 8,
        curX, y, 8, 8,
      );
      curX += 8;
    }
  }
}
