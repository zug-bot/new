// gameStates.js
// Game state management system for menus, gameplay, pause, etc.

import * as PIXI from 'pixi.js';

export class GameStateManager {
  constructor(app) {
    this.app = app;
    this.currentState = 'menu';
    this.states = {
      menu: new MenuState(this),
      gameplay: new GameplayState(this),
      pause: new PauseState(this),
      gameOver: new GameOverState(this),
      victory: new VictoryState(this)
    };
    
    this.stateContainer = new PIXI.Container();
    this.app.stage.addChild(this.stateContainer);
    
    // Start with menu
    this.changeState('menu');
  }
  
  changeState(newState) {
    if (this.states[this.currentState]) {
      this.states[this.currentState].exit();
    }
    
    this.currentState = newState;
    this.stateContainer.removeChildren();
    
    if (this.states[newState]) {
      this.states[newState].enter();
    }
  }
  
  update(deltaTime) {
    if (this.states[this.currentState]) {
      this.states[this.currentState].update(deltaTime);
    }
  }
}

class GameState {
  constructor(manager) {
    this.manager = manager;
    this.container = new PIXI.Container();
  }
  
  enter() {
    this.manager.stateContainer.addChild(this.container);
  }
  
  exit() {
    this.manager.stateContainer.removeChild(this.container);
  }
  
  update(deltaTime) {}
}

class MenuState extends GameState {
  enter() {
    super.enter();
    
    // Create dark overlay
    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.7);
    overlay.drawRect(0, 0, this.manager.app.renderer.width, this.manager.app.renderer.height);
    overlay.endFill();
    this.container.addChild(overlay);
    
    // Title
    const title = new PIXI.Text('ISOMETRIC SOULS', {
      fontFamily: 'Arial',
      fontSize: 72,
      fill: 0xffffff,
      dropShadow: true,
      dropShadowDistance: 4,
      dropShadowColor: 0x000000,
      letterSpacing: 4
    });
    title.anchor.set(0.5);
    title.x = this.manager.app.renderer.width / 2;
    title.y = 150;
    this.container.addChild(title);
    
    // Subtitle
    const subtitle = new PIXI.Text('A Sekiro-inspired 2.5D Combat Experience', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xaaaaaa,
      dropShadow: true,
      dropShadowDistance: 2
    });
    subtitle.anchor.set(0.5);
    subtitle.x = this.manager.app.renderer.width / 2;
    subtitle.y = 220;
    this.container.addChild(subtitle);
    
    // Menu options
    const menuOptions = [
      { text: 'Start Game', action: () => this.manager.changeState('gameplay') },
      { text: 'Controls', action: () => this.showControls() },
      { text: 'Credits', action: () => this.showCredits() }
    ];
    
    menuOptions.forEach((option, index) => {
      const button = this.createButton(option.text, option.action);
      button.x = this.manager.app.renderer.width / 2;
      button.y = 350 + index * 80;
      this.container.addChild(button);
    });
    
    // Animated background effect
    this.particles = [];
    for (let i = 0; i < 30; i++) {
      const particle = new PIXI.Graphics();
      particle.beginFill(0xffffff, 0.3);
      particle.drawCircle(0, 0, Math.random() * 3 + 1);
      particle.endFill();
      particle.x = Math.random() * this.manager.app.renderer.width;
      particle.y = Math.random() * this.manager.app.renderer.height;
      this.container.addChild(particle);
      this.particles.push({
        sprite: particle,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -Math.random() * 0.5
      });
    }
  }
  
  createButton(text, onClick) {
    const button = new PIXI.Container();
    
    // Button background
    const bg = new PIXI.Graphics();
    bg.beginFill(0x333333);
    bg.drawRoundedRect(-150, -30, 300, 60, 10);
    bg.endFill();
    button.addChild(bg);
    
    // Button text
    const label = new PIXI.Text(text, {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xffffff
    });
    label.anchor.set(0.5);
    button.addChild(label);
    
    // Make interactive
    button.eventMode = 'static';
    button.cursor = 'pointer';
    
    button.on('pointerover', () => {
      bg.clear();
      bg.beginFill(0x555555);
      bg.drawRoundedRect(-150, -30, 300, 60, 10);
      bg.endFill();
      button.scale.set(1.05);
    });
    
    button.on('pointerout', () => {
      bg.clear();
      bg.beginFill(0x333333);
      bg.drawRoundedRect(-150, -30, 300, 60, 10);
      bg.endFill();
      button.scale.set(1);
    });
    
    button.on('pointerdown', onClick);
    
    return button;
  }
  
  showControls() {
    const controlsText = `CONTROLS:
    
Movement: WASD / Arrow Keys
Attack: J
Block/Parry: K (hold)
Pause: ESC

COMBAT TIPS:
- Time your parries just before enemy attacks
- Watch for the red danger symbol (危)
- Posture damage leads to execution opportunities
- Perfect parries deal massive posture damage`;
    
    this.showInfoPanel(controlsText);
  }
  
  showCredits() {
    const creditsText = `ISOMETRIC SOULS
    
A 2.5D combat prototype inspired by:
- Sekiro: Shadows Die Twice
- Triangle Strategy
- Octopath Traveler

Created with PixiJS
    
Press ESC to return`;
    
    this.showInfoPanel(creditsText);
  }
  
  showInfoPanel(text) {
    // Create info overlay
    const infoOverlay = new PIXI.Container();
    
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.9);
    bg.drawRect(0, 0, this.manager.app.renderer.width, this.manager.app.renderer.height);
    bg.endFill();
    infoOverlay.addChild(bg);
    
    const infoText = new PIXI.Text(text, {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 0xffffff,
      align: 'center',
      lineHeight: 30
    });
    infoText.anchor.set(0.5);
    infoText.x = this.manager.app.renderer.width / 2;
    infoText.y = this.manager.app.renderer.height / 2;
    infoOverlay.addChild(infoText);
    
    this.container.addChild(infoOverlay);
    
    // Close on ESC
    const closeHandler = (e) => {
      if (e.code === 'Escape') {
        this.container.removeChild(infoOverlay);
        window.removeEventListener('keydown', closeHandler);
      }
    };
    window.addEventListener('keydown', closeHandler);
  }
  
  update(deltaTime) {
    // Update particles
    this.particles.forEach(p => {
      p.sprite.x += p.vx;
      p.sprite.y += p.vy;
      
      if (p.sprite.y < -10) {
        p.sprite.y = this.manager.app.renderer.height + 10;
        p.sprite.x = Math.random() * this.manager.app.renderer.width;
      }
    });
  }
}

