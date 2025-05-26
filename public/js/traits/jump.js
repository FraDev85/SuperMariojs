import { Trait } from "../entity.js";

export default class Jump extends Trait {
  constructor() {
    super("jump");
    this.duration = 0.5;
    this.velocity = -200; // Negativo per andare verso l'alto
    this.engageTime = 0;
  }

  start() {
    this.engageTime = this.duration;
  }

  cancel() {
    this.engageTime = 0;
  }

  update(entity, dtime) {
    if (this.engageTime > 0) {
      entity.velocity.y = this.velocity; // Imposta velocità verso l'alto
      this.engageTime -= dtime;
    }
  }
}
