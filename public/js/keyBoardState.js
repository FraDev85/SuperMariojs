const PRESSED = 1;
const RELEASED = 0;

export default class KeyboardState {
  constructor() {
    this.keyStates = new Map();
    this.KeyMap = new Map();
  }

  addMapping(keyCode, callback) {
    this.KeyMap.set(keyCode, callback);
    this.keyStates.set(keyCode, RELEASED);
  }

  handleEvent(event) {
    const { keyCode } = event;

    if (!this.KeyMap.has(keyCode)) return;

    event.preventDefault();

    const keyState = event.type === "keydown" ? PRESSED : RELEASED;

    if (this.keyStates.get(keyCode) === keyState) return;

    this.keyStates.set(keyCode, keyState);

    const callback = this.KeyMap.get(keyCode);
    if (callback) {
      callback(keyState);
    }
  }

  listenTo(window) {
    ["keydown", "keyup"].forEach((eventName) => {
      window.addEventListener(eventName, (event) => this.handleEvent(event));
    });
  }
}
