// ui.js
// User interface system with health bars, indicators, and HUD

import * as PIXI from 'pixi.js'

export class UISystem {
  constructor(app) {
    this.app = app;
    this.container = new PIXI.Container();
    this.elements = {};
    
    app.stage.addChild(this.container);
    this.setupUI();
  }
  
  setupUI() {
    this.createHealthBars();
    this.createPostureBars();
    this.createParryIndicator();
    this.createCombatLog();
    this.createInstructions();
    this.createMinimap();
  }
  
  createHealthBars() {
    // Hero health bar
    const heroHealthContainer = new PIXI.Container();
    heroHealthContainer.x = 20;
    heroHealthContainer.y = 20;
    
    // Background
    const heroHealthBg = new PIXI.Graphics();
    heroHealthBg.beginFill(0x333333);
    heroHealthBg.drawRect(0, 0, 200, 25);
    heroHealthBg.endFill();
    
    // Health bar
    const heroHealthBar = new PIXI.Graphics();
    
    // Label
    const heroLabel = new PIXI.Text('HERO', {
      fontSize: 12,
      fill: 0xffffff,
      fontFamily: 'Arial'
    });
    heroLabel.x = 5;
    heroLabel.y = -15;
    
    heroHealthContainer.addChild(heroHealthBg);
    heroHealthContainer.addChild(heroHealthBar);
    heroHealthContainer.addChild(heroLabel);
    
    this.container.addChild(heroHealthContainer);
    this.elements.heroHealth = { container: heroHealthContainer, bar: heroHealthBar, bg: heroHealthBg };
    
    // Enemy health bar
    const enemyHealthContainer = new PIXI.Container();
    enemyHealthContainer.x = this.app.renderer.width - 220;
    enemyHealthContainer.y = 20;
    
    // Background
    const enemyHealthBg = new PIXI.Graphics();
    enemyHealthBg.beginFill(0x333333);
    enemyHealthBg.drawRect(0, 0, 200, 25);
    enemyHealthBg.endFill();
    
    // Health bar
    const enemyHealthBar = new PIXI.Graphics();
    
    // Label
    const enemyLabel = new PIXI.Text('ENEMY', {
      fontSize: 12,
      fill: 0xffffff,
      fontFamily: 'Arial'
    });
    enemyLabel.x = 5;
    enemyLabel.y = -15;
    
    enemyHealthContainer.addChild(enemyHealthBg);
    enemyHealthContainer.addChild(enemyHealthBar);
    enemyHealthContainer.addChild(enemyLabel);
    
    this.container.addChild(enemyHealthContainer);
    this.elements.enemyHealth = { container: enemyHealthContainer, bar: enemyHealthBar, bg: enemyHealthBg };
  }
  
  createPostureBars() {
    // Hero posture bar
    const heroPostureContainer = new PIXI.Container();
    heroPostureContainer.x = 20;
    heroPostureContainer.y = 60;
    
    // Background
    const heroPostureBg = new PIXI.Graphics();
    heroPostureBg.beginFill(0x333333);
    heroPostureBg.drawRect(0, 0, 200, 15);
    heroPostureBg.endFill();
    
    // Posture bar
    const heroPostureBar = new PIXI.Graphics();
    
    // Label
    const heroPostureLabel = new PIXI.Text('POSTURE', {
      fontSize: 10,
      fill: 0xffffff,
      fontFamily: 'Arial'
    });
    heroPostureLabel.x = 5;
    heroPostureLabel.y = -12;
    
    heroPostureContainer.addChild(heroPostureBg);
    heroPostureContainer.addChild(heroPostureBar);
    heroPostureContainer.addChild(heroPostureLabel);
    
    this.container.addChild(heroPostureContainer);
    this.elements.heroPosture = { container: heroPostureContainer, bar: heroPostureBar, bg: heroPostureBg };
    
    // Enemy posture bar
    const enemyPostureContainer = new PIXI.Container();
    enemyPostureContainer.x = this.app.renderer.width - 220;
    enemyPostureContainer.y = 60;
    
    // Background
    const enemyPostureBg = new PIXI.Graphics();
    enemyPostureBg.beginFill(0x333333);
    enemyPostureBg.drawRect(0, 0, 200, 15);
    enemyPostureBg.endFill();
    
    // Posture bar
    const enemyPostureBar = new PIXI.Graphics();
    
    // Label
    const enemyPostureLabel = new PIXI.Text('POSTURE', {
      fontSize: 10,
      fill: 0xffffff,
      fontFamily: 'Arial'
    });
    enemyPostureLabel.x = 5;
    enemyPostureLabel.y = -12;
    
    enemyPostureContainer.addChild(enemyPostureBg);
    enemyPostureContainer.addChild(enemyPostureBar);
    enemyPostureContainer.addChild(enemyPostureLabel);
    
    this.container.addChild(enemyPostureContainer);
    this.elements.enemyPosture = { container: enemyPostureContainer, bar: enemyPostureBar, bg: enemyPostureBg };
  }
  
