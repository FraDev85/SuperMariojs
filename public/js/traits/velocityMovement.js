import Trait from "./trait.js";

export default class VelocityMovement extends Trait {
  constructor() {
    super("velocityMovement");
    this.enabled = true;
  }

  update(deltaTime, entity) {
    if (!entity.position || !entity.velocity) return;
    if (this.enabled === false) return;

    entity.position.x += entity.velocity.x * deltaTime;
    entity.position.y += entity.velocity.y * deltaTime;
  }
}
