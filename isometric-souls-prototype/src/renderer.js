// renderer.js
// Enhanced PixiJS renderer with animations, improved lighting, and better controls

import * as PIXI from 'pixi.js'
import { TILE_W, TILE_H, cartToIso } from './engine.js'
import { LightingSystem } from './lighting.js'
import { ControlSystem } from './controls.js'

export class Character {
  constructor(sprite, shadow, x, y) {
    this.sprite = sprite;
    this.shadow = shadow;
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.isMoving = false;
    this.animationTime = 0;
    this.idleBob = 0;
    this.scale = 1.0;
    this.rotation = 0;
    this.alpha = 1.0;
    
    // Animation states
    this.state = 'idle';
    this.stateTime = 0;
  }
  
  update(dt) {
    this.stateTime += dt;
    this.animationTime += dt;
    
    // Smooth movement
    const moveSpeed = 0.1;
    this.x += (this.targetX - this.x) * moveSpeed;
    this.y += (this.targetY - this.y) * moveSpeed;
    
    this.isMoving = Math.abs(this.targetX - this.x) > 1 || Math.abs(this.targetY - this.y) > 1;
    
    // Update sprite position
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.shadow.x = this.x;
    this.shadow.y = this.y + 24;
    
    // Apply animations
    this.updateAnimation(dt);
  }
  
  updateAnimation(dt) {
    switch (this.state) {
      case 'idle':
        this.idleBob = Math.sin(this.animationTime * 0.003) * 2;
        this.sprite.y = this.y + this.idleBob;
        break;
        
      case 'moving':
        // Bounce while moving
        this.idleBob = Math.sin(this.animationTime * 0.01) * 3;
        this.sprite.y = this.y + this.idleBob;
        break;
        
      case 'attacking':
        // Attack animation
        const attackProgress = this.stateTime / 500; // 500ms attack
        if (attackProgress < 0.3) {
          // Windup
          this.scale = 1.0 + attackProgress * 0.2;
        } else if (attackProgress < 0.7) {
          // Strike
          this.scale = 1.2 - (attackProgress - 0.3) * 0.5;
          this.rotation = Math.sin((attackProgress - 0.3) * Math.PI) * 0.1;
        } else {
          // Recovery
          this.scale = 1.0;
          this.rotation = 0;
        }
        break;
        
      case 'parrying':
        // Parry animation
        const parryProgress = this.stateTime / 300; // 300ms parry
        this.scale = 1.0 + Math.sin(parryProgress * Math.PI) * 0.1;
        this.alpha = 0.8 + Math.sin(parryProgress * Math.PI * 2) * 0.2;
        break;
        
      case 'stunned':
        // Stunned animation
        this.rotation = Math.sin(this.animationTime * 0.02) * 0.1;
        this.alpha = 0.7 + Math.sin(this.animationTime * 0.01) * 0.3;
        break;
    }
    
    // Apply transformations
    this.sprite.scale.set(this.scale);
    this.sprite.rotation = this.rotation;
    this.sprite.alpha = this.alpha;
  }
  
  setState(newState) {
    if (this.state !== newState) {
      this.state = newState;
      this.stateTime = 0;
    }
  }
  
  moveTo(x, y) {
    this.targetX = x;
    this.targetY = y;
    this.setState('moving');
  }
  
  attack() {
    this.setState('attacking');
    setTimeout(() => this.setState('idle'), 500);
  }
  
  parry() {
    this.setState('parrying');
    setTimeout(() => this.setState('idle'), 300);
  }
  
  stun() {
    this.setState('stunned');
    setTimeout(() => this.setState('idle'), 1000);
  }
}

