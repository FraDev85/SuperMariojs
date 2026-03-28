import Trait from "./trait.js";

export default class Jump extends Trait {
  constructor() {
    super("jump");
    this.jumpSpeed = -250;
    this.isJumping = false;
  }

  start(entity) {
    if (!this.isJumping && entity.position.y >= 175) {
      entity.velocity.y = this.jumpSpeed;
      this.isJumping = true;
    }
  }

  cancel() {
    this.isJumping = false;
  }

  update(entity, dtime) {
    if (entity.position.y >= 175) {
      this.isJumping = false;
    }
  }
}
