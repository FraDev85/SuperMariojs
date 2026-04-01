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

  snap(canvasWidth) {
    const targetX = this.target.position.x - canvasWidth / 2;
    const maxX = Math.max(this.levelWidth - canvasWidth, 0);
    this.position.x = Math.max(0, Math.min(targetX, maxX));
    this.lastTargetX = this.target.position.x;
  }

  update(canvasWidth, canvasHeight) {
    if (!this.target || isNaN(this.target.position.x)) return;

    const lookAhead = (this.target.position.x - this.lastTargetX) * 6;
    this.lastTargetX = this.target.position.x;

    const targetX = this.target.position.x + lookAhead - canvasWidth / 2;
    this.position.x += (targetX - this.position.x) * 0.1;

    const maxX = Math.max(this.levelWidth - canvasWidth, 0);
    this.position.x = Math.max(0, Math.min(this.position.x, maxX));

    this.position.y = 0;
  }
}
