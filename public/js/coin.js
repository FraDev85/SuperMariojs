// coin.js
import { loadImage } from "./loader.js";
import SpriteSheet from "./spriteSheet.js";

let coinSprites;
const coinSound = new Audio("../sounds/coin.ogg");

export async function loadCoinSprites() {
  const image = await loadImage("/img/tiles.png");
  const sprites = new SpriteSheet(image, 16, 16);

  // Definiamo tutti i frame della moneta (riga 0 → 11)
  for (let i = 0; i <= 11; i++) {
    sprites.define(`coin${i}`, 240, i * 16, 16, 16);
  }

  coinSprites = sprites;
  return sprites;
}

export function createCoin(x, y) {
  const coin = {
    position: { x, y },
    velocity: { x: 0, y: -150 }, // impulso iniziale verso l'alto
    lifetime: 1, // dura 1 secondo
    size: { x: 16, y: 16 },
    age: 0,
    frameTime: 0,
    currentFrame: 0,

    update(deltaTime) {
      this.age += deltaTime;

      // Gravità verso il basso, crea un arco
      this.velocity.y += 400 * deltaTime;
      this.position.y += this.velocity.y * deltaTime;

      // Animazione rotazione moneta
      this.frameTime += deltaTime;
      if (this.frameTime > 0.3) {
        // cambia frame ogni 0.3s
        this.frameTime = 0;
        this.currentFrame = (this.currentFrame + 1) % 12;
      }

      if (this.age > this.lifetime) {
        this.lifetime = -1; // da rimuovere
      }
    },

    draw(ctx) {
      if (!coinSprites) return;
      const frameName = `coin${this.currentFrame}`;
      coinSprites.draw(frameName, ctx, this.position.x, this.position.y);
    },

    isAlive() {
      return this.lifetime > 0;
    },

    onCollect() {
      coinSound.currentTime = 0;
      coinSound.play();
    },
  };

  // Suono alla comparsa
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