  createParryIndicator() {
    const parryContainer = new PIXI.Container();
    parryContainer.x = this.app.renderer.width * 0.5;
    parryContainer.y = this.app.renderer.height * 0.3;
    
    // Parry ring
    const parryRing = new PIXI.Graphics();
    parryRing.lineStyle(3, 0x00ffff, 0.8);
    parryRing.drawCircle(0, 0, 30);
    parryRing.visible = false;
    
    // Parry text
    const parryText = new PIXI.Text('PARRY!', {
      fontSize: 24,
      fill: 0x00ffff,
      fontFamily: 'Arial',
      fontWeight: 'bold'
    });
    parryText.anchor.set(0.5);
    parryText.y = 40;
    parryText.visible = false;
    
    parryContainer.addChild(parryRing);
    parryContainer.addChild(parryText);
    
    this.container.addChild(parryContainer);
    this.elements.parryIndicator = { container: parryContainer, ring: parryRing, text: parryText };
  }
  
  createCombatLog() {
    const logContainer = new PIXI.Container();
    logContainer.x = 20;
    logContainer.y = this.app.renderer.height - 120;
    
    const logBg = new PIXI.Graphics();
    logBg.beginFill(0x000000, 0.7);
    logBg.drawRect(0, 0, 300, 100);
    logBg.endFill();
    
    const logText = new PIXI.Text('', {
      fontSize: 12,
      fill: 0xffffff,
      fontFamily: 'Arial',
      wordWrap: true,
      wordWrapWidth: 280
    });
    logText.x = 10;
    logText.y = 10;
    
    logContainer.addChild(logBg);
    logContainer.addChild(logText);
    
    this.container.addChild(logContainer);
    this.elements.combatLog = { container: logContainer, text: logText, messages: [] };
  }
  
  createInstructions() {
    const instructionsContainer = new PIXI.Container();
    instructionsContainer.x = this.app.renderer.width - 200;
    instructionsContainer.y = this.app.renderer.height - 100;
    
    const instructionsText = new PIXI.Text(
      'CONTROLS:\n' +
      'WASD/Arrows: Move\n' +
      'Space: Parry\n' +
      'J: Attack\n' +
      'Mouse: Look around',
      {
        fontSize: 12,
        fill: 0xcccccc,
        fontFamily: 'Arial',
        align: 'right'
      }
    );
    
    instructionsContainer.addChild(instructionsText);
    this.container.addChild(instructionsContainer);
    this.elements.instructions = instructionsContainer;
  }
  
  createMinimap() {
    const minimapContainer = new PIXI.Container();
    minimapContainer.x = this.app.renderer.width - 120;
    minimapContainer.y = 100;
    
    // Background
    const minimapBg = new PIXI.Graphics();
    minimapBg.beginFill(0x000000, 0.8);
    minimapBg.drawRect(0, 0, 100, 100);
    minimapBg.endFill();
    
    // Border
    const minimapBorder = new PIXI.Graphics();
    minimapBorder.lineStyle(2, 0x666666);
    minimapBorder.drawRect(0, 0, 100, 100);
    
    // Hero dot
    const heroDot = new PIXI.Graphics();
    heroDot.beginFill(0x00ff00);
    heroDot.drawCircle(50, 50, 3);
    heroDot.endFill();
    
    // Enemy dot
    const enemyDot = new PIXI.Graphics();
    enemyDot.beginFill(0xff0000);
    enemyDot.drawCircle(50, 50, 3);
    enemyDot.endFill();
    
    minimapContainer.addChild(minimapBg);
    minimapContainer.addChild(minimapBorder);
    minimapContainer.addChild(heroDot);
    minimapContainer.addChild(enemyDot);
    
    this.container.addChild(minimapContainer);
    this.elements.minimap = { 
      container: minimapContainer, 
      heroDot, 
      enemyDot 
    };
  }
  
