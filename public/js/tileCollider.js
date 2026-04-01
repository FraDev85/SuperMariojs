// tileCollider.js
export default class TileCollider {
  constructor(matrix, tileSize = 16) {
    this.tiles = matrix; // istanza di Matrix da math.js
    this.tileSize = tileSize;
  }

  // Converte una coordinata pixel → indice tile
  toIndex(pos) {
    return Math.floor(pos / this.tileSize);
  }

  // Restituisce la tile a coordinate tile (x, y) usando l'API di Matrix
  getTileByIndex(tileX, tileY) {
    return this.tiles.get(tileX, tileY) || null;
  }

  // Restituisce la tile a coordinate pixel (x, y)
  getTile(px, py) {
    return this.getTileByIndex(this.toIndex(px), this.toIndex(py));
  }

  // -------------------------------------------------------------------
  // Controllo collisione orizzontale (left / right)
  // -------------------------------------------------------------------
  checkX(entity) {
    const { x, y } = entity.position;
    const { x: w, y: h } = entity.size;

    // Bordo sinistro
    this._checkColumn(x, y, h, entity, "left");
    // Bordo destro
    this._checkColumn(x + w, y, h, entity, "right");
  }

  // -------------------------------------------------------------------
  // Controllo collisione verticale (top / bottom)
  // -------------------------------------------------------------------
  checkY(entity) {
    const { x, y } = entity.position;
    const { x: w, y: h } = entity.size;

    // Bordo superiore
    this._checkRow(x, y, w, entity, "top");
    // Bordo inferiore
    this._checkRow(x, y + h, w, entity, "bottom");
  }

  // -------------------------------------------------------------------
  // Privati: scansiona una colonna o riga di tile
  // -------------------------------------------------------------------

  _checkColumn(px, py, height, entity, side) {
    const tileX = this.toIndex(px);
    const tileYStart = this.toIndex(py);
    const tileYEnd = this.toIndex(py + height - 1);

    for (let tileY = tileYStart; tileY <= tileYEnd; tileY++) {
      const tile = this.getTileByIndex(tileX, tileY);
      if (tile && tile.name !== "sky") {
        this._resolveX(entity, tileX, side);
        break;
      }
    }
  }

  _checkRow(px, py, width, entity, side) {
    const tileY = this.toIndex(py);
    const tileXStart = this.toIndex(px);
    const tileXEnd = this.toIndex(px + width - 1);

    for (let tileX = tileXStart; tileX <= tileXEnd; tileX++) {
      const tile = this.getTileByIndex(tileX, tileY);
      if (tile && tile.name !== "sky") {
        this._resolveY(entity, tileY, side);
        break;
      }
    }
  }

  // -------------------------------------------------------------------
  // Risoluzione: sposta l'entità fuori dalla tile
  // -------------------------------------------------------------------

  _resolveX(entity, tileX, side) {
    if (side === "left") {
      // l'entità stava andando a sinistra: mettila sul bordo destro della tile
      entity.position.x = (tileX + 1) * this.tileSize;
      entity.velocity.x = 0;
    } else {
      // l'entità stava andando a destra: mettila sul bordo sinistro della tile
      entity.position.x = tileX * this.tileSize - entity.size.x;
      entity.velocity.x = 0;
    }
  }

  _resolveY(entity, tileY, side) {
    if (side === "top") {
      entity.position.y = (tileY + 1) * this.tileSize;
      entity.velocity.y = 0;
    } else {
      // atterraggio: appoggia l'entità sulla superficie della tile
      entity.position.y = tileY * this.tileSize - entity.size.y;
      entity.velocity.y = 0;
    }
  }
}
