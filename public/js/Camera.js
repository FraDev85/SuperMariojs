// Camera.js
import { Vector } from "./math.js";

export default class Camera {
  constructor(target, levelWidth, levelHeight) {
    this.position = new Vector(0, 0);
    this.target = target;
    this.levelWidth = levelWidth;
    this.levelHeight = levelHeight;

    this.lastTargetX = target.position.x;
  }

  update(canvasWidth, canvasHeight) {
    if (!this.target || isNaN(this.target.position.x)) return;

    // delta reale di posizione (smooth look-ahead)
    const lookAhead = (this.target.position.x - this.lastTargetX) * 5;
    this.lastTargetX = this.target.position.x;

    const targetX = this.target.position.x + lookAhead - canvasWidth / 2;

    // interpolazione fluida (lerp)
    this.position.x += (targetX - this.position.x) * 0.1;

    // clamp della camera all'interno del livello
    const maxX = Math.max(this.levelWidth - canvasWidth, 0);
    this.position.x = Math.max(0, Math.min(this.position.x, maxX));

    // opzione verticale fissa (puoi cambiare se vuoi seguire y)
    this.position.y = 0;
  }
}
