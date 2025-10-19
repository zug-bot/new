// enemyAI.js
// Enemy AI system with attack patterns and movement

export class EnemyAI {
  constructor(enemy, hero, combatSystem) {
    this.enemy = enemy;
    this.hero = hero;
    this.combatSystem = combatSystem;
    
    // AI states
    this.state = 'idle'; // idle, pursuing, attacking, stunned, retreating
    this.stateTime = 0;
    
    // Movement
    this.moveSpeed = 1.5;
    this.attackRange = 120;
    this.retreatRange = 200;
    this.pursuitRange = 300;
    
    // Attack patterns
    this.attackPatterns = [
      { windup: 1500, parryWindow: 300, damage: 20, name: 'quick_strike' },
      { windup: 2500, parryWindow: 400, damage: 30, name: 'heavy_strike' },
      { windup: 1000, parryWindow: 200, damage: 15, name: 'combo_start' }
    ];
    this.currentPattern = 0;
    this.comboCount = 0;
    this.maxCombo = 3;
    
    // Behavior
    this.aggression = 0.7; // 0-1, how aggressive the enemy is
    this.patience = 2000; // How long to wait before changing tactics
    this.lastAttackTime = 0;
    this.attackCooldown = 1000;
    
    // Movement patterns
    this.circleRadius = 80;
    this.circleAngle = 0;
    this.strafeDirection = 1;
  }
  
  update(dt) {
    this.stateTime += dt;
    this.lastAttackTime += dt;
    
    const distance = this.getDistanceToHero();
    
    // State machine
    switch (this.state) {
      case 'idle':
        this.updateIdle(dt, distance);
        break;
      case 'pursuing':
        this.updatePursuing(dt, distance);
        break;
      case 'attacking':
        this.updateAttacking(dt, distance);
        break;
      case 'stunned':
        this.updateStunned(dt, distance);
        break;
      case 'retreating':
        this.updateRetreating(dt, distance);
        break;
    }
  }
  
  getDistanceToHero() {
    const dx = this.hero.x - this.enemy.x;
    const dy = this.hero.y - this.enemy.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  getAngleToHero() {
    const dx = this.hero.x - this.enemy.x;
    const dy = this.hero.y - this.enemy.y;
    return Math.atan2(dy, dx);
  }
  
  updateIdle(dt, distance) {
    if (distance < this.pursuitRange) {
      this.setState('pursuing');
    } else {
      // Random movement when idle
      if (this.stateTime > 2000) {
        this.randomMovement();
        this.stateTime = 0;
      }
    }
  }
  
  updatePursuing(dt, distance) {
    if (distance > this.pursuitRange) {
      this.setState('idle');
      return;
    }
    
    if (distance < this.attackRange && this.lastAttackTime > this.attackCooldown) {
      this.setState('attacking');
      return;
    }
    
    // Move towards hero
    this.moveTowardsHero();
    
    // Occasionally strafe
    if (Math.random() < 0.01) {
      this.strafeDirection *= -1;
    }
    
    // Add some strafing movement
    const angle = this.getAngleToHero() + (this.strafeDirection * Math.PI / 4);
    const strafeX = Math.cos(angle) * this.moveSpeed * 0.3;
    const strafeY = Math.sin(angle) * this.moveSpeed * 0.3;
    
    this.enemy.moveTo(
      this.enemy.x + strafeX,
      this.enemy.y + strafeY
    );
  }
  
  updateAttacking(dt, distance) {
    if (distance > this.attackRange * 1.5) {
      this.setState('pursuing');
      return;
    }
    
    // Choose attack pattern based on combo and aggression
    const pattern = this.chooseAttackPattern();
    
    // Execute attack
    if (this.stateTime > pattern.windup - pattern.parryWindow) {
      // Parry window is open
      this.combatSystem.parryActive = true;
    }
    
    if (this.stateTime > pattern.windup) {
      // Attack executes
      this.executeAttack(pattern);
      this.setState('pursuing');
    }
  }
  
  updateStunned(dt, distance) {
    // Wait for stun to end
    if (this.stateTime > 1000) {
      this.setState('pursuing');
    }
  }
  
  updateRetreating(dt, distance) {
    if (distance > this.retreatRange) {
      this.setState('pursuing');
      return;
    }
    
    // Move away from hero
    const angle = this.getAngleToHero() + Math.PI;
    const moveX = Math.cos(angle) * this.moveSpeed;
    const moveY = Math.sin(angle) * this.moveSpeed;
    
    this.enemy.moveTo(
      this.enemy.x + moveX,
      this.enemy.y + moveY
    );
  }
  
  chooseAttackPattern() {
    // Increase combo count
    this.comboCount++;
    
    // Choose pattern based on combo and aggression
    if (this.comboCount >= this.maxCombo) {
      this.comboCount = 0;
      return this.attackPatterns[1]; // Heavy strike
    }
    
    if (Math.random() < this.aggression) {
      return this.attackPatterns[0]; // Quick strike
    } else {
      return this.attackPatterns[2]; // Combo start
    }
  }
  
  executeAttack(pattern) {
    this.lastAttackTime = 0;
    this.combatSystem.enemyAttack();
    
    // Visual feedback
    this.enemy.attack();
    
    console.log(`Enemy uses ${pattern.name}!`);
  }
  
  moveTowardsHero() {
    const angle = this.getAngleToHero();
    const moveX = Math.cos(angle) * this.moveSpeed;
    const moveY = Math.sin(angle) * this.moveSpeed;
    
    this.enemy.moveTo(
      this.enemy.x + moveX,
      this.enemy.y + moveY
    );
  }
  
  randomMovement() {
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 100;
    const moveX = Math.cos(angle) * distance;
    const moveY = Math.sin(angle) * distance;
    
    this.enemy.moveTo(
      this.enemy.x + moveX,
      this.enemy.y + moveY
    );
  }
  
  setState(newState) {
    if (this.state !== newState) {
      this.state = newState;
      this.stateTime = 0;
      
      // State-specific setup
      switch (newState) {
        case 'attacking':
          this.enemy.setState('attacking');
          break;
        case 'stunned':
          this.enemy.stun();
          break;
        case 'pursuing':
          this.enemy.setState('moving');
          break;
        default:
          this.enemy.setState('idle');
      }
    }
  }
  
  // Called when enemy takes damage or is parried
  onHit() {
    this.comboCount = 0;
    this.aggression = Math.min(1.0, this.aggression + 0.1);
    
    if (Math.random() < 0.3) {
      this.setState('retreating');
    }
  }
  
  onParried() {
    this.comboCount = 0;
    this.aggression = Math.max(0.3, this.aggression - 0.2);
    this.setState('stunned');
  }
}