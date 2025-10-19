import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { WorldRenderer } from './renderer';
import { LightingSystem } from './lighting';
import { createKeyState, consumeFrame } from './input';
import { Enemy, Hero, createEnemySprite, createHeroSprite } from './entities';
import { CombatSystem } from './combat';
import { TILE_HEIGHT, TILE_WIDTH, clamp } from './isoutils';

const app = new PIXI.Application<HTMLCanvasElement>({
  background: '#0c0f13',
  antialias: true,
  resizeTo: window,
});

const appDiv = document.getElementById('app')!;
appDiv.appendChild(app.view);

// World
const MAP_W = 20;
const MAP_H = 20;
const world = new WorldRenderer(MAP_W, MAP_H);

// Camera / Viewport
const viewport = new Viewport({
  screenWidth: window.innerWidth,
  screenHeight: window.innerHeight,
  worldWidth: (MAP_W + MAP_H) * (TILE_WIDTH / 2) + 256,
  worldHeight: (MAP_W + MAP_H) * (TILE_HEIGHT / 2) + 256,
  events: app.renderer.events,
});

viewport.drag({ wheel: false }).pinch().wheel().decelerate();
viewport.setZoom(1.25);

app.stage.addChild(viewport);
viewport.addChild(world.container);

// Lighting
const lighting = new LightingSystem(viewport.worldWidth, viewport.worldHeight);
world.overlay.addChild(lighting.container);

// Entities
const hero = new Hero(createHeroSprite(), { x: 6, y: 6, z: 0 });
const enemy = new Enemy(createEnemySprite(), { x: 9, y: 8, z: 0 });

world.entities.addChild(hero.container);
world.entities.addChild(enemy.container);

// Lights
const heroLight = lighting.createRadialLight(140, 1.0, 0xfff3c4);
lighting.addLight(heroLight);

const enemyLight = lighting.createRadialLight(100, 0.8, 0xff6666);
lighting.addLight(enemyLight);

// Follow hero
viewport.follow(hero.container, { speed: 8 });

// Input
const keys = createKeyState();

// Combat
const combat = new CombatSystem((e) => {
  if (e.type === 'parry_success') {
    flashMessage('Parry!');
  }
});

function flashMessage(text: string) {
  const label = new PIXI.Text({ text, style: { fill: 0xffffff, fontSize: 18, fontWeight: '700' } });
  label.anchor.set(0.5);
  label.position.set(hero.container.position.x, hero.container.position.y - 60);
  world.overlay.addChild(label);
  const start = performance.now();
  const tick = () => {
    const t = (performance.now() - start) / 600;
    label.alpha = clamp(1 - t, 0, 1);
    label.y -= 0.1;
    if (label.alpha <= 0) {
      app.ticker.remove(tick);
      label.destroy();
    }
  };
  app.ticker.add(tick);
}

// UI bars
const ui = new PIXI.Container();
app.stage.addChild(ui);
const heroHpBar = makeBar(120, 8, 0x22c55e);
const heroPostureBar = makeBar(120, 6, 0xf59e0b);
ui.addChild(heroHpBar.container);
ui.addChild(heroPostureBar.container);

function updateUI() {
  const margin = 16;
  heroHpBar.container.position.set(margin, margin);
  heroPostureBar.container.position.set(margin, margin + 12);
  heroHpBar.set(hero.stats.hp / hero.stats.maxHp);
  heroPostureBar.set(hero.stats.posture / hero.stats.maxPosture);
}

function makeBar(width: number, height: number, color: number) {
  const bg = new PIXI.Graphics();
  bg.beginFill(0x111827, 0.7);
  bg.drawRoundedRect(0, 0, width, height, 3);
  bg.endFill();

  const fg = new PIXI.Graphics();

  const container = new PIXI.Container();
  container.addChild(bg);
  container.addChild(fg);

  function set(pct: number) {
    fg.clear();
    fg.beginFill(color);
    fg.drawRoundedRect(0, 0, Math.max(0, Math.min(1, pct)) * width, height, 3);
    fg.endFill();
  }

  return { container, set };
}

// Resize handling
window.addEventListener('resize', () => {
  viewport.resize(window.innerWidth, window.innerHeight, viewport.worldWidth, viewport.worldHeight);
});

// Game loop
let lastMs = performance.now();
app.ticker.add(() => {
  const nowMs = performance.now();
  const dtSec = Math.min(0.05, (nowMs - lastMs) / 1000);
  lastMs = nowMs;

  // Movement (iso axes)
  const move = { x: 0, y: 0 };
  if (keys.pressed.has('w')) move.y -= 1;
  if (keys.pressed.has('s')) move.y += 1;
  if (keys.pressed.has('a')) move.x -= 1;
  if (keys.pressed.has('d')) move.x += 1;
  if (move.x !== 0 || move.y !== 0) {
    const len = Math.hypot(move.x, move.y) || 1;
    const nx = move.x / len;
    const ny = move.y / len;
    hero.iso.x += nx * hero.speedIsoUnitsPerSec * dtSec;
    hero.iso.y += ny * hero.speedIsoUnitsPerSec * dtSec;
  }

  // Input actions
  if (keys.justPressed.has('k')) {
    hero.tryParry(nowMs);
  }
  if (keys.justPressed.has('j')) {
    combat.heroAttack(nowMs, hero, enemy);
  }

  hero.updateParry(nowMs);

  // Enemy AI
  enemyAI(nowMs, dtSec);

  // Update positions
  hero.updateScreenPosition();
  enemy.updateScreenPosition();

  // Lighting positions
  heroLight.position.copyFrom(hero.container.position);
  enemyLight.position.copyFrom(enemy.container.position);

  // Combat resolution for enemy attack
  combat.tryResolveEnemyAttack(nowMs, hero, enemy);

  // Update UI
  updateUI();

  consumeFrame(keys);
});

function enemyAI(nowMs: number, dtSec: number) {
  enemy.updateGlow(nowMs);

  // Move towards hero if not attacking or staggered
  if (enemy.state === 'idle') {
    const dx = hero.iso.x - enemy.iso.x;
    const dy = hero.iso.y - enemy.iso.y;
    const dist = Math.hypot(dx, dy);
    if (dist > enemy.attackRange * 0.85) {
      const nx = dx / (dist || 1);
      const ny = dy / (dist || 1);
      enemy.iso.x += nx * enemy.moveSpeedIsoUnitsPerSec * dtSec;
      enemy.iso.y += ny * enemy.moveSpeedIsoUnitsPerSec * dtSec;
    } else {
      // Consider starting an attack
      if (nowMs >= enemy.nextActionAtMs) {
        enemy.state = 'windup';
        enemy.lastAttackStartMs = nowMs;
        enemy.nextActionAtMs = nowMs + enemy.telegraphMs + enemy.attackActiveMs + enemy.recoverMs;
      }
    }
  } else if (enemy.state === 'windup') {
    // Transition to attacking when telegraph ends
    if (nowMs >= enemy.lastAttackStartMs + enemy.telegraphMs) {
      enemy.state = 'attacking';
    }
  } else if (enemy.state === 'attacking') {
    if (nowMs >= enemy.lastAttackStartMs + enemy.telegraphMs + enemy.attackActiveMs) {
      enemy.state = 'recover';
    }
  } else if (enemy.state === 'recover') {
    if (nowMs >= enemy.nextActionAtMs) {
      enemy.state = 'idle';
    }
  } else if (enemy.state === 'staggered') {
    if (nowMs >= enemy.nextActionAtMs) {
      enemy.state = 'idle';
      enemy.stats.posture = Math.max(0, enemy.stats.posture - 30);
    }
  }
}
