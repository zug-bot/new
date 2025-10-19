// main.js
// Entry point: boot enhanced renderer and combat system

import { createRenderer } from './renderer.js'
import { CombatSystem } from './combat.js'

async function boot() {
  try {
    // Create the enhanced renderer
    const scene = await createRenderer();
    
    // Initialize the combat system with the first enemy as target for now
    const firstEnemy = scene.enemyManager.enemies[0];
    if (firstEnemy) {
      const combat = new CombatSystem({ 
        app: scene.app, 
        hero: scene.hero, 
        enemy: firstEnemy.sprite 
      });
      
      // Connect enemy attacks to combat system
      scene.enemyManager.enemies.forEach(enemy => {
        enemy.onAttack = (attacker) => {
          // Handle enemy attack through combat system
          // This would trigger the combat system's enemy attack logic
        };
      });
    }
    
    // Add instructions overlay
    const instructions = new PIXI.Text(
      'Movement: WASD/Arrow Keys\nAttack: J\nBlock/Parry: K (hold)\nParry just before enemy attack!',
      {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xffffff,
        dropShadow: true,
        dropShadowDistance: 2
      }
    );
    instructions.x = 10;
    instructions.y = scene.app.renderer.height - 80;
    scene.uiLayer.addChild(instructions);
    
    // Add FPS counter
    const fpsText = new PIXI.Text('FPS: 0', {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0x00ff00
    });
    fpsText.x = scene.app.renderer.width - 80;
    fpsText.y = 10;
    scene.uiLayer.addChild(fpsText);
    
    // Update FPS counter
    let frameCount = 0;
    let lastFpsUpdate = Date.now();
    scene.app.ticker.add(() => {
      frameCount++;
      const now = Date.now();
      if (now - lastFpsUpdate >= 1000) {
        fpsText.text = `FPS: ${frameCount}`;
        frameCount = 0;
        lastFpsUpdate = now;
      }
    });
    
  } catch (error) {
    console.error('Failed to initialize game:', error);
    document.body.innerHTML = '<h1>Failed to load game. Please refresh.</h1>';
  }
}

boot();