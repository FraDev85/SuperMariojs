import Trait from "./trait.js";

export default class VelocityMovement extends Trait {
  constructor() {
    super("velocityMovement");
  }

  update(entity, dtime) {
    entity.position.x += entity.velocity.x * dtime;
    entity.position.y += entity.velocity.y * dtime;
  }
}