export async function createRenderer() {
  const app = new PIXI.Application();
  await app.init({ 
    background: 0x0e1220, 
    resizeTo: window,
    antialias: true,
    powerPreference: "high-performance"
  });
  document.getElementById('app').appendChild(app.canvas);

  // Load textures (placeholders)
  const assets = await PIXI.Assets.load({
    hero: '/assets/sprites/hero_idle.png',
    goblin: '/assets/sprites/enemy_goblin.png',
    tile: '/assets/sprites/iso_tile_placeholder.png',
    bg: '/assets/backgrounds/forest_bg.png',
    light: '/assets/lights/light_glow.png',
    shadow: '/assets/lights/shadow_blob.png'
  });

  // Background with parallax layers
  const bg = new PIXI.Sprite(assets.bg);
  bg.anchor.set(0.5);
  bg.x = app.renderer.width * 0.5;
  bg.y = app.renderer.height * 0.5;
  app.stage.addChild(bg);

  // Isometric grid floor with depth
  const grid = new PIXI.Container();
  const GRID = 9; // Larger grid
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const tile = new PIXI.Sprite(assets.tile);
      tile.anchor.set(0.5, 0.75);
      const iso = cartToIso(x - Math.floor(GRID/2), y - Math.floor(GRID/2));
      tile.x = app.renderer.width * 0.5 + iso.x;
      tile.y = app.renderer.height * 0.65 + iso.y;
      
      // Add depth variation
      const depth = Math.abs(x - GRID/2) + Math.abs(y - GRID/2);
      tile.alpha = 1.0 - depth * 0.1;
      tile.tint = 0x888888 + depth * 0x111111;
      
      grid.addChild(tile);
    }
  }
  app.stage.addChild(grid);

  // Create characters
  const heroShadow = new PIXI.Sprite(assets.shadow);
  heroShadow.anchor.set(0.5, 0.5);
  const hero = new PIXI.Sprite(assets.hero);
  hero.anchor.set(0.5, 0.8);
  hero.x = app.renderer.width * 0.5;
  hero.y = app.renderer.height * 0.65 - TILE_H * 0.5;
  heroShadow.x = hero.x;
  heroShadow.y = hero.y + 24;
  app.stage.addChild(heroShadow);
  app.stage.addChild(hero);

  const enemyShadow = new PIXI.Sprite(assets.shadow);
  enemyShadow.anchor.set(0.5, 0.5);
  const enemy = new PIXI.Sprite(assets.goblin);
  enemy.anchor.set(0.5, 0.8);
  enemy.x = hero.x + TILE_W * 0.75;
  enemy.y = hero.y + TILE_H * 0.5;
  enemyShadow.x = enemy.x;
  enemyShadow.y = enemy.y + 24;
  app.stage.addChild(enemyShadow);
  app.stage.addChild(enemy);

  // Create character objects
  const heroChar = new Character(hero, heroShadow, hero.x, hero.y);
  const enemyChar = new Character(enemy, enemyShadow, enemy.x, enemy.y);

  // Enhanced lighting system
  const lightingSystem = new LightingSystem(app);
  
  // Create main torch light
  const mainTorch = lightingSystem.createTorchLight(
    app.renderer.width * 0.5, 
    app.renderer.height * 0.3
  );
  
  // Create additional ambient lights
  lightingSystem.createPointLight(
    app.renderer.width * 0.2, 
    app.renderer.height * 0.4,
    { radius: 60, color: 0x4444ff, intensity: 0.4 }
  );
  
  lightingSystem.createPointLight(
    app.renderer.width * 0.8, 
    app.renderer.height * 0.6,
    { radius: 50, color: 0xff4444, intensity: 0.3 }
  );

  // Particle system for effects
  const particles = new PIXI.Container();
  app.stage.addChild(particles);

  // Enhanced camera and effects
  app.ticker.add(() => {
    const t = app.ticker.lastTime * 0.001;
    
    // Parallax background
    bg.x = app.renderer.width * 0.5 + Math.sin(t * 0.1) * 15;
    bg.y = app.renderer.height * 0.5 + Math.cos(t * 0.05) * 10;
    
    // Update lighting system
    lightingSystem.update(app.ticker.deltaMS);
    
    // Move main torch light
    lightingSystem.updateLight(mainTorch, 
      hero.x + Math.cos(t * 0.5) * 80,
      hero.y - 100 + Math.sin(t * 0.5) * 60
    );
    
    // Update characters
    heroChar.update(app.ticker.deltaMS);
    enemyChar.update(app.ticker.deltaMS);
  });

  // Enhanced controls
  const controlSystem = new ControlSystem();

  app.ticker.add((frame) => {
    // Update control system
    controlSystem.update();
    
    const speed = 3.0;
    const movement = controlSystem.getMovementInput();
    
    if (movement.dx || movement.dy) {
      // Move along iso axes with proper scaling
      const moveX = (movement.dx - movement.dy) * (TILE_W/4) * (frame.deltaTime/16) * speed;
      const moveY = (movement.dx + movement.dy) * (TILE_H/4) * (frame.deltaTime/16) * speed;
      
      heroChar.moveTo(heroChar.x + moveX, heroChar.y + moveY);
    } else {
      heroChar.setState('idle');
    }
  });

  return { 
    app, 
    hero: heroChar, 
    enemy: enemyChar,
    particles,
    lightingSystem,
    controlSystem
  };
}
