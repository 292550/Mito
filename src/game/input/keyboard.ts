import { params } from "game/params";

// when you press one, the other one gets removed from the keyMap
const OPPOSITE_KEYS: Record<string, string> = {
  KeyS: "KeyW",
  KeyW: "KeyS",
  KeyA: "KeyD",
  KeyD: "KeyA",
};

export const Keyboard = new (class Input {
  readonly keyMap = new Set<string>();

  constructor() {
    window.addEventListener("blur", this.handleBlur);
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  private handleBlur = () => {
    this.keyMap.clear();
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    const code = event.code;
    this.keyMap.add(code);
    if (event.code in OPPOSITE_KEYS) {
      this.keyMap.delete(OPPOSITE_KEYS[code]);
    }
    if (code === "KeyH") {
      params.hud = !params.hud;
    }
    if (code === "Slash") {
      params.showGodUI = !params.showGodUI;
    }
    const isOpeningDevtoolsOnChrome =
      (code === "KeyI" && event.shiftKey && event.ctrlKey) || (code === "KeyI" && event.altKey && event.metaKey);
    if (!isOpeningDevtoolsOnChrome) {
      event.preventDefault();
      return false;
    }
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    this.keyMap.delete(event.code);
  };

  public shouldShowInMapPopup() {
    return (
      // TODO add mac cmd key
      this.keyMap.has("AltLeft") || this.keyMap.has("AltRight")
      // this.keyMap.has("ShiftLeft") || this.keyMap.has("ShiftRight")
    );
  }
})();

export default Keyboard;
