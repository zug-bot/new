// combat.js
// Sekiro-inspired parry/deflect combat system with posture mechanics

import * as PIXI from 'pixi.js';
import { audioSystem } from './audioSystem.js';

export class CombatSystem {
  constructor({ app, hero, enemy }) {
    this.app = app;
    this.hero = hero;
    this.enemy = enemy;
    
    // Player stats
    this.player = {
      health: 100,
      maxHealth: 100,
      posture: 0,
      maxPosture: 100,
      isBlocking: false,
      isParrying: false,
      attackCooldown: 0,
      damageCooldown: 0,
      parryWindow: 300, // ms
      parryTiming: 0
    };
    
    // Enemy stats
    this.enemyData = {
      health: 80,
      maxHealth: 80,
      posture: 0,
      maxPosture: 80,
      attackPattern: ['high', 'low', 'thrust', 'high', 'sweep'],
      currentAttackIndex: 0,
      attackCooldown: 0,
      attackWindup: 800,
      isAttacking: false,
      attackIndicator: null
    };
    
    // Combat UI
    this.ui = this.createCombatUI();
    
    // Input handling
    this.setupInputHandlers();
    
    // Combat ticker
    this.setupCombatLoop();
  }
  
  createCombatUI() {
    const ui = new PIXI.Container();
    
    // Player health bar
    const playerHealthBg = new PIXI.Graphics();
    playerHealthBg.beginFill(0x333333);
    playerHealthBg.drawRect(20, 20, 200, 20);
    playerHealthBg.endFill();
    
    const playerHealthBar = new PIXI.Graphics();
    playerHealthBar.beginFill(0x00ff00);
    playerHealthBar.drawRect(20, 20, 200, 20);
    playerHealthBar.endFill();
    
    // Player posture bar
    const playerPostureBg = new PIXI.Graphics();
    playerPostureBg.beginFill(0x333333);
    playerPostureBg.drawRect(20, 45, 200, 15);
    playerPostureBg.endFill();
    
    const playerPostureBar = new PIXI.Graphics();
    playerPostureBar.beginFill(0xffaa00);
    playerPostureBar.drawRect(20, 45, 0, 15);
    playerPostureBar.endFill();
    
    // Enemy health bar
    const enemyHealthBg = new PIXI.Graphics();
    enemyHealthBg.beginFill(0x333333);
    enemyHealthBg.drawRect(this.app.renderer.width - 220, 20, 200, 20);
    enemyHealthBg.endFill();
    
    const enemyHealthBar = new PIXI.Graphics();
    enemyHealthBar.beginFill(0xff0000);
    enemyHealthBar.drawRect(this.app.renderer.width - 220, 20, 200, 20);
    enemyHealthBar.endFill();
    
    // Enemy posture bar
    const enemyPostureBg = new PIXI.Graphics();
    enemyPostureBg.beginFill(0x333333);
    enemyPostureBg.drawRect(this.app.renderer.width - 220, 45, 200, 15);
    enemyPostureBg.endFill();
    
    const enemyPostureBar = new PIXI.Graphics();
    enemyPostureBar.beginFill(0xffaa00);
    enemyPostureBar.drawRect(this.app.renderer.width - 220, 45, 0, 15);
    enemyPostureBar.endFill();
    
    // Attack indicator (red kanji-like symbol that appears before enemy attacks)
    const attackIndicator = new PIXI.Text('危', {
      fontFamily: 'Arial',
      fontSize: 48,
      fill: 0xff0000,
      dropShadow: true,
      dropShadowDistance: 2
    });
    attackIndicator.anchor.set(0.5);
    attackIndicator.visible = false;
    
    ui.addChild(playerHealthBg, playerHealthBar, playerPostureBg, playerPostureBar);
    ui.addChild(enemyHealthBg, enemyHealthBar, enemyPostureBg, enemyPostureBar);
    ui.addChild(attackIndicator);
    
    this.app.stage.addChild(ui);
    
    return {
      container: ui,
      playerHealthBar,
      playerPostureBar,
      enemyHealthBar,
      enemyPostureBar,
      attackIndicator
    };
  }
  
