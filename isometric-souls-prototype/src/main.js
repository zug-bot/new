// main.js
// Entry point: boot renderer, then enable enhanced combat system

import * as PIXI from 'pixi.js'
import { createRenderer } from './renderer.js'
import { setupParrySystem } from './combat.js'
import { PerformanceOptimizer, MemoryManager } from './performance.js'

async function boot() {
  const scene = await createRenderer()
  const combatSystem = setupParrySystem(scene)
  
  // Add performance monitoring
  const performanceOptimizer = new PerformanceOptimizer(scene.app)
  const memoryManager = new MemoryManager()
  
  // Add performance monitoring to ticker
  scene.app.ticker.add(() => {
    performanceOptimizer.update()
  })
  
  // Add some visual polish
  addParticleEffects(scene)
  addScreenEffects(scene)
  
  console.log('Enhanced Isometric Souls Prototype loaded!')
  console.log('Controls:')
  console.log('- WASD/Arrow Keys: Move')
  console.log('- Space: Parry')
  console.log('- J: Attack')
  console.log('- Gamepad supported!')
}

function addParticleEffects(scene) {
  // Add floating particles for atmosphere
  const { app, particles } = scene;
  
  for (let i = 0; i < 20; i++) {
    const particle = new PIXI.Graphics();
    particle.beginFill(0x88aaff, 0.3);
    particle.drawCircle(0, 0, Math.random() * 3 + 1);
    particle.endFill();
    
    particle.x = Math.random() * app.renderer.width;
    particle.y = Math.random() * app.renderer.height;
    
    particles.addChild(particle);
    
    // Animate particles
    app.ticker.add(() => {
      particle.y -= 0.5;
      particle.x += Math.sin(app.ticker.lastTime * 0.001 + i) * 0.5;
      particle.alpha = 0.3 + Math.sin(app.ticker.lastTime * 0.002 + i) * 0.2;
      
      if (particle.y < -10) {
        particle.y = app.renderer.height + 10;
        particle.x = Math.random() * app.renderer.width;
      }
    });
  }
}

function addScreenEffects(scene) {
  // Add screen border effect
  const { app } = scene;
  
  const border = new PIXI.Graphics();
  border.lineStyle(2, 0x444444, 0.5);
  border.drawRect(2, 2, app.renderer.width - 4, app.renderer.height - 4);
  app.stage.addChild(border);
}

boot()
