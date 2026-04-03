// coin.js
export function createCoin(x, y, sprites) {
  const coin = {
    position: { x, y },
    velocity: { x: 0, y: -60 }, // sale verso l'alto
    lifetime: 0.5, // 0.5 secondi
    size: { x: 16, y: 16 },

    update(deltaTime) {
      this.position.y += this.velocity.y * deltaTime;
      this.lifetime -= deltaTime;
    },

    draw(ctx) {
      if (!sprites) return;
      sprites.drawTile("coin", ctx, this.position.x, this.position.y);
    },

    isAlive() {
      return this.lifetime > 0;
    },
  };

  console.log("Creata moneta:", coin);
  return coin;
}
