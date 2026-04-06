// loader.js
import Level from "./level.js";
import TileCollider from "./tileCollider.js";
import { createQuestionBlock } from "./questionBlock.js";
import Coin from "./coin.js";
import CoinStable from "./coinStable.js";

// ── Carica immagine ───────────────────────────────────────────────
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = url;
  });
}

// ── Carica background sprites ─────────────────────────────────────
export async function loadBackgroundSprites(tileSize = 16) {
  const image = await loadImage("/img/tiles.png");

  const tileMap = {
    sky:           [10, 7],
    ground:        [0,  0],
    platform:      [1,  0],
    questionBlock: [4,  0],
    coin:          [15, 0],
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

// ── Popola tiles di sfondo ────────────────────────────────────────
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

// ── Carica entità dal JSON ────────────────────────────────────────
async function createEntities(level, entities = []) {
  for (const {
    type,
    position: [px, py],
    content,
  } of entities) {
    if (type === "questionBlock") {
      const blockContent = content || "coin";
      const block = await createQuestionBlock(level, blockContent);

      block.setPosition(px, py);
      level.entities.add(block);

      const tileX = Math.floor(px / 16);
      const tileY = Math.floor(py / 16);
      level.tiles.set(tileX, tileY, { name: "questionBlock", block });
    }

    if (type === "coin") {
      const coin = new Coin(px, py);
      level.entities.add(coin);
    }

    if (type === "coinStable") {
      const coin = new CoinStable(px, py);
      level.entities.add(coin);
    }
  }
}

// ── Carica livello ────────────────────────────────────────────────
// Accetta un'entità opzionale (mario) a cui collegare il tileCollider.
// In questo modo mario.update() può verificare le tile sopra di lui
// durante la trasformazione power-up senza causare invasione delle tile.
export async function loadLevel(name, playerEntity = null) {
  const res = await fetch(`/levels/${name}.json`);
  const levelSpec = await res.json();

  const level = new Level();

  level.backgroundSprites = await loadBackgroundSprites();

  createTiles(level, levelSpec.backgrounds);

  await createEntities(level, levelSpec.entities);

  level.tileCollider = new TileCollider(level.tiles, 16, level);

  // ── Collega il tileCollider al giocatore ──────────────────────────
  // Necessario per il controllo anti-invasione durante il power-up:
  // mario._tileCollider viene letto in entity.js → mario.update()
  if (playerEntity) {
    playerEntity._tileCollider = level.tileCollider;
  }

  return level;
}
