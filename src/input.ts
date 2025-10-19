export type KeyState = {
  pressed: Set<string>;
  justPressed: Set<string>;
  justReleased: Set<string>;
};

export function createKeyState(): KeyState {
  const state: KeyState = {
    pressed: new Set<string>(),
    justPressed: new Set<string>(),
    justReleased: new Set<string>(),
  };

  const down = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (!state.pressed.has(key)) state.justPressed.add(key);
    state.pressed.add(key);
  };

  const up = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    state.pressed.delete(key);
    state.justReleased.add(key);
  };

  window.addEventListener('keydown', down);
  window.addEventListener('keyup', up);

  return state;
}

export function consumeFrame(keyState: KeyState): void {
  keyState.justPressed.clear();
  keyState.justReleased.clear();
}
