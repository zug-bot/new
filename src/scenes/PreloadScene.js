import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // For now, we'll create placeholder graphics
        // In a real game, you'd load actual sprite assets here
        
        // Create placeholder textures
        this.createPlaceholderTextures();
    }

    create() {
        // Start the game scene and UI scene
        this.scene.start('GameScene');
        this.scene.start('UIScene');
    }

    createPlaceholderTextures() {
        // Create hero placeholder
        const heroGraphics = this.add.graphics();
        heroGraphics.fillStyle(0x4444ff, 1);
        heroGraphics.fillRect(0, 0, 32, 48);
        heroGraphics.generateTexture('hero', 32, 48);
        heroGraphics.destroy();

        // Create enemy placeholder
        const enemyGraphics = this.add.graphics();
        enemyGraphics.fillStyle(0xff4444, 1);
        enemyGraphics.fillRect(0, 0, 32, 48);
        enemyGraphics.generateTexture('enemy', 32, 48);
        enemyGraphics.destroy();

        // Create tile placeholder
        const tileGraphics = this.add.graphics();
        tileGraphics.lineStyle(2, 0x666666, 1);
        tileGraphics.strokeRect(0, 0, 64, 32);
        tileGraphics.generateTexture('tile', 64, 32);
        tileGraphics.destroy();

        // Create shadow placeholder
        const shadowGraphics = this.add.graphics();
        shadowGraphics.fillStyle(0x000000, 0.4);
        shadowGraphics.fillEllipse(16, 8, 32, 16);
        shadowGraphics.generateTexture('shadow', 32, 16);
        shadowGraphics.destroy();

        // Create light effect
        const lightGraphics = this.add.graphics();
        lightGraphics.fillStyle(0xffffaa, 0.3);
        for (let i = 0; i < 5; i++) {
            lightGraphics.fillCircle(64, 64, 64 - i * 12);
            lightGraphics.fillStyle(0xffffaa, 0.3 - i * 0.05);
        }
        lightGraphics.generateTexture('light', 128, 128);
        lightGraphics.destroy();

        // Create attack effect
        const attackGraphics = this.add.graphics();
        attackGraphics.lineStyle(3, 0xffffff, 1);
        attackGraphics.arc(32, 32, 30, 0, Math.PI / 2);
        attackGraphics.strokePath();
        attackGraphics.generateTexture('attack-effect', 64, 64);
        attackGraphics.destroy();
    }
}