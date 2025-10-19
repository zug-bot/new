// particles.js
// Particle system for visual effects

import * as PIXI from 'pixi.js'

export class ParticleSystem {
  constructor(container) {
    this.container = container;
    this.particles = [];
    this.emitters = [];
  }
  
  createParticle(x, y, config = {}) {
    const {
      color = 0xffffff,
      size = 2,
      life = 1000,
      velocity = { x: 0, y: 0 },
      gravity = 0,
      fade = true,
      scale = 1
    } = config;
    
    const particle = new PIXI.Graphics();
    particle.beginFill(color, 0.8);
    particle.drawCircle(0, 0, size);
    particle.endFill();
    
    particle.x = x;
    particle.y = y;
    particle.vx = velocity.x;
    particle.vy = velocity.y;
    particle.life = life;
    particle.maxLife = life;
    particle.gravity = gravity;
    particle.fade = fade;
    particle.scale.set(scale);
    
    this.container.addChild(particle);
    this.particles.push(particle);
    
    return particle;
  }
  
  createExplosion(x, y, color = 0xff4444, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      this.createParticle(x, y, {
        color,
        size: 3 + Math.random() * 2,
        life: 800 + Math.random() * 400,
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        gravity: 0.05,
        fade: true
      });
    }
  }
  
  createSparks(x, y, count = 5) {
    for (let i = 0; i < count; i++) {
      this.createParticle(x, y, {
        color: 0xffff88,
        size: 1 + Math.random(),
        life: 300 + Math.random() * 200,
        velocity: {
          x: (Math.random() - 0.5) * 4,
          y: (Math.random() - 0.5) * 4
        },
        gravity: 0.02,
        fade: true
      });
    }
  }
  
  createHealEffect(x, y) {
    for (let i = 0; i < 6; i++) {
      this.createParticle(x, y, {
        color: 0x44ff44,
        size: 2 + Math.random(),
        life: 1000 + Math.random() * 500,
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: -2 - Math.random() * 2
        },
        gravity: -0.01,
        fade: true
      });
    }
  }
  
  createParryEffect(x, y) {
    // Ring effect
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 20 + Math.random() * 10;
      this.createParticle(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, {
        color: 0x00ffff,
        size: 3,
        life: 400,
        velocity: {
          x: Math.cos(angle) * 0.5,
          y: Math.sin(angle) * 0.5
        },
        fade: true
      });
    }
    
    // Center burst
    this.createExplosion(x, y, 0x00ffff, 6);
  }
  
  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update physics
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += particle.gravity;
      
      // Update life
      particle.life -= dt;
      
      if (particle.fade) {
        particle.alpha = particle.life / particle.maxLife;
      }
      
      // Remove dead particles
      if (particle.life <= 0) {
        this.container.removeChild(particle);
        this.particles.splice(i, 1);
      }
    }
  }
}

export class ScreenEffects {
  constructor(app) {
    this.app = app;
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.originalX = 0;
    this.originalY = 0;
  }
  
  screenShake(intensity = 10, duration = 200) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }
  
  update(dt) {
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      const shake = this.shakeIntensity * (this.shakeDuration / 200);
      this.app.stage.x = this.originalX + (Math.random() - 0.5) * shake;
      this.app.stage.y = this.originalY + (Math.random() - 0.5) * shake;
    } else {
      this.app.stage.x = this.originalX;
      this.app.stage.y = this.originalY;
    }
  }
}