// combat.js
// Enhanced combat system with health, posture, and improved parry mechanics

import * as PIXI from 'pixi.js'
import { ParticleSystem, ScreenEffects } from './particles.js'
import { EnemyAI } from './enemyAI.js'
import { UISystem } from './ui.js'

export class CombatSystem {
  constructor({ app, hero, enemy, particles, lightContainer, controlSystem }) {
    this.app = app;
    this.hero = hero;
    this.enemy = enemy;
    this.particles = particles;
    this.lightContainer = lightContainer;
    this.controlSystem = controlSystem;
    
    // Health system
    this.heroHealth = 100;
    this.heroMaxHealth = 100;
    this.enemyHealth = 80;
    this.enemyMaxHealth = 80;
    
    // Posture system (Sekiro-inspired)
    this.heroPosture = 0;
    this.heroMaxPosture = 100;
    this.enemyPosture = 0;
    this.enemyMaxPosture = 100;
    
    // Combat timing
    this.enemyWindup = 2000; // ms between attacks
    this.timeSinceAttack = 0;
    this.parryWindow = 300;  // ms window where Space counts as parry
    this.parryActive = false;
    this.attackWindup = 1000; // Enemy windup animation time
    
    // Visual feedback
    this.parrySuccessFlash = 0;
    this.damageFlash = 0;
    this.screenShake = 0;
    this.parryIndicator = null;
    this.healthBars = null;
    
    // Combat state
    this.heroAttacking = false;
    this.enemyAttacking = false;
    this.enemyStunned = false;
    this.stunDuration = 0;
    
    // Visual effects
    this.screenEffects = new ScreenEffects(app);
    this.particleSystem = new ParticleSystem(particles);
    
    // UI system
    this.ui = new UISystem(app);
    
    // Enemy AI
    this.enemyAI = new EnemyAI(enemy, hero, this);
    
    this.setupUI();
    this.setupControls();
    this.setupTicker();
  }
  
  setupUI() {
    // Create parry indicator
    this.parryIndicator = new PIXI.Graphics();
    this.parryIndicator.beginFill(0x00ff00, 0.8);
    this.parryIndicator.drawCircle(0, 0, 20);
    this.parryIndicator.endFill();
    this.parryIndicator.visible = false;
    this.app.stage.addChild(this.parryIndicator);
    
    // Create health bars
    this.healthBars = new PIXI.Container();
    this.app.stage.addChild(this.healthBars);
    
    // Hero health bar
    const heroHealthBg = new PIXI.Graphics();
    heroHealthBg.beginFill(0x333333);
    heroHealthBg.drawRect(20, 20, 200, 20);
    heroHealthBg.endFill();
    
    this.heroHealthBar = new PIXI.Graphics();
    this.healthBars.addChild(heroHealthBg);
    this.healthBars.addChild(this.heroHealthBar);
    
    // Enemy health bar
    const enemyHealthBg = new PIXI.Graphics();
    enemyHealthBg.beginFill(0x333333);
    enemyHealthBg.drawRect(this.app.renderer.width - 220, 20, 200, 20);
    enemyHealthBg.endFill();
    
    this.enemyHealthBar = new PIXI.Graphics();
    this.healthBars.addChild(enemyHealthBg);
    this.healthBars.addChild(this.enemyHealthBar);
    
    this.updateHealthBars();
  }
  
  updateHealthBars() {
    // Hero health bar
    this.heroHealthBar.clear();
    this.heroHealthBar.beginFill(0xff0000);
    this.heroHealthBar.drawRect(20, 20, (this.heroHealth / this.heroMaxHealth) * 200, 20);
    this.heroHealthBar.endFill();
    
    // Enemy health bar
    this.enemyHealthBar.clear();
    this.enemyHealthBar.beginFill(0xff0000);
    this.enemyHealthBar.drawRect(this.app.renderer.width - 220, 20, (this.enemyHealth / this.enemyMaxHealth) * 200, 20);
    this.enemyHealthBar.endFill();
  }
  
  setupControls() {
    // Controls are now handled by the ControlSystem
    // We'll check for input in the update loop instead
  }
  
  attemptParry() {
    if (this.parryActive) {
      this.parrySuccess();
    } else {
      this.parryMiss();
    }
  }
  
  parrySuccess() {
    this.parrySuccessFlash = 300;
    this.screenEffects.screenShake(15, 300);
    this.enemyStunned = true;
    this.stunDuration = 1000;
    this.enemyPosture += 30;
    
    // Visual feedback
    this.ui.showParryIndicator(this.hero.x, this.hero.y - 50);
    this.ui.addCombatMessage('PARRY SUCCESS!');
    
    // Particle effects
    this.particleSystem.createParryEffect(this.hero.x, this.hero.y - 30);
    this.particleSystem.createSparks(this.enemy.x, this.enemy.y);
    
    // Character animations
    this.hero.parry();
    this.enemy.stun();
    
    // Notify AI
    this.enemyAI.onParried();
    
    console.log('PARRY! Enemy posture:', this.enemyPosture);
  }
  
