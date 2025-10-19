// Main game entry point
class IsometricSoulsGame {
    constructor() {
        this.app = null;
        this.player = null;
        this.enemies = [];
        this.camera = { x: 0, y: 0, zoom: 1 };
        this.keys = {};
        this.mouse = { x: 0, y: 0, buttons: {} };
        this.gameState = 'playing';
        this.health = 100;
        this.maxHealth = 100;
        
        // Enhanced systems
        this.renderer = null;
        this.combatSystem = null;
        this.particleSystem = null;
        this.lightingSystem = null;
        
        this.init();
    }
    
    init() {
        // Initialize PIXI application
        this.app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x1a1a2e,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });
        
        document.getElementById('gameContainer').appendChild(this.app.view);
        
        // Create main game container
        this.gameContainer = new PIXI.Container();
        this.app.stage.addChild(this.gameContainer);
        
        // Create layers
        this.backgroundLayer = new PIXI.Container();
        this.terrainLayer = new PIXI.Container();
        this.entityLayer = new PIXI.Container();
        this.lightingLayer = new PIXI.Container();
        this.uiLayer = new PIXI.Container();
        
        this.gameContainer.addChild(this.backgroundLayer);
        this.gameContainer.addChild(this.terrainLayer);
        this.gameContainer.addChild(this.entityLayer);
        this.gameContainer.addChild(this.lightingLayer);
        this.gameContainer.addChild(this.uiLayer);
        
        // Initialize enhanced systems
        this.renderer = new IsometricRenderer(this.app);
        this.combatSystem = new CombatSystem(this);
        this.particleSystem = new ParticleSystem(this.app);
        this.lightingSystem = new LightingSystem(this.app);
        
        this.setupInput();
        this.createPlayer();
        this.createEnemies();
        this.createEnvironment();
        this.setupLighting();
        this.startGameLoop();
    }
    
    setupInput() {
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mouse input
        this.app.view.addEventListener('mousemove', (e) => {
            const rect = this.app.view.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        this.app.view.addEventListener('mousedown', (e) => {
            this.mouse.buttons[e.button] = true;
        });
        
        this.app.view.addEventListener('mouseup', (e) => {
            this.mouse.buttons[e.button] = false;
        });
        
        // Prevent context menu
        this.app.view.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    createPlayer() {
        this.player = new Player(0, 0, this.entityLayer);
        this.player.sprite.x = 400;
        this.player.sprite.y = 300;
    }
    
    createEnemies() {
        // Create some test enemies
        for (let i = 0; i < 3; i++) {
            const enemy = new Enemy(
                200 + i * 150, 
                200 + i * 100, 
                this.entityLayer
            );
            this.enemies.push(enemy);
        }
    }
    
    createEnvironment() {
        // Create isometric terrain
        this.createIsometricTerrain();
        
        // Add some decorative elements
        this.createDecorations();
    }
    
    createIsometricTerrain() {
        const tileSize = 64;
        const mapWidth = 20;
        const mapHeight = 15;
        
        for (let x = 0; x < mapWidth; x++) {
            for (let y = 0; y < mapHeight; y++) {
                const tile = this.createIsometricTile(x, y, tileSize);
                this.terrainLayer.addChild(tile);
            }
        }
    }
    
    createIsometricTile(x, y, size) {
        const tile = new PIXI.Graphics();
        
        // Convert grid coordinates to isometric screen coordinates
        const isoX = (x - y) * (size / 2);
        const isoY = (x + y) * (size / 4);
        
        // Create diamond-shaped tile
        tile.beginFill(0x4a4a4a);
        tile.lineStyle(1, 0x666666);
        tile.moveTo(0, size / 2);
        tile.lineTo(size / 2, 0);
        tile.lineTo(size, size / 2);
        tile.lineTo(size / 2, size);
        tile.closePath();
        tile.endFill();
        
        // Add highlight for 3D effect
        tile.beginFill(0x6a6a6a, 0.3);
        tile.moveTo(0, size / 2);
        tile.lineTo(size / 2, 0);
        tile.lineTo(size / 2, size / 2);
        tile.closePath();
        tile.endFill();
        
        tile.x = isoX;
        tile.y = isoY;
        
        return tile;
    }
    
    createDecorations() {
        // Add some trees and rocks
        for (let i = 0; i < 10; i++) {
            const decoration = this.createDecoration();
            decoration.x = Math.random() * 800 + 100;
            decoration.y = Math.random() * 600 + 100;
            this.terrainLayer.addChild(decoration);
        }
    }
    
    createDecoration() {
        const decoration = new PIXI.Graphics();
        const type = Math.random();
        
        if (type < 0.5) {
            // Tree
            decoration.beginFill(0x8B4513);
            decoration.drawRect(0, 0, 8, 20);
            decoration.endFill();
            
            decoration.beginFill(0x228B22);
            decoration.drawCircle(4, 0, 12);
            decoration.endFill();
        } else {
            // Rock
            decoration.beginFill(0x696969);
            decoration.drawCircle(0, 0, 8);
            decoration.endFill();
        }
        
        return decoration;
    }
    
    setupLighting() {
        // Create ambient lighting
        this.ambientLight = new PIXI.Graphics();
        this.ambientLight.beginFill(0x000000, 0.3);
        this.ambientLight.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
        this.ambientLight.endFill();
        this.lightingLayer.addChild(this.ambientLight);
        
        // Create dynamic lights using the lighting system
        this.lights = [];
        this.createTorchLight(300, 200);
        this.createTorchLight(500, 400);
        this.createTorchLight(200, 500);
    }
    
    createTorchLight(x, y) {
        const light = this.lightingSystem.addLight(x, y, 80, 0xFFB366, 0.6, true);
        this.lights.push(light);
    }
    
    startGameLoop() {
        this.app.ticker.add(() => {
            this.update();
            this.render();
        });
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Update player
        this.player.update(this.keys, this.mouse);
        
        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(this.player);
        });
        
        // Update camera to follow player
        this.updateCamera();
        
        // Update enhanced systems
        this.combatSystem.update();
        this.particleSystem.update();
        this.lightingSystem.update();
        
        // Update lighting
        this.updateLighting();
        
        // Update UI
        this.updateUI();
    }
    
    updateCamera() {
        const targetX = this.player.sprite.x - this.app.screen.width / 2;
        const targetY = this.player.sprite.y - this.app.screen.height / 2;
        
        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.y += (targetY - this.camera.y) * 0.1;
        
        this.gameContainer.x = -this.camera.x;
        this.gameContainer.y = -this.camera.y;
    }
    
    updateLighting() {
        // Lighting is now handled by the lighting system
        // Additional lighting effects can be added here
    }
    
    updateUI() {
        document.getElementById('healthValue').textContent = this.health;
        document.getElementById('enemyCount').textContent = this.enemies.length;
        
        const healthPercent = (this.health / this.maxHealth) * 100;
        document.getElementById('healthFill').style.width = healthPercent + '%';
    }
    
    render() {
        // Additional rendering logic can go here
    }
}

