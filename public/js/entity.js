import Coordinate from "./coordinate.js"; // make sure the filename matches

export default class Entity {
  constructor() {
    this.position = new Coordinate(0, 0);
    this.velocity = new Coordinate(0, 0);
  }
}
