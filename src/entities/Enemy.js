import Phaser from 'phaser';

export default class Enemy {
    constructor(scene, x, y, isoEngine) {
        this.scene = scene;
        this.isoEngine = isoEngine;
        
        // Position
        this.x = x;
        this.y = y;
        this.z = 0;
        
        // Stats
        this.maxHealth = 80;
        this.health = this.maxHealth;
        this.maxPosture = 80;
        this.posture = 0;
        this.attackPower = 15;
        
        // AI State
        this.state = 'idle'; // idle, approaching, attacking, stunned, recovering
        this.target = null;
        this.attackRange = 1.5;
        this.detectRange = 8;
        this.moveSpeed = 1.5;
        
        // Combat
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.attackCooldownTime = 1500;
        this.stunDuration = 1000;
        
        // Create sprite
        this.sprite = isoEngine.createIsoSprite(x, y, 0, 'enemy');
        this.sprite.setOrigin(0.5, 0.8);
        
        // Create shadow
        const shadowPos = isoEngine.worldToScreen(x, y, 0);
        this.shadow = scene.add.sprite(shadowPos.x, shadowPos.y - 8, 'shadow');
        this.shadow.setAlpha(0.5);
        this.shadow.setDepth(this.sprite.depth - 1);
        
        // Create health bar
        this.createHealthBar();
        
        // Physics body for collision
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setSize(30, 40);
    }

    createHealthBar() {
        const barWidth = 40;
        const barHeight = 4;
        
        this.healthBarBg = this.scene.add.rectangle(0, 0, barWidth, barHeight, 0x333333);
        this.healthBar = this.scene.add.rectangle(0, 0, barWidth, barHeight, 0xff3333);
        this.postureBar = this.scene.add.rectangle(0, 0, barWidth, 2, 0xffaa00);
        
        this.healthBarBg.setOrigin(0, 0.5);
        this.healthBar.setOrigin(0, 0.5);
        this.postureBar.setOrigin(0, 0.5);
        
        this.updateHealthBarPosition();
    }

    update(time, delta) {
        // Update cooldowns
        if (this.attackCooldown > 0) {
            this.attackCooldown -= delta;
        }
        
        // AI behavior
        switch (this.state) {
            case 'idle':
                this.idleBehavior();
                break;
            case 'approaching':
                this.approachBehavior(delta);
                break;
            case 'attacking':
                // Handled by attack method
                break;
            case 'stunned':
                // Just wait
                break;
            case 'recovering':
                this.recoverBehavior();
                break;
        }
        
        // Update health bar position
        this.updateHealthBarPosition();
        
        // Regenerate posture
        if (this.posture > 0 && this.state !== 'stunned') {
            this.posture = Math.max(0, this.posture - 20 * delta / 1000);
            this.updateHealthBar();
        }
    }

    setTarget(target) {
        this.target = target;
    }

    idleBehavior() {
        if (!this.target) return;
        
        const distance = this.getDistanceToTarget();
        
        if (distance <= this.detectRange) {
            this.state = 'approaching';
        }
    }

    approachBehavior(delta) {
        if (!this.target) {
            this.state = 'idle';
            return;
        }
        
        const distance = this.getDistanceToTarget();
        
        if (distance <= this.attackRange) {
            // In range to attack
            if (this.attackCooldown <= 0) {
                this.attack();
            }
        } else if (distance > this.detectRange) {
            // Lost target
            this.state = 'idle';
        } else {
            // Move towards target
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            
            if (len > 0) {
                const moveX = (dx / len) * this.moveSpeed * delta / 1000;
                const moveY = (dy / len) * this.moveSpeed * delta / 1000;
                
                this.move(moveX, moveY);
            }
        }
    }

    recoverBehavior() {
        if (this.attackCooldown <= 0) {
            this.state = 'approaching';
        }
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
        
        // Update sprite position
        this.isoEngine.updateSpritePosition(this.sprite, this.x, this.y, this.z);
        
        // Update shadow
        const shadowPos = this.isoEngine.worldToScreen(this.x, this.y, 0);
        this.shadow.x = shadowPos.x;
        this.shadow.y = shadowPos.y - 8;
        this.shadow.setDepth(this.sprite.depth - 1);
    }

