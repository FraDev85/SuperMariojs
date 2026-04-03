// coin.js
import { loadImage } from "./loader.js";
import SpriteSheet from "./spriteSheet.js";
let coinSprites; // globale nel modulo
const coinSound = new Audio("../sounds/coin.ogg");
console.log(coinSound);

coinSound.volume = 0.5; // regola il volume della moneta

export async function loadCoinSprites() {
  const image = await loadImage("/img/tiles.png");
  const sprites = new SpriteSheet(image, 16, 16);
  sprites.define("coin", 240, 0, 16, 16);
  coinSprites = sprites;
  return sprites;
}

export function createCoin(x, y) {
  const coin = {
    position: { x, y },
    velocity: { x: 0, y: -60 },
    age: 0,
    lifetime: 0.5,
    size: { x: 16, y: 16 },

    update(deltaTime) {
      this.age += deltaTime;

      // NON aggiornare subito (frame di spawn)
      if (this.age < 0.02) return;
      this.position.y += this.velocity.y * deltaTime;
      this.lifetime -= deltaTime;
    },

    draw(ctx) {
      if (!coinSprites) return;
      coinSprites.draw("coin", ctx, this.position.x, this.position.y);
    },

    isAlive() {
      return this.lifetime > 0 && !this.collected;
    },
    onCollect() {
      coinSound.currentTime = 0;
      console.log("SUONO MONETA");

      const playPromise = coinSound.play();

      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Audio bloccato:", err);
        });
      }
    },
  };

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
