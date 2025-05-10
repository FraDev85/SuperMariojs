export default class Timer {
  constructor(dtime = 1 / 60) {
    let accTime = 0;
    let ltime = 0;

    this.updateProxy = (time) => {
      accTime += (time - ltime) / 1000;
      while (accTime > dtime) {
        this.update(dtime); // Fixed this line
        accTime -= dtime;
      }

      ltime = time;
      this.enqueue();
    };
  }

  enqueue() {
    requestAnimationFrame(this.updateProxy);
  }

  start() {
    this.enqueue();
  }
}
