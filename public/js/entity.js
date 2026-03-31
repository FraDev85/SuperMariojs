// entity.js
import { loadMarioSprite } from "./sprite.js";
import Velocity from "./traits/velocity.js";
import VelocityMovement from "./traits/velocityMovement.js";
import Gravity from "./traits/gravity.js";
import Jump from "./traits/jump.js";

// Classe semplice per rappresentare posizione
class Vec2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
  }
}

export default class Entity {
  constructor() {
    this.position = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.size = { x: 16, y: 16 };
    this.traits = [];
  }

  addTrait(trait) {
    this.traits.push(trait);
    trait.entity = this;
  }

  update(deltaTime) {
    this.traits.forEach((trait) => trait.update(deltaTime, this));
  }

  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
  }
}

// Funzione di creazione di Mario
export async function createMario() {
  const sprites = await loadMarioSprite();
  const mario = new Entity();

  // draw
  mario.draw = function (ctx) {
    sprites.draw("idle", ctx, this.position.x, this.position.y);
  };

  // traits
  const velocity = new Velocity();
  const velocityMovement = new VelocityMovement();
  const gravity = new Gravity();
  const jump = new Jump();

  mario.addTrait(velocity);
  mario.addTrait(velocityMovement);
  mario.addTrait(gravity);
  mario.addTrait(jump);

  // assegna jump come proprietà per usarlo nel main
  mario.jump = jump;

  return mario;
}
