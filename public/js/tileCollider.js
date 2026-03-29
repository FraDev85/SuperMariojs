export default class TileCollider {
  constructor(matrix, tileSize = 16) {
    this.tiles = matrix;
    this.tileSize = tileSize;
  }

  toIndex(pos) {
    return Math.floor(pos / this.tileSize);
  }

  getByIndex(x, y) {
    const tile = this.matrix[y] && this.matrix[y][x];
    return tile || 0;
  }

  getTile(x, y) {
    return this.getByIndex(this.toIndex(x), this.toIndex(y));
  }
}
