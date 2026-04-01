import Trait from "./trait.js";

export default class Jump extends Trait {
  constructor() {
    super("jump");
    this.jumpSpeed = 400;
    this.onGround = false;
  }

  start(entity) {
    if (!this.onGround) return;
    entity.velocity.y = -this.jumpSpeed;
    this.onGround = false;
  }

  cancel(entity) {
    if (entity.velocity.y < -this.jumpSpeed / 2) {
      entity.velocity.y = -this.jumpSpeed / 2;
    }
  }

  update(deltaTime, entity) {
    // onGround viene impostato dal tileCollider, non da qui
  }
}
