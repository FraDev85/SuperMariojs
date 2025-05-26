import { Trait } from "../entity.js";

export default class Velocity extends Trait {
  constructor() {
    super("velocityTrait"); // Cambia nome per evitare conflitto con entity.velocity
  }
  update(entity, dtime) {
    entity.position.x += entity.velocity.x * dtime;
    entity.position.y += entity.velocity.y * dtime;
  }
}
