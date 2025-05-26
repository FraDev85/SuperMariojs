import { Trait } from "../entity.js";

export default class Gravity extends Trait {
  constructor() {
    super("gravity");
    this.force = 400; // Forza di gravità
  }

  update(entity, dtime) {
    // Applica sempre la gravità verso il basso
    entity.velocity.y += this.force * dtime;

    // Impedisci che Mario cada sotto il livello del suolo (175 è la sua posizione iniziale)
    if (entity.position.y > 175) {
      entity.position.y = 175;
      entity.velocity.y = 0; // Ferma la caduta quando tocca il suolo
    }
  }
}
