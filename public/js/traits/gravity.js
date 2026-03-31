import Trait from "./trait.js";

export default class Gravity extends Trait {
  constructor() {
    super("gravity");
    this.gravity = 200; // px/sec², molto più alto per effetto realistico
  }

  update(deltaTime, entity) {
    if (!entity.position || !entity.velocity) return;

    // applica la gravità
    entity.velocity.y += this.gravity * deltaTime;

    // pavimento
    if (entity.position.y > 175) {
      entity.position.y = 175;
      entity.velocity.y = 0;
    }
  }
}
