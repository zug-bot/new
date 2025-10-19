// enemy.js
// Enemy AI system with different enemy types and behaviors

import * as PIXI from 'pixi.js';
import { TILE_W, TILE_H, cartToIso } from './engine.js';

export class Enemy {
  constructor(app, x, y, type = 'goblin', assets = null) {
    this.app = app;
    this.x = x;
    this.y = y;
    this.gridX = 0;
    this.gridY = 0;
    this.type = type;
    this.assets = assets;
    
    // Visual components
    this.shadow = null;
    this.sprite = null;
    
    // Stats based on enemy type
    this.stats = this.getEnemyStats(type);
    
    // AI state
    this.state = 'idle'; // idle, pursuing, attacking, stunned, dead
    this.target = null;
    this.lastStateChange = 0;
    this.moveTimer = 0;
    this.attackTimer = 0;
    
    this.createSprite();
  }
  
  getEnemyStats(type) {
    const stats = {
      goblin: {
        health: 60,
        maxHealth: 60,
        posture: 0,
        maxPosture: 60,
        speed: 1.5,
        attackRange: 80,
        aggroRange: 200,
        attackCooldown: 1500,
        attackWindup: 600,
        attackDamage: 15,
        postureDamage: 25
      },
      samurai: {
        health: 100,
        maxHealth: 100,
        posture: 0,
        maxPosture: 100,
        speed: 1.2,
        attackRange: 100,
        aggroRange: 250,
        attackCooldown: 1200,
        attackWindup: 800,
        attackDamage: 25,
        postureDamage: 35
      },
      ninja: {
        health: 40,
        maxHealth: 40,
        posture: 0,
        maxPosture: 40,
        speed: 2.5,
        attackRange: 70,
        aggroRange: 300,
        attackCooldown: 800,
        attackWindup: 400,
        attackDamage: 10,
        postureDamage: 20
      }
    };
    
    return { ...stats[type] } || stats.goblin;
  }
  
  createSprite() {
    // Shadow
    if (this.assets && this.assets.shadow) {
      this.shadow = new PIXI.Sprite(this.assets.shadow);
      this.shadow.anchor.set(0.5, 0.5);
      this.shadow.scale.set(1.2, 0.6);
      this.shadow.alpha = 0.5;
    } else {
      this.shadow = new PIXI.Graphics();
      this.shadow.beginFill(0x000000, 0.3);
      this.shadow.drawEllipse(0, 0, 30, 15);
      this.shadow.endFill();
    }
    
    // Main sprite - try to use texture first
    if (this.assets && this.assets[this.type]) {
      this.sprite = new PIXI.Sprite(this.assets[this.type]);
      this.sprite.anchor.set(0.5, 0.8);
    } else {
      // Fallback to colored rectangles
      this.sprite = new PIXI.Graphics();
      const colors = {
        goblin: 0x00aa00,
        samurai: 0xaa0000,
        ninja: 0x333333
      };
      this.sprite.beginFill(colors[this.type] || 0x00aa00);
      this.sprite.drawRect(-20, -60, 40, 60);
      this.sprite.endFill();
    }
    
    this.updatePosition();
  }
  
  updatePosition() {
    const iso = cartToIso(this.gridX, this.gridY);
    this.sprite.x = this.x + iso.x;
    this.sprite.y = this.y + iso.y;
    this.shadow.x = this.sprite.x;
    this.shadow.y = this.sprite.y + 24;
  }
  
  setTarget(target) {
    this.target = target;
  }
  
  getDistanceToTarget() {
    if (!this.target) return Infinity;
    return Math.sqrt(
      Math.pow(this.sprite.x - this.target.x, 2) + 
      Math.pow(this.sprite.y - this.target.y, 2)
    );
  }
  