    attack() {
        if (this.state === 'stunned' || this.isAttacking) return;
        
        this.state = 'attacking';
        this.isAttacking = true;
        
        // Telegraph attack (red flash)
        this.sprite.setTint(0xff6666);
        
        // Delay before actual attack
        this.scene.time.delayedCall(300, () => {
            if (this.state === 'stunned') return;
            
            // Create attack effect
            const attackEffect = this.scene.add.sprite(this.sprite.x, this.sprite.y - 20, 'attack-effect');
            attackEffect.setDepth(this.sprite.depth + 1);
            attackEffect.setTint(0xff0000);
            
            // Check if hit player
            const distance = this.getDistanceToTarget();
            if (distance <= this.attackRange * 1.2) {
                this.scene.events.emit('enemyAttack', this, this.attackPower);
            }
            
            // Animate attack
            this.scene.tweens.add({
                targets: attackEffect,
                rotation: -Math.PI / 2,
                alpha: 0,
                scale: 1.5,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    attackEffect.destroy();
                    this.sprite.clearTint();
                    this.isAttacking = false;
                    this.state = 'recovering';
                    this.attackCooldown = this.attackCooldownTime;
                }
            });
        });
    }

    takeDamage(damage) {
        this.health -= damage;
        this.flash(0xffffff);
        
        // Update health bar
        this.updateHealthBar();
        
        if (this.health <= 0) {
            this.die();
        }
    }

    takePostureDamage(damage) {
        this.posture += damage;
        
        if (this.posture >= this.maxPosture) {
            this.stun();
        }
        
        this.updateHealthBar();
    }

    stun() {
        this.state = 'stunned';
        this.sprite.setTint(0x666666);
        this.posture = this.maxPosture;
        
        // Create stun effect
        const stunEffect = this.scene.add.text(this.sprite.x, this.sprite.y - 60, 'STUNNED!', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2
        });
        stunEffect.setOrigin(0.5);
        stunEffect.setDepth(this.sprite.depth + 10);
        
        this.scene.tweens.add({
            targets: stunEffect,
            y: stunEffect.y - 20,
            alpha: 0,
            duration: this.stunDuration,
            ease: 'Power2',
            onComplete: () => {
                stunEffect.destroy();
                this.sprite.clearTint();
                this.state = 'idle';
                this.posture = 0;
                this.updateHealthBar();
            }
        });
    }

    flash(color) {
        const originalTint = this.sprite.tintTopLeft;
        this.sprite.setTint(color);
        this.scene.time.delayedCall(100, () => {
            if (this.state !== 'stunned') {
                this.sprite.clearTint();
            }
        });
    }

    getDistanceToTarget() {
        if (!this.target) return Infinity;
        
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    updateHealthBar() {
        const healthPercent = this.health / this.maxHealth;
        const posturePercent = this.posture / this.maxPosture;
        
        this.healthBar.scaleX = healthPercent;
        this.postureBar.scaleX = posturePercent;
    }

    updateHealthBarPosition() {
        const barX = this.sprite.x - 20;
        const barY = this.sprite.y - 50;
        
        this.healthBarBg.x = barX;
        this.healthBarBg.y = barY;
        this.healthBar.x = barX;
        this.healthBar.y = barY;
        this.postureBar.x = barX;
        this.postureBar.y = barY + 6;
        
        this.healthBarBg.setDepth(this.sprite.depth + 5);
        this.healthBar.setDepth(this.sprite.depth + 6);
        this.postureBar.setDepth(this.sprite.depth + 7);
    }

    die() {
        // Death animation
        this.sprite.setTint(0x333333);
        this.scene.tweens.add({
            targets: [this.sprite, this.shadow],
            alpha: 0,
            duration: 500,
            onComplete: () => {
                this.destroy();
            }
        });
    }

    destroy() {
        this.sprite.destroy();
        this.shadow.destroy();
        this.healthBarBg.destroy();
        this.healthBar.destroy();
        this.postureBar.destroy();
        
        this.scene.events.emit('enemyDeath', this);
    }
}