  updateHealth(heroHealth, heroMaxHealth, enemyHealth, enemyMaxHealth) {
    // Update hero health
    const heroHealthPercent = heroHealth / heroMaxHealth;
    this.elements.heroHealth.bar.clear();
    this.elements.heroHealth.bar.beginFill(0xff0000);
    this.elements.heroHealth.bar.drawRect(0, 0, heroHealthPercent * 200, 25);
    this.elements.heroHealth.bar.endFill();
    
    // Update enemy health
    const enemyHealthPercent = enemyHealth / enemyMaxHealth;
    this.elements.enemyHealth.bar.clear();
    this.elements.enemyHealth.bar.beginFill(0xff0000);
    this.elements.enemyHealth.bar.drawRect(0, 0, enemyHealthPercent * 200, 25);
    this.elements.enemyHealth.bar.endFill();
  }
  
  updatePosture(heroPosture, heroMaxPosture, enemyPosture, enemyMaxPosture) {
    // Update hero posture
    const heroPosturePercent = heroPosture / heroMaxPosture;
    this.elements.heroPosture.bar.clear();
    this.elements.heroPosture.bar.beginFill(0xffff00);
    this.elements.heroPosture.bar.drawRect(0, 0, heroPosturePercent * 200, 15);
    this.elements.heroPosture.bar.endFill();
    
    // Update enemy posture
    const enemyPosturePercent = enemyPosture / enemyMaxPosture;
    this.elements.enemyPosture.bar.clear();
    this.elements.enemyPosture.bar.beginFill(0xffff00);
    this.elements.enemyPosture.bar.drawRect(0, 0, enemyPosturePercent * 200, 15);
    this.elements.enemyPosture.bar.endFill();
  }
  
  showParryIndicator(x, y) {
    this.elements.parryIndicator.container.x = x;
    this.elements.parryIndicator.container.y = y;
    this.elements.parryIndicator.ring.visible = true;
    this.elements.parryIndicator.text.visible = true;
    
    // Animate parry indicator
    this.app.ticker.add(() => {
      const t = this.app.ticker.lastTime * 0.01;
      this.elements.parryIndicator.ring.scale.set(1 + Math.sin(t) * 0.2);
      this.elements.parryIndicator.ring.alpha = 0.8 + Math.sin(t * 2) * 0.2;
    });
  }
  
  hideParryIndicator() {
    this.elements.parryIndicator.ring.visible = false;
    this.elements.parryIndicator.text.visible = false;
  }
  
  addCombatMessage(message) {
    this.elements.combatLog.messages.push(message);
    if (this.elements.combatLog.messages.length > 5) {
      this.elements.combatLog.messages.shift();
    }
    
    this.elements.combatLog.text.text = this.elements.combatLog.messages.join('\n');
  }
  
  updateMinimap(heroX, heroY, enemyX, enemyY) {
    // Convert world coordinates to minimap coordinates
    const mapScale = 0.1;
    const centerX = 50;
    const centerY = 50;
    
    // Hero position
    this.elements.minimap.heroDot.x = centerX + (heroX - this.app.renderer.width * 0.5) * mapScale;
    this.elements.minimap.heroDot.y = centerY + (heroY - this.app.renderer.height * 0.5) * mapScale;
    
    // Enemy position
    this.elements.minimap.enemyDot.x = centerX + (enemyX - this.app.renderer.width * 0.5) * mapScale;
    this.elements.minimap.enemyDot.y = centerY + (enemyY - this.app.renderer.height * 0.5) * mapScale;
  }
  
  showDamageNumber(x, y, damage, color = 0xff0000) {
    const damageText = new PIXI.Text(damage.toString(), {
      fontSize: 20,
      fill: color,
      fontFamily: 'Arial',
      fontWeight: 'bold'
    });
    damageText.anchor.set(0.5);
    damageText.x = x;
    damageText.y = y;
    
    this.container.addChild(damageText);
    
    // Animate damage number
    this.app.ticker.add(() => {
      damageText.y -= 2;
      damageText.alpha -= 0.02;
      
      if (damageText.alpha <= 0) {
        this.container.removeChild(damageText);
      }
    });
  }
  
  update(dt) {
    // Update any animated UI elements
    this.elements.combatLog.container.alpha = 0.8 + Math.sin(this.app.ticker.lastTime * 0.005) * 0.2;
  }
}