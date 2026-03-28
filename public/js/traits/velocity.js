import Trait from "./trait.js";

export default class Velocity extends Trait {
  constructor() {
    super("velocity");
  }

  update(entity, dtime) {
    // contiene velocity.x / velocity.y, puoi aggiungere attrito se vuoi
  }
}
