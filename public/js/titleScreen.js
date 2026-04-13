// titleScreen.js
import { loadImage } from "./loader.js";
import HUD from "./hud.js";

export default class TitleScreen {
  constructor(canvas, ctx, scale) {
    this.canvas = canvas;
    this.ctx    = ctx;
    this.scale  = scale;

    this.tilesImage = null;
    this.hud        = null;

    this.blinkTimer   = 0;
    this.blinkVisible = true;

    this.active   = true;  // true = schermata titolo attiva
    this.onStart  = null;  // callback quando si preme START
  }

  async load() {
    this.tilesImage = await loadImage("/img/tiles.png");
    this.hud = new HUD();
    await this.hud.load();

    // Ascolta pressione di qualsiasi tasto per avviare
    this._keyHandler = (e) => {
      if (!this.active) return;
      this.active = false;
      if (this.onStart) this.onStart();
    };
    window.addEventListener("keydown", this._keyHandler);
  }

  destroy() {
    window.removeEventListener("keydown", this._keyHandler);
  }

  update(deltaTime) {
    if (!this.active) return;
    this.blinkTimer += deltaTime;
    if (this.blinkTimer > 0.5) {
      this.blinkTimer   = 0;
      this.blinkVisible = !this.blinkVisible;
    }
  }

  draw() {
    const { ctx, canvas, scale } = this;
    const IW = 256; // internal width
    const IH = 240; // internal height

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(scale, scale);

    // ── Sfondo nero ────────────────────────────────────────────────
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, IW, IH);

    // ── Logo "SUPER MARIO BROS." dal tiles.png ─────────────────────
    // Il logo è a x=0, y=128, w=152, h=88 nel tiles.png
    // Lo disegniamo centrato orizzontalmente, nella zona alta
    const logoSrcX = 0;
    const logoSrcY = 128;
    const logoSrcW = 152;
    const logoSrcH = 88;
    const logoScale = 1.3;
    const logoW = Math.floor(logoSrcW * logoScale);
    const logoH = Math.floor(logoSrcH * logoScale);
    const logoX = Math.floor((IW - logoW) / 2);
    const logoY = 28;

    ctx.drawImage(
      this.tilesImage,
      logoSrcX, logoSrcY, logoSrcW, logoSrcH,
      logoX, logoY, logoW, logoH,
    );

    // ── Linea decorativa ───────────────────────────────────────────
    ctx.fillStyle = "#E86010"; // arancione Mario
    ctx.fillRect(16, logoY + logoH + 6, IW - 32, 2);

    // ── COPYRIGHT ─────────────────────────────────────────────────
    // "©1985 NINTENDO"  usando il font HUD
    this.hud._drawText(ctx, "©1985 NINTENDO", 60, logoY + logoH + 14);

    // ── "PRESS ANY KEY" lampeggiante ───────────────────────────────
    if (this.blinkVisible) {
      this.hud._drawText(ctx, "PRESS ANY KEY", 52, 180);
    }

    // ── Mario sprite decorativo ────────────────────────────────────
    // Mario small idle: x=0, y=88, 16x16 in sprites.png — lo carichiamo
    // separatamente se disponibile, altrimenti saltiamo

    ctx.restore();
  }
}
