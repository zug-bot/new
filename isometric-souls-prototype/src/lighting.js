// lighting.js
// Enhanced lighting and shadow system

import * as PIXI from 'pixi.js'

export class LightingSystem {
  constructor(app) {
    this.app = app;
    this.lights = [];
    this.shadows = [];
    this.ambientLight = 0.3;
    this.lightContainer = new PIXI.Container();
    this.shadowContainer = new PIXI.Container();
    
    app.stage.addChild(this.shadowContainer);
    app.stage.addChild(this.lightContainer);
    
    this.setupAmbientLighting();
  }
  
  setupAmbientLighting() {
    // Create ambient light overlay
    this.ambientOverlay = new PIXI.Graphics();
    this.ambientOverlay.beginFill(0x404080, this.ambientLight);
    this.ambientOverlay.drawRect(0, 0, this.app.renderer.width, this.app.renderer.height);
    this.ambientOverlay.endFill();
    this.ambientOverlay.blendMode = 'multiply';
    this.lightContainer.addChild(this.ambientOverlay);
  }
  
  createPointLight(x, y, config = {}) {
    const {
      radius = 100,
      color = 0xffffff,
      intensity = 0.8,
      flicker = false,
      flickerSpeed = 1.0,
      flickerAmount = 0.2
    } = config;
    
    const light = new PIXI.Graphics();
    light.x = x;
    light.y = y;
    
    // Create radial gradient effect
    const gradient = this.createRadialGradient(radius, color, intensity);
    light.beginFill(gradient);
    light.drawCircle(0, 0, radius);
    light.endFill();
    light.blendMode = 'add';
    
    // Store light properties
    light.radius = radius;
    light.color = color;
    light.intensity = intensity;
    light.flicker = flicker;
    light.flickerSpeed = flickerSpeed;
    light.flickerAmount = flickerAmount;
    light.originalIntensity = intensity;
    
    this.lights.push(light);
    this.lightContainer.addChild(light);
    
    return light;
  }
  
  createRadialGradient(radius, color, intensity) {
    // Create a simple radial gradient using multiple circles
    const gradient = new PIXI.Graphics();
    
    // Outer ring
    gradient.beginFill(color, intensity * 0.1);
    gradient.drawCircle(0, 0, radius);
    gradient.endFill();
    
    // Middle ring
    gradient.beginFill(color, intensity * 0.3);
    gradient.drawCircle(0, 0, radius * 0.7);
    gradient.endFill();
    
    // Inner ring
    gradient.beginFill(color, intensity * 0.6);
    gradient.drawCircle(0, 0, radius * 0.4);
    gradient.endFill();
    
    // Core
    gradient.beginFill(color, intensity);
    gradient.drawCircle(0, 0, radius * 0.2);
    gradient.endFill();
    
    return gradient;
  }
  
  createShadow(x, y, config = {}) {
    const {
      radius = 30,
      opacity = 0.6,
      blur = 5
    } = config;
    
    const shadow = new PIXI.Graphics();
    shadow.beginFill(0x000000, opacity);
    shadow.drawEllipse(0, 0, radius, radius * 0.6);
    shadow.endFill();
    shadow.x = x;
    shadow.y = y;
    shadow.blendMode = 'multiply';
    
    // Add blur effect
    if (blur > 0) {
      const blurFilter = new PIXI.BlurFilter(blur);
      shadow.filters = [blurFilter];
    }
    
    this.shadows.push(shadow);
    this.shadowContainer.addChild(shadow);
    
    return shadow;
  }
  
  createTorchLight(x, y) {
    const light = this.createPointLight(x, y, {
      radius: 80,
      color: 0xff6600,
      intensity: 0.7,
      flicker: true,
      flickerSpeed: 2.0,
      flickerAmount: 0.3
    });
    
    // Add flame particle effect
    this.createFlameEffect(x, y - 20);
    
    return light;
  }
  
  createFlameEffect(x, y) {
    const flame = new PIXI.Graphics();
    flame.x = x;
    flame.y = y;
    
    // Create flame shape
    flame.beginFill(0xff4400, 0.8);
    flame.moveTo(0, 10);
    flame.lineTo(-8, -10);
    flame.lineTo(-4, -15);
    flame.lineTo(0, -10);
    flame.lineTo(4, -15);
    flame.lineTo(8, -10);
    flame.closePath();
    flame.endFill();
    
    flame.blendMode = 'add';
    this.lightContainer.addChild(flame);
    
    // Animate flame
    this.app.ticker.add(() => {
      const t = this.app.ticker.lastTime * 0.001;
      flame.scale.x = 1 + Math.sin(t * 8) * 0.1;
      flame.scale.y = 1 + Math.cos(t * 6) * 0.15;
      flame.alpha = 0.7 + Math.sin(t * 10) * 0.3;
    });
    
    return flame;
  }
  
  createCombatLight(x, y, intensity = 1.0) {
    const light = this.createPointLight(x, y, {
      radius: 60,
      color: 0xffffff,
      intensity: intensity,
      flicker: true,
      flickerSpeed: 5.0,
      flickerAmount: 0.4
    });
    
    return light;
  }
  
  updateLight(light, x, y) {
    light.x = x;
    light.y = y;
  }
  
  updateShadow(shadow, x, y) {
    shadow.x = x;
    shadow.y = y;
  }
  
  update(dt) {
    // Update flickering lights
    this.lights.forEach(light => {
      if (light.flicker) {
        const t = this.app.ticker.lastTime * 0.001;
        const flicker = Math.sin(t * light.flickerSpeed) * light.flickerAmount;
        light.alpha = light.originalIntensity + flicker;
      }
    });
    
    // Update ambient lighting based on time of day or combat state
    this.updateAmbientLighting();
  }
  
  updateAmbientLighting() {
    const t = this.app.ticker.lastTime * 0.001;
    
    // Simulate day/night cycle
    const dayCycle = (Math.sin(t * 0.0001) + 1) * 0.5;
    const ambientIntensity = 0.2 + dayCycle * 0.3;
    
    this.ambientOverlay.alpha = ambientIntensity;
  }
  
  setCombatMode(enabled) {
    if (enabled) {
      // Darker ambient lighting during combat
      this.ambientOverlay.alpha = 0.1;
    } else {
      // Normal ambient lighting
      this.ambientOverlay.alpha = this.ambientLight;
    }
  }
  
  createLightningFlash() {
    const flash = new PIXI.Graphics();
    flash.beginFill(0xffffff, 0.8);
    flash.drawRect(0, 0, this.app.renderer.width, this.app.renderer.height);
    flash.endFill();
    flash.blendMode = 'add';
    
    this.lightContainer.addChild(flash);
    
    // Flash effect
    flash.alpha = 0.8;
    this.app.ticker.add(() => {
      flash.alpha *= 0.9;
      if (flash.alpha < 0.01) {
        this.lightContainer.removeChild(flash);
      }
    });
  }
  
  createMuzzleFlash(x, y) {
    const flash = this.createPointLight(x, y, {
      radius: 40,
      color: 0xffff00,
      intensity: 1.0,
      flicker: false
    });
    
    // Quick flash and fade
    this.app.ticker.add(() => {
      flash.alpha *= 0.85;
      if (flash.alpha < 0.01) {
        this.lightContainer.removeChild(flash);
        const index = this.lights.indexOf(flash);
        if (index > -1) this.lights.splice(index, 1);
      }
    });
    
    return flash;
  }
}