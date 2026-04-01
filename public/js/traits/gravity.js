import Trait from "./trait.js";

export default class Gravity extends Trait {
  constructor() {
    super("gravity");
    this.gravity = 1200; // px/sec²
  }

  update(deltaTime, entity) {
    entity.velocity.y += this.gravity * deltaTime;
  }
}
