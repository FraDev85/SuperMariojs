// loader.js
import Level from "./level.js";
import TileCollider from "./tileCollider.js";
import { createQuestionBlock } from "./questionBlock.js";
import Coin from "./coin.js";
import CoinStable from "./coinStable.js";
import { createGoomba } from "./goomba.js";
import { createKoopa } from "./koopa.js";
import { loadDecorationSprites, createDecorationLayer } from "./decorations.js";

// ── Load Image ───────────────────────────────────────────────
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = url;
  });
}

// ── Load background sprites ─────────────────────────────────────
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

// ── fill tiles  Background ────────────────────────────────────────
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

// ── Load entity from JSON ────────────────────────────────────────
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

    if (type === "goomba") {
      const goomba = await createGoomba();
      goomba.setPosition(px, py);
      level.entities.add(goomba);
    }

    if (type === "koopa") {
      const koopa = await createKoopa();
      koopa.setPosition(px, py);
      level.entities.add(koopa);
    }
  }
}

// ── Load livell ────────────────────────────────────────────────

export async function loadLevel(name, playerEntity = null) {
  const res = await fetch(`/levels/${name}.json`);
  const levelSpec = await res.json();

  const level = new Level();

  level.backgroundSprites = await loadBackgroundSprites();

  // ── Decoration────────────────────────
  const decorSprites = await loadDecorationSprites();
  const decorations  = levelSpec.decorations || [];
  level.decorationLayer = createDecorationLayer(decorations, decorSprites);

  createTiles(level, levelSpec.backgrounds);

  await createEntities(level, levelSpec.entities);

  level.tileCollider = new TileCollider(level.tiles, 16, level);

  // ── Link tile to player ──────────────────────────
  if (playerEntity) {
    playerEntity._tileCollider = level.tileCollider;
  }

  return level;
}
