import * as PIXI from 'pixi.js';
import { isoToScreen, IsoPoint } from './isoutils';

export type CombatStats = {
  maxHp: number;
  hp: number;
  maxPosture: number;
  posture: number;
};

export class Entity {
  container: PIXI.Container;
  sprite: PIXI.DisplayObject;
  shadow: PIXI.Graphics | null = null;
  iso: IsoPoint;

  constructor(sprite: PIXI.DisplayObject, iso: IsoPoint) {
    this.container = new PIXI.Container();
    this.sprite = sprite;
    this.iso = { ...iso };
    this.container.addChild(sprite);

    this.shadow = createShadowBlob();
    // Shadow should render under the sprite
    if (this.shadow) this.container.addChildAt(this.shadow, 0);

    this.updateScreenPosition();
  }

  updateScreenPosition(): void {
    const p = isoToScreen(this.iso);
    // Center sprite origin on its bottom center for better footing
    if (this.sprite instanceof PIXI.Sprite) {
      this.sprite.anchor.set(0.5, 1);
    }
    this.container.position.set(p.x, p.y);

    if (this.shadow) {
      this.shadow.position.set(0, -4); // slight offset for contact with ground
    }
  }
}

export class Hero extends Entity {
  stats: CombatStats;
  speedIsoUnitsPerSec = 4;

  parryActive = false;
  parryWindowEndMs = 0;

  constructor(sprite: PIXI.DisplayObject, iso: IsoPoint) {
    super(sprite, iso);
    this.stats = { maxHp: 100, hp: 100, maxPosture: 100, posture: 0 };
  }

  tryParry(nowMs: number, windowMs = 140): void {
    this.parryActive = true;
    this.parryWindowEndMs = nowMs + windowMs;
  }

  updateParry(nowMs: number): void {
    if (this.parryActive && nowMs >= this.parryWindowEndMs) {
      this.parryActive = false;
    }
  }
}

export type EnemyState = 'idle' | 'windup' | 'attacking' | 'recover' | 'staggered';

export class Enemy extends Entity {
  stats: CombatStats;
  state: EnemyState = 'idle';
  nextActionAtMs = 0;

  // attack parameters
  telegraphMs = 450;
  attackActiveMs = 160;
  recoverMs = 500;
  attackRange = 0.9; // in iso units
  moveSpeedIsoUnitsPerSec = 2.4;

  lastAttackStartMs = 0;

  glow!: PIXI.Graphics;

  constructor(sprite: PIXI.DisplayObject, iso: IsoPoint) {
    super(sprite, iso);
    this.stats = { maxHp: 80, hp: 80, maxPosture: 100, posture: 0 };

    this.glow = new PIXI.Graphics();
    this.container.addChildAt(this.glow, 0);
  }

  setStaggered(nowMs: number, durationMs = 700): void {
    this.state = 'staggered';
    this.nextActionAtMs = nowMs + durationMs;
  }

  updateGlow(nowMs: number): void {
    this.glow.clear();
    if (this.state === 'windup') {
      const t = Math.min(1, (nowMs - this.lastAttackStartMs) / this.telegraphMs);
      const alpha = 0.2 + 0.3 * Math.sin(t * Math.PI);
      this.glow.beginFill(0xff544d, alpha);
      this.glow.drawCircle(0, -8, 16);
      this.glow.endFill();
    }
  }
}

export function createHeroSprite(): PIXI.Sprite {
  const g = new PIXI.Graphics();
  g.beginFill(0x89cff0);
  g.drawRoundedRect(-6, -18, 12, 18, 4);
  g.endFill();
  g.beginFill(0xeeeeee);
  g.drawCircle(0, -22, 5);
  g.endFill();

  const texture = PIXI.RenderTexture.create({ width: 32, height: 32 });
  const rt = PIXI.RenderTexture.create({ width: 32, height: 32 });
  // Use an offscreen renderer via the shared application later; for now, generate texture via Graphics toTexture
  const sprite = PIXI.Sprite.from(g.generateCanvasTexture());
  sprite.anchor.set(0.5, 1);
  return sprite;
}

export function createEnemySprite(): PIXI.Sprite {
  const g = new PIXI.Graphics();
  g.beginFill(0x8b5cf6);
  g.drawRoundedRect(-6, -18, 12, 18, 4);
  g.endFill();
  g.beginFill(0xd1c4e9);
  g.drawCircle(0, -22, 5);
  g.endFill();
  const sprite = PIXI.Sprite.from(g.generateCanvasTexture());
  sprite.anchor.set(0.5, 1);
  return sprite;
}

export function createShadowBlob(): PIXI.Graphics {
  const s = new PIXI.Graphics();
  s.beginFill(0x000000, 0.35);
  s.drawEllipse(0, 0, 12, 6);
  s.endFill();
  s.blendMode = PIXI.BLEND_MODES.MULTIPLY;
  return s;
}
