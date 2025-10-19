import Phaser from 'phaser';
import IsometricEngine from '../core/IsometricEngine.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import LightingSystem from '../systems/LightingSystem.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // Initialize isometric engine
        this.isoEngine = new IsometricEngine(this);
        
        // Create level
        this.createLevel();
        
        // Create player
        this.player = new Player(this, 5, 5, this.isoEngine);
        
        // Create enemies
        this.enemies = this.physics.add.group();
        this.spawnEnemies();
        
        // Setup camera
        this.setupCamera();
        
        // Create lighting system
        this.lightingSystem = new LightingSystem(this);
        this.lightingSystem.addLight(this.player.sprite.x, this.player.sprite.y, 200, 0xffffaa, 0.3);
        
        // Setup combat events
        this.setupCombatEvents();
        
        // Add some ambient particles
        this.createAmbientEffects();
    }

    createLevel() {
        // Create a simple isometric grid level
        const levelData = [
            [1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,1,0,0,0,0,1,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,1,1,0,0,0,1],
            [1,0,0,0,1,1,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,0,1,0,0,0,0,1,0,1],
            [1,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1]
        ];
        
        this.tiles = [];
        
        for (let y = 0; y < levelData.length; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < levelData[y].length; x++) {
                if (levelData[y][x] === 1) {
                    // Create wall/obstacle
                    const tile = this.isoEngine.createIsoSprite(x, y, 0.5, 'tile');
                    tile.setTint(0x666666);
                    tile.setScale(1, 2);
                    this.tiles[y][x] = { type: 'wall', sprite: tile };
                } else {
                    // Create floor tile
                    const tile = this.isoEngine.createIsoSprite(x, y, 0, 'tile');
                    tile.setTint(0x444444);
                    this.tiles[y][x] = { type: 'floor', sprite: tile };
                }
            }
        }
        
        // Add some decorative elements
        this.createDecorations();
    }

    createDecorations() {
        // Add some glowing crystals or torches
        const decorPositions = [
            { x: 2, y: 2 },
            { x: 7, y: 2 },
            { x: 2, y: 7 },
            { x: 7, y: 7 }
        ];
        
        decorPositions.forEach(pos => {
            // Create a glowing crystal effect
            const crystal = this.add.graphics();
            crystal.fillStyle(0x00ffff, 0.8);
            crystal.fillRect(-8, -16, 16, 32);
            
            const screenPos = this.isoEngine.worldToScreen(pos.x, pos.y, 0.5);
            crystal.x = screenPos.x;
            crystal.y = screenPos.y;
            crystal.setDepth(this.isoEngine.getDepth(pos.x, pos.y, 1));
            
            // Add glow effect
            this.lightingSystem.addLight(screenPos.x, screenPos.y, 150, 0x00ffff, 0.4);
            
            // Animate crystal
            this.tweens.add({
                targets: crystal,
                alpha: 0.4,
                scaleY: 0.9,
                duration: 2000,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        });
    }

    spawnEnemies() {
        const enemyPositions = [
            { x: 3, y: 3 },
            { x: 7, y: 5 },
            { x: 4, y: 7 }
        ];
        
        enemyPositions.forEach(pos => {
            const enemy = new Enemy(this, pos.x, pos.y, this.isoEngine);
            enemy.setTarget(this.player);
            this.enemies.add(enemy.sprite);
            enemy.sprite.enemy = enemy; // Reference for collision detection
        });
    }

    setupCamera() {
        // Center camera on player
        const playerScreen = this.isoEngine.worldToScreen(this.player.x, this.player.y, 0);
        this.cameras.main.centerOn(playerScreen.x, playerScreen.y);
        
        // Set camera bounds
        this.cameras.main.setBounds(-200, -200, 1680, 1120);
        
        // Smooth camera follow
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    }

    setupCombatEvents() {
        // Player attack
        this.events.on('playerAttack', (hitbox) => {
            this.enemies.children.entries.forEach(enemySprite => {
                const enemy = enemySprite.enemy;
                if (!enemy) return;
                
                const distance = Phaser.Math.Distance.Between(
                    this.player.sprite.x, this.player.sprite.y,
                    enemy.sprite.x, enemy.sprite.y
                );
                
                if (distance < 50) {
                    enemy.takeDamage(this.player.attackPower);
                    enemy.takePostureDamage(30);
                    
                    // Knockback
                    const angle = Phaser.Math.Angle.Between(
                        this.player.x, this.player.y,
                        enemy.x, enemy.y
                    );
                    enemy.move(Math.cos(angle) * 0.5, Math.sin(angle) * 0.5);
                }
            });
        });
        
        // Player parry
        this.events.on('playerParry', () => {
            // Will be checked when enemy attacks
        });
        
        // Perfect parry
        this.events.on('perfectParry', (enemy) => {
            // Stun enemy and deal massive posture damage
            enemy.takePostureDamage(60);
            
            // Create perfect parry effect
            const effect = this.add.text(this.player.sprite.x, this.player.sprite.y - 80, 'PERFECT!', {
                fontSize: '24px',
                fontFamily: 'monospace',
                color: '#ffdd00',
                stroke: '#000000',
                strokeThickness: 3
            });
            effect.setOrigin(0.5);
            effect.setDepth(1000);
            
            this.tweens.add({
                targets: effect,
                y: effect.y - 30,
                alpha: 0,
                scale: 1.5,
                duration: 800,
                ease: 'Power2',
                onComplete: () => effect.destroy()
            });
        });
        
        // Enemy attack
        this.events.on('enemyAttack', (enemy, damage) => {
            const blocked = this.player.takeDamage(damage, enemy);
            
            if (!blocked && !this.player.invulnerable) {
                // Hit effect
                this.cameras.main.shake(200, 0.01);
            }
        });
        
        // Enemy death
        this.events.on('enemyDeath', (enemy) => {
            // Remove from enemies group
            this.enemies.remove(enemy.sprite);
            
            // Create death particles
            this.createDeathParticles(enemy.sprite.x, enemy.sprite.y);
        });
        
        // Player death
        this.events.on('playerDeath', () => {
            this.cameras.main.fade(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                this.scene.restart();
            });
        });
    }

    createAmbientEffects() {
        // Create floating particles
        const emitter = this.add.particles(0, 0, 'tile', {
            x: { min: -100, max: 1380 },
            y: { min: -100, max: 820 },
            scale: { start: 0.1, end: 0 },
            alpha: { start: 0.6, end: 0 },
            tint: 0xffffaa,
            lifespan: 3000,
            frequency: 500,
            blendMode: 'ADD'
        });
        
        emitter.setDepth(500);
    }

    createDeathParticles(x, y) {
        const emitter = this.add.particles(x, y, 'tile', {
            scale: { start: 0.3, end: 0 },
            speed: { min: 50, max: 150 },
            lifespan: 600,
            tint: 0xff4444,
            quantity: 10
        });
        
        emitter.setDepth(1000);
        emitter.explode();
        
        this.time.delayedCall(1000, () => {
            emitter.destroy();
        });
    }

    update(time, delta) {
        // Update player
        this.player.update(time, delta);
        
        // Update enemies
        this.enemies.children.entries.forEach(enemySprite => {
            if (enemySprite.enemy) {
                enemySprite.enemy.update(time, delta);
            }
        });
        
        // Update lighting to follow player
        if (this.lightingSystem.lights.length > 0) {
            this.lightingSystem.lights[0].x = this.player.sprite.x;
            this.lightingSystem.lights[0].y = this.player.sprite.y;
        }
        
        // Update scene lighting
        this.lightingSystem.update();
    }
}