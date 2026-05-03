// coinStable.js
import Coin from "./coin.js";

export default class CoinStable extends Coin {
  constructor(x, y) {
    super(x, y);
    this.velocity = { x: 0, y: 0 };
    this.lifetime = Infinity;
  }

  update(deltaTime) {
    this.frameTime += deltaTime;
    if (this.frameTime > 0.3) {
      this.frameTime = 0;
      this.currentFrame = (this.currentFrame + 1) % 12;
    }
  }
}
