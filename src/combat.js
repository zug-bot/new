// Advanced combat system with parrying mechanics
class CombatSystem {
    constructor(game) {
        this.game = game;
        this.hitboxes = [];
        this.parryWindows = [];
        this.damageNumbers = [];
        this.comboSystem = new ComboSystem();
        this.parrySystem = new ParrySystem();
    }
    
    update() {
        this.updateHitboxes();
        this.updateParryWindows();
        this.updateDamageNumbers();
        this.comboSystem.update();
    }
    
    createHitbox(attacker, damage, knockback = 0, type = 'normal') {
        const hitbox = {
            x: attacker.x,
            y: attacker.y,
            radius: 30,
            damage: damage,
            knockback: knockback,
            type: type,
            attacker: attacker,
            life: 10,
            maxLife: 10
        };
        
        this.hitboxes.push(hitbox);
        return hitbox;
    }
    
    createParryWindow(defender, duration = 10) {
        const parryWindow = {
            x: defender.x,
            y: defender.y,
            radius: 40,
            defender: defender,
            life: duration,
            maxLife: duration,
            active: true
        };
        
        this.parryWindows.push(parryWindow);
        return parryWindow;
    }
    
    updateHitboxes() {
        for (let i = this.hitboxes.length - 1; i >= 0; i--) {
            const hitbox = this.hitboxes[i];
            hitbox.life--;
            
            // Check for collisions
            this.checkHitboxCollisions(hitbox);
            
            if (hitbox.life <= 0) {
                this.hitboxes.splice(i, 1);
            }
        }
    }
    
    updateParryWindows() {
        for (let i = this.parryWindows.length - 1; i >= 0; i--) {
            const parryWindow = this.parryWindows[i];
            parryWindow.life--;
            
            if (parryWindow.life <= 0) {
                parryWindow.active = false;
                this.parryWindows.splice(i, 1);
            }
        }
    }
    
    checkHitboxCollisions(hitbox) {
        const targets = this.game.enemies.concat([this.game.player]);
        
        targets.forEach(target => {
            if (target === hitbox.attacker || target.health <= 0) return;
            
            const dx = target.x - hitbox.x;
            const dy = target.y - hitbox.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < hitbox.radius) {
                // Check if target is parrying
                if (this.isParrying(target)) {
                    this.handleParry(hitbox, target);
                } else {
                    this.dealDamage(target, hitbox.damage, hitbox.knockback);
                    this.createDamageNumber(target.x, target.y, hitbox.damage);
                }
                
                // Remove hitbox after hit
                hitbox.life = 0;
            }
        });
    }
    
    isParrying(target) {
        return this.parryWindows.some(window => 
            window.defender === target && window.active
        );
    }
    
    handleParry(hitbox, defender) {
        // Successful parry
        this.parrySystem.onSuccessfulParry(defender, hitbox.attacker);
        this.createParryEffect(defender.x, defender.y);
        this.createDamageNumber(defender.x, defender.y - 20, 'PARRY!', 0x00FF00);
    }
    
    dealDamage(target, damage, knockback = 0) {
        target.takeDamage(damage);
        
        // Apply knockback
        if (knockback > 0) {
            const dx = target.x - this.game.player.x;
            const dy = target.y - this.game.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                target.x += (dx / distance) * knockback;
                target.y += (dy / distance) * knockback;
            }
        }
        
        // Create blood effect
        this.createBloodEffect(target.x, target.y);
    }
    
    createDamageNumber(x, y, damage, color = 0xFF0000) {
        const damageText = new PIXI.Text(damage.toString(), {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: color,
            stroke: 0x000000,
            strokeThickness: 2
        });
        
        damageText.anchor.set(0.5);
        damageText.x = x;
        damageText.y = y;
        
        this.game.app.stage.addChild(damageText);
        
        // Animate damage number
        const tween = {
            y: y - 50,
            alpha: 0,
            duration: 60
        };
        
        this.damageNumbers.push({
            text: damageText,
            tween: tween,
            life: 60
        });
    }
    
    createParryEffect(x, y) {
        // Create spark particles
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const spark = this.game.particleSystem.createParticle(
                x + Math.cos(angle) * 20,
                y + Math.sin(angle) * 20,
                'spark'
            );
            spark.vx = Math.cos(angle) * 3;
            spark.vy = Math.sin(angle) * 3;
        }
    }
    
    createBloodEffect(x, y) {
        // Create blood particles
        for (let i = 0; i < 5; i++) {
            this.game.particleSystem.createParticle(
                x + (Math.random() - 0.5) * 20,
                y + (Math.random() - 0.5) * 20,
                'blood'
            );
        }
    }
    
    updateDamageNumbers() {
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            const damageNumber = this.damageNumbers[i];
            damageNumber.life--;
            
            // Animate upward movement
            damageNumber.text.y -= 1;
            damageNumber.text.alpha = damageNumber.life / 60;
            
            if (damageNumber.life <= 0) {
                this.game.app.stage.removeChild(damageNumber.text);
                this.damageNumbers.splice(i, 1);
            }
        }
    }
}

// Combo system for chaining attacks
class ComboSystem {
    constructor() {
        this.comboCount = 0;
        this.comboTimer = 0;
        this.maxComboTime = 120; // 2 seconds
        this.comboMultiplier = 1;
    }
    
    onAttack() {
        if (this.comboTimer > 0) {
            this.comboCount++;
            this.comboMultiplier = 1 + (this.comboCount * 0.1);
        } else {
            this.comboCount = 1;
            this.comboMultiplier = 1;
        }
        
        this.comboTimer = this.maxComboTime;
    }
    
    update() {
        if (this.comboTimer > 0) {
            this.comboTimer--;
        } else {
            this.comboCount = 0;
            this.comboMultiplier = 1;
        }
    }
    
    getDamageMultiplier() {
        return this.comboMultiplier;
    }
}

// Parry system for timing-based defense
class ParrySystem {
    constructor() {
        this.perfectParryWindow = 3; // 3 frames for perfect parry
        this.parryCooldown = 0;
        this.maxParryCooldown = 30; // 0.5 seconds
    }
    
    onSuccessfulParry(defender, attacker) {
        // Stun attacker
        if (attacker.stun) {
            attacker.stun = 30; // 0.5 second stun
        }
        
        // Create perfect parry effect
        this.createPerfectParryEffect(defender.x, defender.y);
        
        // Reset parry cooldown
        this.parryCooldown = this.maxParryCooldown;
    }
    
    createPerfectParryEffect(x, y) {
        // Create golden spark burst
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const spark = new PIXI.Graphics();
            spark.beginFill(0xFFD700);
            spark.drawCircle(0, 0, 3);
            spark.endFill();
            
            spark.x = x + Math.cos(angle) * 30;
            spark.y = y + Math.sin(angle) * 30;
            
            // Animate spark
            const tween = {
                x: spark.x + Math.cos(angle) * 50,
                y: spark.y + Math.sin(angle) * 50,
                alpha: 0,
                duration: 30
            };
        }
    }
    
    update() {
        if (this.parryCooldown > 0) {
            this.parryCooldown--;
        }
    }
    
    canParry() {
        return this.parryCooldown === 0;
    }
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CombatSystem, ComboSystem, ParrySystem };
}