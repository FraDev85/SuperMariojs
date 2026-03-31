export class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
  }
}

// math.js
export class Matrix {
  constructor() {
    this.data = {};
  }

  get(x, y) {
    return this.data[`${x},${y}`];
  }

  set(x, y, value) {
    this.data[`${x},${y}`] = value;
  }

  forEach(callback) {
    for (let key in this.data) {
      const [x, y] = key.split(",").map(Number);
      callback(this.data[key], x, y);
    }
  }
}
