import { Enemy, Hero } from './entities';

export type CombatEvent =
  | { type: 'parry_success' }
  | { type: 'hit_hero'; damage: number }
  | { type: 'hit_enemy'; damage: number };

export class CombatSystem {
  onEvent?: (event: CombatEvent) => void;

  constructor(onEvent?: (e: CombatEvent) => void) {
    this.onEvent = onEvent;
  }

  tryResolveEnemyAttack(nowMs: number, hero: Hero, enemy: Enemy): void {
    // Attack active window
    const activeFrom = enemy.lastAttackStartMs + enemy.telegraphMs;
    const activeTo = activeFrom + enemy.attackActiveMs;

    if (nowMs < activeFrom || nowMs > activeTo) return;

    const dx = hero.iso.x - enemy.iso.x;
    const dy = hero.iso.y - enemy.iso.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= enemy.attackRange) {
      if (hero.parryActive) {
        hero.parryActive = false;
        enemy.stats.posture += 35;
        if (enemy.stats.posture >= enemy.stats.maxPosture) {
          enemy.stats.posture = enemy.stats.maxPosture;
          enemy.setStaggered(nowMs, 900);
        }
        this.onEvent?.({ type: 'parry_success' });
      } else {
        hero.stats.hp = Math.max(0, hero.stats.hp - 16);
        this.onEvent?.({ type: 'hit_hero', damage: 16 });
      }
    }
  }

  heroAttack(nowMs: number, hero: Hero, enemy: Enemy): void {
    const dx = enemy.iso.x - hero.iso.x;
    const dy = enemy.iso.y - hero.iso.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 1.0) {
      const base = enemy.state === 'staggered' ? 36 : 12;
      enemy.stats.hp = Math.max(0, enemy.stats.hp - base);
      enemy.stats.posture = Math.max(0, enemy.stats.posture - 20);
      this.onEvent?.({ type: 'hit_enemy', damage: base });
    }
  }
}
