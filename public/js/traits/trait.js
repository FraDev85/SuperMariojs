export default class Trait {
  constructor(name) {
    this.NAME = name;
  }

  update(entity, dtime) {
    console.warn("Trait update not implemented for", this.NAME);
  }
}
