import Coordinate from "./coordinate.js";

export class Trait {
  constructor(name) {
    this.NAME = name;
  }
  update() {
    console.warn("update unhandling errors call in treats");
  }
}

export default class Entity {
  constructor() {
    this.position = new Coordinate(0, 0);
    this.velocity = new Coordinate(0, 0);
    this.traits = [];
  }

  addTrait(trait) {
    this.traits.push(trait);
    // Cambia il nome per evitare conflitti con le proprietà esistenti
    // Usa un nome diverso o un prefixo per i traits
    const traitName = trait.NAME === "velocity" ? "velocityTrait" : trait.NAME;
    this[traitName] = trait;
  }

  update(dtime) {
    this.traits.forEach((trait) => {
      trait.update(this, dtime);
    });
  }
}
