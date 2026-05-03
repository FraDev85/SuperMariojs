// level.js
import Compositor from "./compositor.js";
import { Matrix } from "./math.js";

export default class Level {
  constructor() {
    this.comp = new Compositor(); // Manage layer
    this.entities = new Set(); // Entities like Mario or enemy
    this.tiles = new Matrix(); // matrix 
    this.tileCollider = null; 
    this.toSpawn = []; 
  }

  update(deltaTime) {
    // update all entities
    this.entities.forEach((entity) => {
      if (entity.update) entity.update(deltaTime);
    });

    // spawn the entities
    for (const e of this.toSpawn) {
      this.entities.add(e);
    }
    this.toSpawn.length = 0;
  }

  /**
   *
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
