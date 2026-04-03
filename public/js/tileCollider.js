export default class TileCollider {
  constructor(matrix, tileSize = 16) {
    this.tiles = matrix;
    this.tileSize = tileSize;
  }

  toIndex(pos) {
    return Math.floor(pos / this.tileSize);
  }

  getTileByIndex(x, y) {
    return this.tiles.get(x, y) || null;
  }

  _isSolid(tile) {
    return tile && tile.name !== "sky";
  }

  // ─────────────────────────────────────────
  // COLLISIONE ORIZZONTALE
  // ─────────────────────────────────────────
  checkX(entity) {
    const { x, y } = entity.position;
    const { x: w, y: h } = entity.size;

    if (entity.velocity.x > 0) {
      // → destra
      this._checkColumn(entity, x + w, y, h, "right");
    } else if (entity.velocity.x < 0) {
      // ← sinistra
      this._checkColumn(entity, x, y, h, "left");
    }
  }

  _checkColumn(entity, px, py, height, side) {
    const tileX = this.toIndex(px);
    const yStart = this.toIndex(py);
    const yEnd = this.toIndex(py + height - 1);

    for (let tileY = yStart; tileY <= yEnd; tileY++) {
      const tile = this.getTileByIndex(tileX, tileY);
      if (!this._isSolid(tile)) continue;

      this._resolveX(entity, tileX, side);
      return;
    }
  }

  _resolveX(entity, tileX, side) {
    if (side === "left") {
      entity.position.x = (tileX + 1) * this.tileSize;
    } else {
      entity.position.x = tileX * this.tileSize - entity.size.x;
    }

    entity.velocity.x = 0;
  }

  // ─────────────────────────────────────────
  // COLLISIONE VERTICALE
  // ─────────────────────────────────────────
  checkY(entity) {
    const { x, y } = entity.position;
    const { x: w, y: h } = entity.size;

    if (entity.velocity.y > 0) {
      // ↓ sta cadendo
      this._checkRow(entity, x, y + h, w, "bottom");
    } else if (entity.velocity.y < 0) {
      // ↑ sta salendo
      this._checkRow(entity, x, y, w, "top");
    }
  }

  _checkRow(entity, px, py, width, side) {
    const tileY = this.toIndex(py);
    const xStart = this.toIndex(px);
    const xEnd = this.toIndex(px + width - 1);

    for (let tileX = xStart; tileX <= xEnd; tileX++) {
      const tile = this.getTileByIndex(tileX, tileY);
      if (!this._isSolid(tile)) continue;

      // 🎯 HIT DA SOTTO (question block)
      if (
        side === "top" &&
        entity.velocity.y < 0 &&
        tile.block &&
        !tile.block.hit
      ) {
        tile.block.hit = true;
        tile.block.triggerBump();

        // piccolo rimbalzo (feeling Mario)
        entity.velocity.y = 20;
      }

      this._resolveY(entity, tileY, side);
      return tile;
    }

    return null;
  }

  _resolveY(entity, tileY, side) {
    if (side === "top") {
      // colpo da sotto
      entity.position.y = (tileY + 1) * this.tileSize;
    } else {
      // atterraggio sopra
      entity.position.y = tileY * this.tileSize - entity.size.y;

      // opzionale: stato a terra
      entity.onGround = true;
    }

    entity.velocity.y = 0;
  }
}