class GameplayState extends GameState {
  enter() {
    super.enter();
    // Gameplay is handled by main game logic
    
    // Add pause handler
    this.pauseHandler = (e) => {
      if (e.code === 'Escape') {
        this.manager.changeState('pause');
      }
    };
    window.addEventListener('keydown', this.pauseHandler);
  }
  
  exit() {
    window.removeEventListener('keydown', this.pauseHandler);
    super.exit();
  }
}

class PauseState extends GameState {
  enter() {
    super.enter();
    
    // Semi-transparent overlay
    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.5);
    overlay.drawRect(0, 0, this.manager.app.renderer.width, this.manager.app.renderer.height);
    overlay.endFill();
    this.container.addChild(overlay);
    
    // Pause text
    const pauseText = new PIXI.Text('PAUSED', {
      fontFamily: 'Arial',
      fontSize: 72,
      fill: 0xffffff,
      dropShadow: true,
      dropShadowDistance: 4
    });
    pauseText.anchor.set(0.5);
    pauseText.x = this.manager.app.renderer.width / 2;
    pauseText.y = this.manager.app.renderer.height / 2 - 50;
    this.container.addChild(pauseText);
    
    // Instructions
    const instructions = new PIXI.Text('Press ESC to Resume', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xaaaaaa
    });
    instructions.anchor.set(0.5);
    instructions.x = this.manager.app.renderer.width / 2;
    instructions.y = this.manager.app.renderer.height / 2 + 50;
    this.container.addChild(instructions);
    
    // Resume handler
    this.resumeHandler = (e) => {
      if (e.code === 'Escape') {
        this.manager.changeState('gameplay');
      }
    };
    window.addEventListener('keydown', this.resumeHandler);
  }
  
  exit() {
    window.removeEventListener('keydown', this.resumeHandler);
    super.exit();
  }
}

class GameOverState extends GameState {
  enter() {
    super.enter();
    
    // Dark overlay
    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.8);
    overlay.drawRect(0, 0, this.manager.app.renderer.width, this.manager.app.renderer.height);
    overlay.endFill();
    this.container.addChild(overlay);
    
    // Death text
    const deathText = new PIXI.Text('DEATH', {
      fontFamily: 'Arial',
      fontSize: 96,
      fill: 0xff0000,
      dropShadow: true,
      dropShadowDistance: 6,
      dropShadowColor: 0x000000
    });
    deathText.anchor.set(0.5);
    deathText.x = this.manager.app.renderer.width / 2;
    deathText.y = this.manager.app.renderer.height / 2 - 50;
    this.container.addChild(deathText);
    
    // Retry button
    const retryButton = this.createButton('Retry', () => {
      window.location.reload(); // Simple solution for now
    });
    retryButton.x = this.manager.app.renderer.width / 2;
    retryButton.y = this.manager.app.renderer.height / 2 + 100;
    this.container.addChild(retryButton);
  }
  
  createButton(text, onClick) {
    const button = new PIXI.Container();
    
    const bg = new PIXI.Graphics();
    bg.beginFill(0x660000);
    bg.drawRoundedRect(-100, -30, 200, 60, 10);
    bg.endFill();
    button.addChild(bg);
    
    const label = new PIXI.Text(text, {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xffffff
    });
    label.anchor.set(0.5);
    button.addChild(label);
    
    button.eventMode = 'static';
    button.cursor = 'pointer';
    button.on('pointerdown', onClick);
    
    return button;
  }
}

class VictoryState extends GameState {
  enter() {
    super.enter();
    
    // Victory overlay
    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.7);
    overlay.drawRect(0, 0, this.manager.app.renderer.width, this.manager.app.renderer.height);
    overlay.endFill();
    this.container.addChild(overlay);
    
    // Victory text
    const victoryText = new PIXI.Text('ENEMY FELLED', {
      fontFamily: 'Arial',
      fontSize: 72,
      fill: 0xffff00,
      dropShadow: true,
      dropShadowDistance: 4
    });
    victoryText.anchor.set(0.5);
    victoryText.x = this.manager.app.renderer.width / 2;
    victoryText.y = this.manager.app.renderer.height / 2;
    this.container.addChild(victoryText);
  }
}