// Player class
class Player {
    constructor(x, y, container) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.speed = 3;
        this.health = 100;
        this.maxHealth = 100;
        this.isAttacking = false;
        this.isParrying = false;
        this.parryWindow = 0;
        this.dodgeCooldown = 0;
        
        this.createSprite(container);
    }
    
    createSprite(container) {
        this.sprite = new PIXI.Graphics();
        
        // Create isometric character sprite
        this.sprite.beginFill(0x4169E1);
        this.sprite.drawRect(-8, -16, 16, 32);
        this.sprite.endFill();
        
        // Add head
        this.sprite.beginFill(0xFFDBB5);
        this.sprite.drawCircle(0, -20, 6);
        this.sprite.endFill();
        
        // Add weapon
        this.sprite.beginFill(0xC0C0C0);
        this.sprite.drawRect(8, -8, 20, 4);
        this.sprite.endFill();
        
        // Add shadow
        this.shadow = new PIXI.Graphics();
        this.shadow.beginFill(0x000000, 0.3);
        this.shadow.drawEllipse(0, 8, 12, 6);
        this.shadow.endFill();
        
        container.addChild(this.shadow);
        container.addChild(this.sprite);
    }
    
    update(keys, mouse) {
        this.vx = 0;
        this.vy = 0;
        
        // Movement
        if (keys['KeyW']) this.vy -= this.speed;
        if (keys['KeyS']) this.vy += this.speed;
        if (keys['KeyA']) this.vx -= this.speed;
        if (keys['KeyD']) this.vx += this.speed;
        
        // Normalize diagonal movement
        if (this.vx !== 0 && this.vy !== 0) {
            this.vx *= 0.707;
            this.vy *= 0.707;
        }
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.shadow.x = this.x;
        this.shadow.y = this.y + 8;
        
        // Combat
        this.updateCombat(keys, mouse);
        
        // Update cooldowns
        if (this.parryWindow > 0) this.parryWindow--;
        if (this.dodgeCooldown > 0) this.dodgeCooldown--;
    }
    
    updateCombat(keys, mouse) {
        // Attack
        if (mouse.buttons[0] && !this.isAttacking) {
            this.attack();
        }
        
        // Parry
        if (mouse.buttons[2] && !this.isParrying) {
            this.parry();
        }
        
        // Dodge
        if (keys['Space'] && this.dodgeCooldown === 0) {
            this.dodge();
        }
    }
    
    attack() {
        this.isAttacking = true;
        this.sprite.rotation = 0.2;
        
        // Create hitbox for attack
        if (this.game.combatSystem) {
            const damage = 25 * this.game.combatSystem.comboSystem.getDamageMultiplier();
            this.game.combatSystem.createHitbox(this, damage, 10, 'player');
            this.game.combatSystem.comboSystem.onAttack();
        }
        
        setTimeout(() => {
            this.isAttacking = false;
            this.sprite.rotation = 0;
        }, 200);
    }
    
    parry() {
        if (this.game.combatSystem && !this.game.combatSystem.parrySystem.canParry()) {
            return; // Can't parry yet
        }
        
        this.isParrying = true;
        this.parryWindow = 10; // 10 frames of parry window
        this.sprite.tint = 0xFFFF00;
        
        // Create parry window
        if (this.game.combatSystem) {
            this.game.combatSystem.createParryWindow(this, 10);
        }
        
        setTimeout(() => {
            this.isParrying = false;
            this.sprite.tint = 0xFFFFFF;
        }, 300);
    }
    
    dodge() {
        this.dodgeCooldown = 60; // 1 second cooldown
        this.sprite.alpha = 0.5;
        
        setTimeout(() => {
            this.sprite.alpha = 1.0;
        }, 200);
    }
    
    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        
        // Flash red when taking damage
        this.sprite.tint = 0xFF0000;
        setTimeout(() => {
            this.sprite.tint = 0xFFFFFF;
        }, 100);
    }
}

