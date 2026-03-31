export default class Jump {
  constructor() {
    this.name = "jump";
    this.jumpSpeed = 150; // velocità verticale
    this.isJumping = false;
    this.onGround = true; // assume che inizi a terra
  }

  start(entity) {
    if (!this.onGround) return; // non possiamo saltare in aria
    entity.velocity.y = -this.jumpSpeed; // imposta velocità verso l’alto
    this.isJumping = true;
    this.onGround = false;
  }

  cancel(entity) {
    if (entity.velocity.y < -this.jumpSpeed / 2) {
      entity.velocity.y = -this.jumpSpeed / 2; // riduce l’altezza se rilasciato prima
    }
    this.isJumping = false;
  }

  update(deltaTime, entity) {
    // verifica se Mario ha toccato terra
    if (entity.position.y >= 174) {
      // qui 174 è l’altezza del pavimento
      entity.position.y = 174;
      entity.velocity.y = 0;
      this.onGround = true;
      this.isJumping = false;
    } else {
      this.onGround = false;
    }
  }
}
