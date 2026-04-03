// level.js
import Compositor from "./compositor.js";
import { Matrix } from "./math.js";

export default class Level {
  constructor() {
    this.comp = new Compositor(); // gestisce i layer
    this.entities = new Set(); // entità come Mario, nemici, ecc.
    this.tiles = new Matrix(); // matrice delle tile (popolata dal loader)
    this.tileCollider = null; // collider impostato dal loader
    this.toSpawn = []; // entità da spawnare (es. monete da question block)
  }

  update(deltaTime) {}

  /**
   * Calcola la larghezza e altezza reale del livello in pixel
   * basandosi sulle tile presenti nella matrice
   */
  getSize(tileSize = 16) {
    let maxX = 0;
    let maxY = 0;

    this.tiles.forEach((tile, x, y) => {
      if (x + 1 > maxX) maxX = x + 1;
      if (y + 1 > maxY) maxY = y + 1;
    });

    return {
      width: maxX * tileSize,
      height: maxY * tileSize,
    };
  }
}
