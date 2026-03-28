import Trait from "./trait.js";

export default class Gravity extends Trait {
  constructor() {
    super("gravity");
    this.gravity = 500; // px/sec²
  }

  update(entity, dtime) {
    entity.velocity.y += this.gravity * dtime;

    // semplice pavimento
    if (entity.position.y > 175) {
      entity.position.y = 175;
      entity.velocity.y = 0;
    }
  }
}