  setupInputHandlers() {
    this.keys = new Set();
    
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      
      // Attack
      if (e.code === 'KeyJ' && this.player.attackCooldown <= 0) {
        this.playerAttack();
      }
      
      // Block/Parry
      if (e.code === 'KeyK') {
        this.player.isBlocking = true;
        this.player.isParrying = true;
        this.player.parryTiming = this.player.parryWindow;
      }
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
      
      if (e.code === 'KeyK') {
        this.player.isBlocking = false;
        this.player.isParrying = false;
      }
    });
  }
  
  playerAttack() {
    if (this.player.attackCooldown > 0) return;
    
    this.player.attackCooldown = 500; // ms
    audioSystem.play('attack');
    
    // Simple attack animation
    const originalX = this.hero.x;
    const attackDir = this.hero.x < this.enemy.x ? 1 : -1;
    this.hero.x += attackDir * 30;
    
    // Check if hit enemy
    const distance = Math.abs(this.hero.x - this.enemy.x) + Math.abs(this.hero.y - this.enemy.y);
    if (distance < 100) {
      audioSystem.play('hit');
      // Deal damage or posture damage
      if (this.enemyData.isAttacking) {
        // Counter hit - more posture damage
        this.enemyData.posture += 40;
      } else {
        this.enemyData.health -= 10;
        this.enemyData.posture += 20;
      }
      
      // Knockback
      this.enemy.x += attackDir * 20;
      setTimeout(() => {
        this.enemy.x -= attackDir * 20;
      }, 200);
    }
    
    setTimeout(() => {
      this.hero.x = originalX;
    }, 200);
  }
  
  enemyAttack() {
    if (this.enemyData.attackCooldown > 0) return;
    
    const attackType = this.enemyData.attackPattern[this.enemyData.currentAttackIndex];
    this.enemyData.currentAttackIndex = (this.enemyData.currentAttackIndex + 1) % this.enemyData.attackPattern.length;
    
    // Show attack indicator
    this.ui.attackIndicator.visible = true;
    this.ui.attackIndicator.x = this.enemy.x;
    this.ui.attackIndicator.y = this.enemy.y - 80;
    
    // Windup
    this.enemyData.isAttacking = true;
    this.enemyData.attackCooldown = 2000;
    
    setTimeout(() => {
      this.ui.attackIndicator.visible = false;
      
      // Attack animation
      const originalX = this.enemy.x;
      const attackDir = this.enemy.x < this.hero.x ? 1 : -1;
      this.enemy.x += attackDir * 40;
      
      // Check if hit player
      const distance = Math.abs(this.hero.x - this.enemy.x) + Math.abs(this.hero.y - this.enemy.y);
      if (distance < 100) {
        if (this.player.isParrying && this.player.parryTiming > 0) {
          // Perfect parry!
          this.onPerfectParry();
        } else if (this.player.isBlocking) {
          // Regular block - take posture damage
          audioSystem.play('block');
          this.player.posture += 30;
        } else {
          // Direct hit
          audioSystem.play('hit');
          this.player.health -= 20;
          this.player.damageCooldown = 300;
        }
      }
      
      setTimeout(() => {
        this.enemy.x = originalX;
        this.enemyData.isAttacking = false;
      }, 300);
    }, this.enemyData.attackWindup);
  }
  
  onPerfectParry() {
    audioSystem.play('parry');
    
    // Flash effect
    const flash = new PIXI.Graphics();
    flash.beginFill(0xffffff, 0.8);
    flash.drawRect(0, 0, this.app.renderer.width, this.app.renderer.height);
    flash.endFill();
    this.app.stage.addChild(flash);
    
    setTimeout(() => {
      this.app.stage.removeChild(flash);
    }, 100);
    
    // Enemy takes massive posture damage
    this.enemyData.posture += 60;
    
    // Stun enemy briefly
    this.enemyData.attackCooldown += 1000;
    
    // Screen shake effect
    const originalX = this.app.stage.x;
    const originalY = this.app.stage.y;
    let shakeTime = 0;
    const shakeTicker = (delta) => {
      shakeTime += delta.deltaMS;
      if (shakeTime < 200) {
        this.app.stage.x = originalX + (Math.random() - 0.5) * 10;
        this.app.stage.y = originalY + (Math.random() - 0.5) * 10;
      } else {
        this.app.stage.x = originalX;
        this.app.stage.y = originalY;
        this.app.ticker.remove(shakeTicker);
      }
    };
    this.app.ticker.add(shakeTicker);
  }
  
  checkPostureBreak() {
    // Player posture break
    if (this.player.posture >= this.player.maxPosture) {
      this.player.posture = this.player.maxPosture;
      // Stun player
      this.player.attackCooldown = 2000;
      // Visual effect
      this.hero.tint = 0xff0000;
      setTimeout(() => {
        this.hero.tint = 0xffffff;
      }, 500);
    }
    
    // Enemy posture break - instant kill opportunity
    if (this.enemyData.posture >= this.enemyData.maxPosture) {
      this.enemyData.posture = this.enemyData.maxPosture;
      // Enemy is stunned and vulnerable
      this.enemy.tint = 0x666666;
      this.enemyData.attackCooldown = 3000;
      
      // Show execution prompt
      const executionPrompt = new PIXI.Text('Press J to Execute!', {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xffff00,
        dropShadow: true
      });
      executionPrompt.anchor.set(0.5);
      executionPrompt.x = this.enemy.x;
      executionPrompt.y = this.enemy.y - 100;
      this.app.stage.addChild(executionPrompt);
      
      setTimeout(() => {
        this.app.stage.removeChild(executionPrompt);
        this.enemy.tint = 0xffffff;
        this.enemyData.posture = 0;
      }, 3000);
    }
  }
  
  updateUI() {
    // Update health bars
    this.ui.playerHealthBar.clear();
    this.ui.playerHealthBar.beginFill(0x00ff00);
    this.ui.playerHealthBar.drawRect(20, 20, 200 * (this.player.health / this.player.maxHealth), 20);
    this.ui.playerHealthBar.endFill();
    
    this.ui.enemyHealthBar.clear();
    this.ui.enemyHealthBar.beginFill(0xff0000);
    this.ui.enemyHealthBar.drawRect(
      this.app.renderer.width - 220, 
      20, 
      200 * (this.enemyData.health / this.enemyData.maxHealth), 
      20
    );
    this.ui.enemyHealthBar.endFill();
    
    // Update posture bars
    this.ui.playerPostureBar.clear();
    this.ui.playerPostureBar.beginFill(0xffaa00);
    this.ui.playerPostureBar.drawRect(20, 45, 200 * (this.player.posture / this.player.maxPosture), 15);
    this.ui.playerPostureBar.endFill();
    
    this.ui.enemyPostureBar.clear();
    this.ui.enemyPostureBar.beginFill(0xffaa00);
    this.ui.enemyPostureBar.drawRect(
      this.app.renderer.width - 220, 
      45, 
      200 * (this.enemyData.posture / this.enemyData.maxPosture), 
      15
    );
    this.ui.enemyPostureBar.endFill();
  }
  
  setupCombatLoop() {
    this.app.ticker.add((delta) => {
      const dt = delta.deltaMS;
      
      // Update cooldowns
      if (this.player.attackCooldown > 0) this.player.attackCooldown -= dt;
      if (this.player.damageCooldown > 0) this.player.damageCooldown -= dt;
      if (this.player.parryTiming > 0) this.player.parryTiming -= dt;
      if (this.enemyData.attackCooldown > 0) this.enemyData.attackCooldown -= dt;
      
      // Posture recovery when not in combat
      if (this.player.posture > 0 && !this.player.isBlocking) {
        this.player.posture -= dt * 0.02;
        if (this.player.posture < 0) this.player.posture = 0;
      }
      if (this.enemyData.posture > 0 && !this.enemyData.isAttacking) {
        this.enemyData.posture -= dt * 0.015;
        if (this.enemyData.posture < 0) this.enemyData.posture = 0;
      }
      
      // Enemy AI - simple distance check
      const distance = Math.abs(this.hero.x - this.enemy.x) + Math.abs(this.hero.y - this.enemy.y);
      if (distance < 150 && this.enemyData.attackCooldown <= 0) {
        this.enemyAttack();
      }
      
      // Check for posture breaks
      this.checkPostureBreak();
      
      // Update UI
      this.updateUI();
      
      // Check win/lose conditions
      if (this.player.health <= 0) {
        // Game over
        audioSystem.play('death');
        const gameOver = new PIXI.Text('DEATH', {
          fontFamily: 'Arial',
          fontSize: 72,
          fill: 0xff0000,
          dropShadow: true,
          dropShadowDistance: 4
        });
        gameOver.anchor.set(0.5);
        gameOver.x = this.app.renderer.width / 2;
        gameOver.y = this.app.renderer.height / 2;
        this.app.stage.addChild(gameOver);
        this.app.ticker.stop();
      }
      
      if (this.enemyData.health <= 0) {
        // Victory
        audioSystem.play('victory');
        const victory = new PIXI.Text('ENEMY FELLED', {
          fontFamily: 'Arial',
          fontSize: 48,
          fill: 0xffff00,
          dropShadow: true,
          dropShadowDistance: 4
        });
        victory.anchor.set(0.5);
        victory.x = this.app.renderer.width / 2;
        victory.y = this.app.renderer.height / 2;
        this.app.stage.addChild(victory);
        this.enemy.visible = false;
      }
    });
  }
}

export function setupParrySystem({ app, hero, enemy }) {
  return new CombatSystem({ app, hero, enemy });
}