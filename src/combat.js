export class Combatant {
  constructor({ sprite, maxHp = 100, postureMax = 100 }) {
    this.sprite = sprite;
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.postureMax = postureMax;
    this.posture = 0; // higher means closer to break
    this.state = 'idle'; // idle, attack, parry, stunned
    this.parryWindowMs = 160;
    this.lastParryPressedAt = -Infinity;
    this.attackCooldownMs = 500;
    this.lastAttackAt = -Infinity;
  }

  pressParry(nowMs) {
    this.lastParryPressedAt = nowMs;
    this.state = 'parry';
  }

  tryAttack(nowMs) {
    if (nowMs - this.lastAttackAt < this.attackCooldownMs) return false;
    this.lastAttackAt = nowMs;
    this.state = 'attack';
    return true;
  }

  receiveAttack(nowMs, damage = 10, postureAdd = 40) {
    const withinParry = nowMs - this.lastParryPressedAt <= this.parryWindowMs;
    if (withinParry) {
      // perfect parry: reduce posture and counter opportunity
      this.posture = Math.max(0, this.posture - postureAdd * 0.5);
      this.state = 'parry';
      return { parried: true, damage: 0 };
    }
    this.posture = Math.min(this.postureMax, this.posture + postureAdd);
    if (this.posture >= this.postureMax) {
      this.state = 'stunned';
    }
    this.hp = Math.max(0, this.hp - damage);
    return { parried: false, damage };
  }
}
