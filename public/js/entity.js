import Coordinate from "./coordinate.js";
import Velocity from "./traits/velocity.js";
import VelocityMovement from "./traits/velocityMovement.js";
import Jump from "./traits/jump.js";
import Gravity from "./traits/gravity.js";
import { loadMarioSprite } from "./sprite.js";

export default class Entity {
  constructor() {
    this.position = new Coordinate(0, 0);
    this.velocity = new Coordinate(0, 0);
    this.size = new Coordinate(16, 16);
    this.traits = [];
  }

  addTrait(trait) {
    this.traits.push(trait);
    this[trait.NAME] = trait;
  }

  update(dtime) {
    this.traits.forEach((trait) => {
      if (trait.update) trait.update(this, dtime);
    });
  }
}

export async function createMario() {
  const sprites = await loadMarioSprite();
  const mario = new Entity();

  mario.draw = function (ctx) {
    sprites.draw("idle", ctx, this.position.x, this.position.y);
  };

  mario.addTrait(new Velocity());
  mario.addTrait(new VelocityMovement());
  mario.addTrait(new Gravity());
  mario.addTrait(new Jump());

  return mario;
}