// Enemy class
class Enemy {
    constructor(x, y, container) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.speed = 1;
        this.health = 50;
        this.maxHealth = 50;
        this.attackCooldown = 0;
        this.aggroRange = 150;
        this.attackRange = 40;
        this.isAttacking = false;
        
        this.createSprite(container);
    }
    
    createSprite(container) {
        this.sprite = new PIXI.Graphics();
        
        // Create isometric enemy sprite
        this.sprite.beginFill(0x8B0000);
        this.sprite.drawRect(-8, -16, 16, 32);
        this.sprite.endFill();
        
        // Add head
        this.sprite.beginFill(0xFF6B6B);
        this.sprite.drawCircle(0, -20, 6);
        this.sprite.endFill();
        
        // Add weapon
        this.sprite.beginFill(0x696969);
        this.sprite.drawRect(8, -8, 15, 4);
        this.sprite.endFill();
        
        // Add shadow
        this.shadow = new PIXI.Graphics();
        this.shadow.beginFill(0x000000, 0.3);
        this.shadow.drawEllipse(0, 8, 12, 6);
        this.shadow.endFill();
        
        container.addChild(this.shadow);
        container.addChild(this.sprite);
    }
    
    update(player) {
        if (this.health <= 0) return;
        
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // AI behavior
        if (distance < this.aggroRange) {
            // Move towards player
            this.vx = (dx / distance) * this.speed;
            this.vy = (dy / distance) * this.speed;
            
            // Attack if in range
            if (distance < this.attackRange && this.attackCooldown === 0) {
                this.attack();
            }
        } else {
            this.vx = 0;
            this.vy = 0;
        }
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.shadow.x = this.x;
        this.shadow.y = this.y + 8;
        
        // Update cooldowns
        if (this.attackCooldown > 0) this.attackCooldown--;
    }
    
    attack() {
        this.isAttacking = true;
        this.attackCooldown = 120; // 2 second cooldown
        this.sprite.rotation = 0.3;
        
        setTimeout(() => {
            this.isAttacking = false;
            this.sprite.rotation = 0;
        }, 300);
    }
    
    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        
        // Flash white when taking damage
        this.sprite.tint = 0xFFFFFF;
        setTimeout(() => {
            this.sprite.tint = 0xFFFFFF;
        }, 100);
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new IsometricSoulsGame();
});