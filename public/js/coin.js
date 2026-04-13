// coin.js
import { loadImage } from "./loader.js";
import SpriteSheet from "./spriteSheet.js";

let coinSprites;
const coinSound = new Audio("../sounds/coin.ogg");

export async function loadCoinSprites() {
  const image = await loadImage("/img/tiles.png");
  const sprites = new SpriteSheet(image, 16, 16);

  for (let i = 0; i <= 11; i++) {
    sprites.define(`coin${i}`, 240, i * 16, 16, 16);
  }

  coinSprites = sprites;
  return sprites;
}

export function checkCollision(entityA, entityB) {
  return (
    entityA.position.x < entityB.position.x + entityB.size.x &&
    entityA.position.x + entityA.size.x > entityB.position.x &&
    entityA.position.y < entityB.position.y + entityB.size.y &&
    entityA.position.y + entityA.size.y > entityB.position.y
  );
}

export default class Coin {
  constructor(x, y) {
    this.position = { x, y };
    this.velocity = { x: 0, y: -150 }; // impulso iniziale verso l'alto
    this.size = { x: 16, y: 16 };
    this.age = 0;
    this.lifetime = 1;
    this.frameTime = 0;
    this.currentFrame = 0;
  }

  update(deltaTime) {
    this.age += deltaTime;

    // Gravità verso il basso
    this.velocity.y += 400 * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    // Animazione rotazione
    this.frameTime += deltaTime;
    if (this.frameTime > 0.3) {
      this.frameTime = 0;
      this.currentFrame = (this.currentFrame + 1) % 12;
    }

    if (this.age > this.lifetime) this.lifetime = -1;
  }

  draw(ctx) {
    if (!coinSprites) return;
    const frameName = `coin${this.currentFrame}`;
    coinSprites.draw(frameName, ctx, this.position.x, this.position.y);
  }

  isAlive() {
    return this.lifetime > 0;
  }

  onCollect(mario) {
    coinSound.currentTime = 0;
    coinSound.play();
    // Notifica il game loop tramite callback su mario
    if (mario && mario._onCoinCollect) mario._onCoinCollect();
  }
}
