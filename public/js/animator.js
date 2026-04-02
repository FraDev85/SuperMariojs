// animator.js
export default class Animator {
  constructor(frames, frameTime) {
    this.frames = frames;
    this.frameTime = frameTime;
    this.elapsed = 0;
  }

  frame(deltaTime) {
    this.elapsed += deltaTime;
    const index =
      Math.floor(this.elapsed / this.frameTime) % this.frames.length;
    return this.frames[index];
  }

  reset() {
    this.elapsed = 0;
  }
}
