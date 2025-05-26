// src/Entities.js

import Entity from "./entity.js";
import Velocity from "./traits/velocity.js";
import Jump from "./traits/jump.js";
import { loadMarioSprite } from "./sprite.js";
import Gravity from "./traits/gravity.js";

export async function createMario() {
  const sprites = await loadMarioSprite();

  const mario = new Entity();

  mario.draw = function drawMario(ctx) {
    sprites.draw("idle", ctx, this.position.x, this.position.y);
    console.log("Available sprite keys:", Object.keys(sprites.frames || {}));
  };

  mario.addTrait(new Velocity());
  mario.addTrait(new Jump());
  mario.addTrait(new Gravity());

  return mario;
}
