import Entity from "./entity.js";
import { loadMarioSprite } from "./sprite.js";

export function createMario() {
  return loadMarioSprite().then((sprites) => {
    const mario = new Entity();

    mario.draw = function drawMario(ctx) {
      sprites.draw("idle", ctx, this.position.x, this.position.y);
    };

    mario.update = function updateMario(dtime) {
      const gravity = 3;
      this.velocity.y += gravity * dtime;
      this.position.x += this.velocity.x * dtime;
      this.position.y += this.velocity.y * dtime;
      // Gravità
      if (mario.position.y > 175) {
        mario.position.y = 175; // Assicura che Mario non scenda sotto il suolo
        mario.velocity.y = 0; // Ferma la velocità verticale
      }
    };

    return mario;
  });
}
