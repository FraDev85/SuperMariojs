export default class Trait {
  constructor(name) {
    this.NAME = name;
  }

  update(deltaTime, entity) {
    console.warn("Trait update not implemented for", this.NAME);
  }
}
