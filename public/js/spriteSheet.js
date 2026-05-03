export default class SpriteSheet {
  constructor(image, width, height) {
    if (!image) throw new Error("SpriteSheet: immagine non definita!");
    this.image = image;
    this.width = width;
    this.height = height;
    this.tiles = new Map();
  }

  define(name, x, y, width, height) {
    const buffer = document.createElement("canvas");
    buffer.width = width;
    buffer.height = height;

    const ctx = buffer.getContext("2d");
    ctx.drawImage(this.image, x, y, width, height, 0, 0, width, height);

    this.tiles.set(name, buffer);
  }

  defineTile(name, x, y) {
    this.define(name, x * this.width, y * this.height, this.width, this.height);
  }

  draw(name, ctx, x, y) {
    const buffer = this.tiles.get(name);
    if (!buffer) {
      console.error(`Tile "${name}" non definita!`);
      return;
    }
    ctx.drawImage(buffer, x, y);
  }

  drawTile(name, ctx, gridX, gridY) {
    this.draw(name, ctx, gridX * this.width, gridY * this.height);
  }
}
