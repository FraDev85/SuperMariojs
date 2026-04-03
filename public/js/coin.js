// coin.js
import { loadImage } from "./loader.js";
import SpriteSheet from "./spriteSheet.js";

let coinSprites;
const coinSound = new Audio("../sounds/coin.ogg");

export async function loadCoinSprites() {
  const image = await loadImage("/img/tiles.png");
  const sprites = new SpriteSheet(image, 16, 16);
  // coordinate NES: riga 0, colonna 15
  sprites.define("coin", 240, 0, 16, 16);
  coinSprites = sprites;
  return sprites;
}

export function createCoin(x, y) {
  const coin = {
    position: { x, y },
    velocity: { x: 0, y: -80 }, // più veloce per il “pop”
    lifetime: 0.5, // dura mezzo secondo
    size: { x: 16, y: 16 },
    age: 0,

    update(deltaTime) {
      this.age += deltaTime;
      this.position.y += this.velocity.y * deltaTime;
      // rallenta la salita
      this.velocity.y += 300 * deltaTime; // gravità verso il basso
      if (this.age > this.lifetime) {
        this.lifetime = -1; // segna come da rimuovere
      }
    },

    draw(ctx) {
      if (!coinSprites) return;
      coinSprites.draw("coin", ctx, this.position.x, this.position.y);
    },

    isAlive() {
      return this.lifetime > 0;
    },

    onCollect() {
      coinSound.currentTime = 0;
      coinSound.play();
    },
  };

  // Riproduce subito il suono alla comparsa, come NES
  coinSound.currentTime = 0;
  coinSound.play();

  return coin;
}

export function checkCollision(entityA, entityB) {
  return (
    entityA.position.x < entityB.position.x + entityB.size.x &&
    entityA.position.x + entityA.size.x > entityB.position.x &&
    entityA.position.y < entityB.position.y + entityB.size.y &&
    entityA.position.y + entityA.size.y > entityB.position.y
  );
}
