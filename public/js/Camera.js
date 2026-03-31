// Camera.js
import { Vector } from "./math.js";

export default class Camera {
  constructor(target, levelWidth, levelHeight) {
    this.position = new Vector(0, 0);
    this.target = target;
    this.levelWidth = levelWidth;
    this.levelHeight = levelHeight;
  }

  update(canvasWidth, canvasHeight) {
    if (!this.target || isNaN(this.target.position.x)) return;

    const maxX = Math.max(this.levelWidth - canvasWidth, 0);
    const targetX = this.target.position.x - canvasWidth / 2;

    this.position.x = Math.max(0, Math.min(targetX, maxX));
    this.position.y = 0; // verticale fisso
  }
}
