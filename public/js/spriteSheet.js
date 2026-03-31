export default class SpriteSheet {
  constructor(image, width, height) {
    if (!image) throw new Error("SpriteSheet: immagine non definita!");
    this.image = image;          // HTMLImageElement già caricato
    this.width = width;          // larghezza di una singola tile
    this.height = height;        // altezza di una singola tile
    this.tiles = new Map();      // mappa delle tile definite
  }

  // Definisce una tile con dimensioni personalizzate
  define(name, x, y, width, height) {
    const buffer = document.createElement("canvas");
    buffer.width = width;
    buffer.height = height;

    const ctx = buffer.getContext("2d");
    ctx.drawImage(
      this.image,  // immagine sorgente
      x, y, width, height,  // ritaglio dall'immagine
      0, 0, width, height   // destinazione nel canvas
    );

    this.tiles.set(name, buffer);
  }

  // Definisce una tile basata sulla griglia (width x height)
  defineTile(name, x, y) {
    this.define(name, x * this.width, y * this.height, this.width, this.height);
  }

  // Disegna una tile già definita
  draw(name, ctx, x, y) {
    const buffer = this.tiles.get(name);
    if (!buffer) {
      console.error(`Tile "${name}" non definita!`);
      return;
    }
    ctx.drawImage(buffer, x, y);
  }

  // Disegna una tile usando la griglia
  drawTile(name, ctx, gridX, gridY) {
    this.draw(name, ctx, gridX * this.width, gridY * this.height);
  }
}