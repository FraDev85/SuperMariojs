const PRESSED = 1;
const RELEASED = 0;

export default class KeyboardState {
  constructor() {
    this.keyStates = new Map();
    this.KeyMap = new Map();
  }

  addMapping(keyCode, callback) {
    this.KeyMap.set(keyCode, callback);
    this.keyStates.set(keyCode, RELEASED); // ✅ inizializzazione fondamentale
  }

  handleEvent(event) {
    const { keyCode } = event;

    // ignora tasti non registrati
    if (!this.KeyMap.has(keyCode)) return;

    event.preventDefault();

    const keyState = event.type === "keydown" ? PRESSED : RELEASED;

    // evita eventi ripetuti inutili
    if (this.keyStates.get(keyCode) === keyState) return;

    this.keyStates.set(keyCode, keyState);

    // esegue il callback associato
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
