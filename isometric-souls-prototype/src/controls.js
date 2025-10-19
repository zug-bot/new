// controls.js
// Enhanced input system with keyboard and gamepad support

export class ControlSystem {
  constructor() {
    this.keys = new Set();
    this.gamepads = new Map();
    this.lastGamepadState = new Map();
    
    this.setupKeyboard();
    this.setupGamepad();
  }
  
  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
  }
  
  setupGamepad() {
    window.addEventListener('gamepadconnected', (e) => {
      console.log('Gamepad connected:', e.gamepad.id);
      this.gamepads.set(e.gamepad.index, e.gamepad);
    });
    
    window.addEventListener('gamepaddisconnected', (e) => {
      console.log('Gamepad disconnected:', e.gamepad.id);
      this.gamepads.delete(e.gamepad.index);
    });
  }
  
  update() {
    // Update gamepad states
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (gamepad) {
        this.gamepads.set(i, gamepad);
      }
    }
  }
  
  isKeyPressed(key) {
    return this.keys.has(key);
  }
  
  isKeyJustPressed(key) {
    // This would need to be tracked per frame
    return this.keys.has(key);
  }
  
  getMovementInput() {
    let dx = 0, dy = 0;
    
    // Keyboard input
    if (this.isKeyPressed('KeyW') || this.isKeyPressed('ArrowUp')) dy -= 1;
    if (this.isKeyPressed('KeyS') || this.isKeyPressed('ArrowDown')) dy += 1;
    if (this.isKeyPressed('KeyA') || this.isKeyPressed('ArrowLeft')) dx -= 1;
    if (this.isKeyPressed('KeyD') || this.isKeyPressed('ArrowRight')) dx += 1;
    
    // Gamepad input
    for (const [index, gamepad] of this.gamepads) {
      if (gamepad.connected) {
        // Left stick
        const leftStickX = gamepad.axes[0];
        const leftStickY = gamepad.axes[1];
        
        // Apply deadzone
        const deadzone = 0.2;
        if (Math.abs(leftStickX) > deadzone) {
          dx += leftStickX;
        }
        if (Math.abs(leftStickY) > deadzone) {
          dy += leftStickY;
        }
        
        // D-pad
        if (gamepad.buttons[12].pressed) dy -= 1; // Up
        if (gamepad.buttons[13].pressed) dy += 1; // Down
        if (gamepad.buttons[14].pressed) dx -= 1; // Left
        if (gamepad.buttons[15].pressed) dx += 1; // Right
      }
    }
    
    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;
    }
    
    return { dx, dy };
  }
  
  isAttackPressed() {
    // Keyboard
    if (this.isKeyPressed('KeyJ')) return true;
    
    // Gamepad
    for (const [index, gamepad] of this.gamepads) {
      if (gamepad.connected) {
        if (gamepad.buttons[0].pressed) return true; // A button
        if (gamepad.buttons[2].pressed) return true; // X button
      }
    }
    
    return false;
  }
  
  isParryPressed() {
    // Keyboard
    if (this.isKeyPressed('Space')) return true;
    
    // Gamepad
    for (const [index, gamepad] of this.gamepads) {
      if (gamepad.connected) {
        if (gamepad.buttons[1].pressed) return true; // B button
        if (gamepad.buttons[3].pressed) return true; // Y button
        if (gamepad.buttons[7].pressed) return true; // Right trigger
      }
    }
    
    return false;
  }
  
  isParryJustPressed() {
    // This would need frame-by-frame tracking
    // For now, just return the current state
    return this.isParryPressed();
  }
  
  isAttackJustPressed() {
    // This would need frame-by-frame tracking
    // For now, just return the current state
    return this.isAttackPressed();
  }
  
  getGamepadVibration() {
    // Return vibration data for gamepad feedback
    return {
      leftMotor: 0,
      rightMotor: 0
    };
  }
  
  setGamepadVibration(index, leftMotor, rightMotor) {
    const gamepad = this.gamepads.get(index);
    if (gamepad && gamepad.vibrationActuator) {
      gamepad.vibrationActuator.playEffect('dual-rumble', {
        duration: 200,
        strongMagnitude: leftMotor,
        weakMagnitude: rightMotor
      });
    }
  }
  
  getMousePosition() {
    // Return mouse position for camera control
    return {
      x: 0,
      y: 0
    };
  }
  
  isMousePressed() {
    // Return mouse button states
    return {
      left: false,
      right: false,
      middle: false
    };
  }
}