  update(deltaTime) {
    if (this.state === 'dead') return;
    
    const distance = this.getDistanceToTarget();
    
    // State transitions
    switch (this.state) {
      case 'idle':
        if (distance < this.stats.aggroRange) {
          this.state = 'pursuing';
          this.lastStateChange = Date.now();
        }
        break;
        
      case 'pursuing':
        if (distance < this.stats.attackRange) {
          this.state = 'attacking';
          this.lastStateChange = Date.now();
          this.attackTimer = this.stats.attackCooldown;
        } else if (distance > this.stats.aggroRange * 1.5) {
          this.state = 'idle';
          this.lastStateChange = Date.now();
        }
        break;
        
      case 'attacking':
        if (distance > this.stats.attackRange * 1.2) {
          this.state = 'pursuing';
          this.lastStateChange = Date.now();
        }
        break;
        
      case 'stunned':
        if (Date.now() - this.lastStateChange > 2000) {
          this.state = 'idle';
        }
        break;
    }
    
    // Execute state behaviors
    this.executeBehavior(deltaTime);
    
    // Update timers
    if (this.attackTimer > 0) {
      this.attackTimer -= deltaTime;
    }
    
    // Update position
    this.updatePosition();
  }
  
  executeBehavior(deltaTime) {
    switch (this.state) {
      case 'pursuing':
        this.moveTowardsTarget(deltaTime);
        break;
        
      case 'attacking':
        if (this.attackTimer <= 0) {
          this.performAttack();
          this.attackTimer = this.stats.attackCooldown;
        }
        break;
    }
  }
  
  moveTowardsTarget(deltaTime) {
    if (!this.target) return;
    
    const dx = this.target.x - this.sprite.x;
    const dy = this.target.y - this.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > this.stats.attackRange) {
      const moveX = (dx / distance) * this.stats.speed * deltaTime * 0.1;
      const moveY = (dy / distance) * this.stats.speed * deltaTime * 0.1;
      
      this.sprite.x += moveX;
      this.sprite.y += moveY;
      
      // Update grid position (approximate)
      this.gridX += moveX / (TILE_W / 2);
      this.gridY += moveY / (TILE_H / 2);
    }
  }
  
  performAttack() {
    // This will be overridden by the combat system
    // Just provides the attack intention
    if (this.onAttack) {
      this.onAttack(this);
    }
  }
  
  takeDamage(damage, postureDamage) {
    this.stats.health -= damage;
    this.stats.posture += postureDamage;
    
    // Flash red
    this.sprite.tint = 0xff0000;
    setTimeout(() => {
      this.sprite.tint = 0xffffff;
    }, 200);
    
    if (this.stats.health <= 0) {
      this.die();
    }
    
    if (this.stats.posture >= this.stats.maxPosture) {
      this.stun();
    }
  }
  
  stun() {
    this.state = 'stunned';
    this.lastStateChange = Date.now();
    this.sprite.tint = 0x666666;
    setTimeout(() => {
      this.sprite.tint = 0xffffff;
      this.stats.posture = 0;
    }, 2000);
  }
  
  die() {
    this.state = 'dead';
    // Death animation
    const deathTween = setInterval(() => {
      this.sprite.alpha -= 0.1;
      this.shadow.alpha -= 0.1;
      if (this.sprite.alpha <= 0) {
        clearInterval(deathTween);
        this.app.stage.removeChild(this.sprite);
        this.app.stage.removeChild(this.shadow);
      }
    }, 50);
  }
}

export class EnemyManager {
  constructor(app, assets = null) {
    this.app = app;
    this.assets = assets;
    this.enemies = [];
  }
  
  spawnEnemy(x, y, type = 'goblin') {
    const enemy = new Enemy(this.app, x, y, type, this.assets);
    this.enemies.push(enemy);
    return enemy;
  }
  
  update(deltaTime) {
    this.enemies.forEach(enemy => {
      enemy.update(deltaTime);
    });
    
    // Remove dead enemies
    this.enemies = this.enemies.filter(enemy => enemy.state !== 'dead' || enemy.sprite.alpha > 0);
  }
  
  setPlayerTarget(player) {
    this.enemies.forEach(enemy => {
      enemy.setTarget(player);
    });
  }
}