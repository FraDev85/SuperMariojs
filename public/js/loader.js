import Level from "./level.js";
import TileCollider from "./tileCollider.js";

/**
 * Carica un'immagine
 */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = url;
  });
}

/**
 * Carica spritesheet e mappa tile
 * tileSize: dimensione di ogni tile (16px)
 * tileMap: { nome: [col, row] }
 */
export async function loadBackgroundSprites(tileSize = 16) {
  const image = await loadImage("/img/tiles.png"); // path corretto

  // mappa dei tile: nome -> [colonna, riga]
  const tileMap = {
    sky: [10, 7],
    ground: [0, 0],
    platform: [2, 0],
  };

  const sprites = {};

  for (const [name, [col, row]] of Object.entries(tileMap)) {
    sprites[name] = {
      image,
      sx: col * tileSize,
      sy: row * tileSize,
      sw: tileSize,
      sh: tileSize,
    };
  }

  return {
    drawTile(name, ctx, x, y) {
      const tile = sprites[name];
      if (!tile) return;
      ctx.drawImage(
        tile.image,
        tile.sx,
        tile.sy,
        tile.sw,
        tile.sh,
        x,
        y,
        tile.sw,
        tile.sh,
      );
    },
  };
}

/**
 * Popola le tiles nel livello
 */
function createTiles(level, backgrounds) {
  backgrounds.forEach((bg) => {
    bg.ranges.forEach(([x1, x2, y1, y2]) => {
      for (let x = x1; x < x2; x++) {
        for (let y = y1; y < y2; y++) {
          level.tiles.set(x, y, { name: bg.tile });
        }
      }
    });
  });
}

export async function loadLevel(name) {
  const res = await fetch(`/levels/${name}.json`);
  const levelSpec = await res.json();

  const level = new Level();

  level.backgroundSprites = await loadBackgroundSprites();

  createTiles(level, levelSpec.backgrounds);

  level.tileCollider = new TileCollider(level.tiles);

  return level;
}
