import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        const gameScene = this.scene.get('GameScene');
        this.player = gameScene.player;
        
        // Create UI elements
        this.createHealthBar();
        this.createPostureBar();
        this.createControls();
        
        // Listen for updates
        gameScene.events.on('update', () => {
            this.updateUI();
        });
    }

    createHealthBar() {
        const x = 50;
        const y = 50;
        const width = 200;
        const height = 20;
        
        // Background
        this.healthBarBg = this.add.rectangle(x, y, width, height, 0x333333);
        this.healthBarBg.setOrigin(0, 0.5);
        this.healthBarBg.setStrokeStyle(2, 0x666666);
        
        // Health fill
        this.healthBar = this.add.rectangle(x, y, width, height, 0xff3333);
        this.healthBar.setOrigin(0, 0.5);
        
        // Health text
        this.healthText = this.add.text(x + width / 2, y, 'VITALITY', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.healthText.setOrigin(0.5, 0.5);
    }

    createPostureBar() {
        const x = 50;
        const y = 80;
        const width = 200;
        const height = 15;
        
        // Background
        this.postureBarBg = this.add.rectangle(x, y, width, height, 0x333333);
        this.postureBarBg.setOrigin(0, 0.5);
        this.postureBarBg.setStrokeStyle(2, 0x666666);
        
        // Posture fill
        this.postureBar = this.add.rectangle(x, y, 0, height, 0xffaa00);
        this.postureBar.setOrigin(0, 0.5);
        
        // Posture text
        this.postureText = this.add.text(x + width / 2, y, 'POSTURE', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.postureText.setOrigin(0.5, 0.5);
    }

    createControls() {
        const x = this.cameras.main.width - 200;
        const y = this.cameras.main.height - 150;
        
        const controlsText = [
            'CONTROLS:',
            'Arrow Keys - Move',
            'Z - Attack',
            'X - Parry',
            'C - Block',
            'Space - Dash'
        ];
        
        this.controlsDisplay = this.add.text(x, y, controlsText.join('\n'), {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'left'
        });
        this.controlsDisplay.setAlpha(0.8);
        
        // Combat tips
        const tipsText = [
            'COMBAT TIPS:',
            '• Parry just before enemy attacks',
            '• Break enemy posture to stun',
            '• Dash has invincibility frames'
        ];
        
        this.tipsDisplay = this.add.text(50, this.cameras.main.height - 100, tipsText.join('\n'), {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#aaaaaa',
            stroke: '#000000',
            strokeThickness: 1,
            align: 'left'
        });
        this.tipsDisplay.setAlpha(0.7);
    }

    updateUI() {
        if (!this.player) return;
        
        // Update health bar
        const healthPercent = this.player.health / this.player.maxHealth;
        this.healthBar.scaleX = healthPercent;
        
        // Flash health bar when low
        if (healthPercent < 0.3) {
            const pulse = Math.sin(this.time.now * 0.01) * 0.5 + 0.5;
            this.healthBar.setAlpha(0.5 + pulse * 0.5);
        } else {
            this.healthBar.setAlpha(1);
        }
        
        // Update posture bar
        const posturePercent = this.player.posture / this.player.maxPosture;
        this.postureBar.scaleX = posturePercent;
        
        // Flash posture bar when high
        if (posturePercent > 0.8) {
            const pulse = Math.sin(this.time.now * 0.02) * 0.5 + 0.5;
            this.postureBar.setTint(Phaser.Display.Color.GetColor(255, 170 + pulse * 85, 0));
        } else {
            this.postureBar.clearTint();
        }
        
        // Show combat state indicators
        if (this.player.isParrying) {
            this.showCombatIndicator('PARRYING!', 0xffdd00);
        } else if (this.player.isBlocking) {
            this.showCombatIndicator('BLOCKING', 0x6666ff);
        } else if (this.player.isAttacking) {
            this.showCombatIndicator('ATTACK!', 0xff6666);
        }
    }

    showCombatIndicator(text, color) {
        if (this.combatIndicator) {
            this.combatIndicator.destroy();
        }
        
        this.combatIndicator = this.add.text(this.cameras.main.centerX, 150, text, {
            fontSize: '24px',
            fontFamily: 'monospace',
            color: Phaser.Display.Color.IntegerToHex(color),
            stroke: '#000000',
            strokeThickness: 3
        });
        this.combatIndicator.setOrigin(0.5, 0.5);
        
        this.tweens.add({
            targets: this.combatIndicator,
            alpha: 0,
            y: 120,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                if (this.combatIndicator) {
                    this.combatIndicator.destroy();
                    this.combatIndicator = null;
                }
            }
        });
    }
}