const PRESSED = 1;
const RELEASED = 0;

export default class KeyboardState {
  constructor() {
    this.keyStates = new Map();
    this.KeyMap = new Map();
  }

  addMapping(keyCode, callback) {
    this.KeyMap.set(keyCode, callback);
  }

  handleEvent(event) {
    const { keyCode } = event;
    if (!this.KeyMap.has(keyCode)) return;

    event.preventDefault();
    const keyState = event.type === "keydown" ? PRESSED : RELEASED;

    if (this.keyStates.get(keyCode) === keyState) return;

    this.keyStates.set(keyCode, keyState);
    this.KeyMap.get(keyCode)(keyState);
  }

  listenTo(window) {
    ["keydown", "keyup"].forEach((eventName) => {
      window.addEventListener(eventName, (event) => this.handleEvent(event));
    });
  }
}