  parryMiss() {
    this.damageFlash = 200;
    console.log('Missed parry');
  }
  
  heroAttack() {
    if (this.heroAttacking) return;
    
    this.heroAttacking = true;
    this.enemyPosture += 20;
    
    // Character animation
    this.hero.attack();
    
    // Particle effects
    this.particleSystem.createSparks(this.enemy.x, this.enemy.y);
    
    // Notify AI
    this.enemyAI.onHit();
    
    setTimeout(() => {
      this.heroAttacking = false;
    }, 500);
    
    console.log('Hero attacks! Enemy posture:', this.enemyPosture);
  }
  
  setupTicker() {
    this.app.ticker.add((frame) => {
      const dt = frame.deltaMS;
      this.update(dt);
    });
  }
  
  update(dt) {
    this.timeSinceAttack += dt;
    
    // Update stun
    if (this.enemyStunned) {
      this.stunDuration -= dt;
      if (this.stunDuration <= 0) {
        this.enemyStunned = false;
      }
    }
    
    // Enemy attack cycle
    if (!this.enemyStunned && this.timeSinceAttack > this.enemyWindup) {
      if (this.timeSinceAttack > this.enemyWindup - this.parryWindow && this.timeSinceAttack < this.enemyWindup) {
        this.parryActive = true;
        this.ui.showParryIndicator(this.enemy.x, this.enemy.y - 50);
      } else if (this.timeSinceAttack >= this.enemyWindup) {
        this.enemyAttack();
        this.parryActive = false;
        this.ui.hideParryIndicator();
        this.timeSinceAttack = 0;
      }
    }
    
    // Posture recovery
    this.heroPosture = Math.max(0, this.heroPosture - dt * 0.02);
    this.enemyPosture = Math.max(0, this.enemyPosture - dt * 0.01);
    
    // Check for posture break
    if (this.enemyPosture >= this.enemyMaxPosture) {
      this.enemyStunned = true;
      this.stunDuration = 2000;
      this.enemyPosture = 0;
      console.log('Enemy posture broken!');
    }
    
    // Check for input
    if (this.controlSystem.isParryJustPressed()) {
      this.attemptParry();
    }
    if (this.controlSystem.isAttackJustPressed()) {
      this.heroAttack();
    }
    
    // Update enemy AI
    this.enemyAI.update(dt);
    
    // Visual effects
    this.updateVisualEffects(dt);
    this.updateHealthBars();
    this.particleSystem.update(dt);
    this.ui.update(dt);
    
    // Update UI with current values
    this.ui.updateHealth(this.heroHealth, this.heroMaxHealth, this.enemyHealth, this.enemyMaxHealth);
    this.ui.updatePosture(this.heroPosture, this.heroMaxPosture, this.enemyPosture, this.enemyMaxPosture);
    this.ui.updateMinimap(this.hero.x, this.hero.y, this.enemy.x, this.enemy.y);
  }
  
  enemyAttack() {
    if (this.parryActive) return; // Attack was parried
    
    // Deal damage
    this.heroHealth -= 20;
    this.heroPosture += 25;
    this.damageFlash = 300;
    this.screenEffects.screenShake(10, 200);
    
    // Visual effects
    this.particleSystem.createExplosion(this.hero.x, this.hero.y, 0xff4444);
    this.hero.setState('stunned');
    
    console.log('Enemy attacks! Hero health:', this.heroHealth);
  }
  
  updateVisualEffects(dt) {
    // Parry success flash
    if (this.parrySuccessFlash > 0) {
      this.parrySuccessFlash -= dt;
      const f = Math.max(0, this.parrySuccessFlash / 300);
      this.app.renderer.background.color = (0x102238 + Math.floor(0x2000 * f));
    }
    // Damage flash
    else if (this.damageFlash > 0) {
      this.damageFlash -= dt;
      const f = Math.max(0, this.damageFlash / 300);
      this.app.renderer.background.color = (0x220000 + Math.floor(0x2000 * f));
    }
    // Update screen effects
    this.screenEffects.update(dt);
    
    // Normal background
    if (this.parrySuccessFlash <= 0 && this.damageFlash <= 0) {
      this.app.renderer.background.color = 0x0e1220;
    }
    
    // Hide parry indicator after window closes
    if (!this.parryActive) {
      this.ui.hideParryIndicator();
    }
  }
  
  destroy() {
    window.removeEventListener('keydown', this.handleKeyPress);
    window.removeEventListener('keyup', this.handleKeyPress);
  }
}

export function setupParrySystem({ app, hero, enemy }) {
  return new CombatSystem({ app, hero, enemy });
}
