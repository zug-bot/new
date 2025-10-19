import Phaser from 'phaser';

export default class Player {
    constructor(scene, x, y, isoEngine) {
        this.scene = scene;
        this.isoEngine = isoEngine;
        
        // Position
        this.x = x;
        this.y = y;
        this.z = 0;
        
        // Stats (Sekiro-style)
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.maxPosture = 100;
        this.posture = 0;
        this.attackPower = 20;
        
        // Combat state
        this.isAttacking = false;
        this.isParrying = false;
        this.isBlocking = false;
        this.isDashing = false;
        this.canAct = true;
        this.invulnerable = false;
        
        // Movement
        this.moveSpeed = 3;
        this.dashSpeed = 8;
        this.dashDuration = 200;
        
        // Timers
        this.parryWindow = 300; // ms
        this.attackDuration = 400;
        this.blockStaminaDrain = 0.5;
        
        // Create sprite
        this.sprite = isoEngine.createIsoSprite(x, y, 0, 'hero');
        this.sprite.setOrigin(0.5, 0.8);
        
        // Create shadow
        const shadowPos = isoEngine.worldToScreen(x, y, 0);
        this.shadow = scene.add.sprite(shadowPos.x, shadowPos.y - 8, 'shadow');
        this.shadow.setAlpha(0.5);
        this.shadow.setDepth(this.sprite.depth - 1);
        
        // Setup input
        this.setupInput();
        
        // Create attack hitbox (invisible)
        this.attackHitbox = scene.add.rectangle(0, 0, 40, 40);
        this.attackHitbox.setVisible(false);
        scene.physics.add.existing(this.attackHitbox);
    }

    setupInput() {
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        
        // Combat keys
        this.attackKey = this.scene.input.keyboard.addKey('Z');
        this.parryKey = this.scene.input.keyboard.addKey('X');
        this.blockKey = this.scene.input.keyboard.addKey('C');
        this.dashKey = this.scene.input.keyboard.addKey('SPACE');
    }

    update(time, delta) {
        if (!this.canAct) return;
        
        // Handle movement
        let dx = 0;
        let dy = 0;
        
        if (this.cursors.left.isDown) dx -= 1;
        if (this.cursors.right.isDown) dx += 1;
        if (this.cursors.up.isDown) dy -= 1;
        if (this.cursors.down.isDown) dy += 1;
        
        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }
        
        // Apply movement
        if (dx !== 0 || dy !== 0) {
            const speed = this.isDashing ? this.dashSpeed : this.moveSpeed;
            this.move(dx * speed * delta / 1000, dy * speed * delta / 1000);
        }
        
        // Handle combat actions
        this.handleCombat();
        
        // Regenerate posture when not blocking
        if (!this.isBlocking && this.posture > 0) {
            this.posture = Math.max(0, this.posture - 30 * delta / 1000);
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

    handleCombat() {
        // Attack
        if (Phaser.Input.Keyboard.JustDown(this.attackKey) && !this.isAttacking) {
            this.attack();
        }
        
        // Parry (perfect block)
        if (Phaser.Input.Keyboard.JustDown(this.parryKey) && !this.isParrying) {
            this.parry();
        }
        
        // Block
        this.isBlocking = this.blockKey.isDown && !this.isAttacking;
        
        // Dash
        if (Phaser.Input.Keyboard.JustDown(this.dashKey) && !this.isDashing) {
            this.dash();
        }
    }

    attack() {
        if (!this.canAct) return;
        
        this.isAttacking = true;
        this.canAct = false;
        
        // Flash white
        this.sprite.setTint(0xffffff);
        
        // Create attack effect
        const attackEffect = this.scene.add.sprite(this.sprite.x, this.sprite.y - 20, 'attack-effect');
        attackEffect.setDepth(this.sprite.depth + 1);
        attackEffect.setScale(1.5);
        attackEffect.setAlpha(0.8);
        
        // Position attack hitbox
        this.updateAttackHitbox();
        
        // Animate attack
        this.scene.tweens.add({
            targets: attackEffect,
            rotation: Math.PI / 2,
            alpha: 0,
            scale: 2,
            duration: this.attackDuration,
            ease: 'Power2',
            onComplete: () => {
                attackEffect.destroy();
                this.sprite.clearTint();
                this.isAttacking = false;
                this.canAct = true;
            }
        });
        
        // Notify scene of attack
        this.scene.events.emit('playerAttack', this.attackHitbox);
    }

    parry() {
        if (!this.canAct) return;
        
        this.isParrying = true;
        this.canAct = false;
        
        // Golden flash for parry window
        this.sprite.setTint(0xffdd00);
        
        // Create parry effect
        const parryEffect = this.scene.add.graphics();
        parryEffect.lineStyle(3, 0xffdd00, 1);
        parryEffect.strokeCircle(this.sprite.x, this.sprite.y - 24, 40);
        parryEffect.setDepth(this.sprite.depth + 1);
        
        this.scene.tweens.add({
            targets: parryEffect,
            alpha: 0,
            duration: this.parryWindow,
            onComplete: () => {
                parryEffect.destroy();
                this.sprite.clearTint();
                this.isParrying = false;
                this.canAct = true;
            }
        });
        
        // Notify scene of parry attempt
        this.scene.events.emit('playerParry');
    }

    dash() {
        if (!this.canAct || this.isDashing) return;
        
        this.isDashing = true;
        this.invulnerable = true;
        
        // Dash effect
        this.sprite.setAlpha(0.5);
        
        this.scene.time.delayedCall(this.dashDuration, () => {
            this.isDashing = false;
            this.invulnerable = false;
            this.sprite.setAlpha(1);
        });
    }

    takeDamage(damage, fromEnemy) {
        if (this.invulnerable) return false;
        
        // Check if parrying
        if (this.isParrying) {
            // Perfect parry!
            this.scene.events.emit('perfectParry', fromEnemy);
            return true;
        }
        
        // Check if blocking
        if (this.isBlocking) {
            // Take posture damage instead
            this.posture += damage * 0.7;
            
            if (this.posture >= this.maxPosture) {
                // Guard broken!
                this.guardBreak();
                return false;
            }
            
            // Blocked successfully
            return true;
        }
        
        // Take health damage
        this.health -= damage;
        this.flash(0xff0000);
        
        if (this.health <= 0) {
            this.die();
        }
        
        return false;
    }

    guardBreak() {
        this.canAct = false;
        this.sprite.setTint(0x666666);
        
        this.scene.time.delayedCall(1000, () => {
            this.canAct = true;
            this.sprite.clearTint();
            this.posture = 0;
        });
    }

    flash(color) {
        this.sprite.setTint(color);
        this.scene.time.delayedCall(100, () => {
            this.sprite.clearTint();
        });
    }

    updateAttackHitbox() {
        // Position hitbox in front of player based on facing
        const offset = 30;
        this.attackHitbox.x = this.sprite.x;
        this.attackHitbox.y = this.sprite.y - 20;
    }

    die() {
        this.canAct = false;
        this.sprite.setTint(0x333333);
        this.scene.events.emit('playerDeath');
    }
}