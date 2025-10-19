import * as PIXI from 'pixi.js';
import { IsoRenderer } from './renderer.js';
import { Input } from './input.js';
import { Combatant } from './combat.js';
import { createShadowBlob, createRadialLight } from './lighting.js';

const app = new PIXI.Application({
  resizeTo: window,
  background: '#0f0f1a',
  antialias: true,
});

document.getElementById('app').appendChild(app.view);

// Core systems
const input = new Input();
const iso = new IsoRenderer(app);
iso.worldToStage(0, 0);

// Simple isometric ground grid
const GRID_W = 10;
const GRID_H = 10;
for (let y = 0; y < GRID_H; y++) {
  for (let x = 0; x < GRID_W; x++) {
    const base = 0x223047;
    const alt = 0x243958;
    iso.drawIsoTile(x, y, ((x + y) % 2 === 0) ? base : alt);
  }
}

// Entities (placeholder rectangles as sprites)
function createRectSprite(w, h, color) {
  const g = new PIXI.Graphics();
  g.beginFill(color);
  g.drawRect(-w / 2, -h, w, h);
  g.endFill();
  return g;
}

function placeEntity(container, ix, iy, iz = 0) {
  const p = iso.screenFromIso(ix, iy, iz);
  container.x = p.x;
  container.y = p.y;
  container.depthY = p.y; // for depth sorting
}

const playerSprite = createRectSprite(18, 28, 0x93c5fd);
const playerShadow = createShadowBlob(18, 0.35);
playerShadow.y = 16;
const player = new PIXI.Container();
player.addChild(playerShadow, playerSprite);
iso.entityLayer.addChild(player);

const enemySprite = createRectSprite(18, 28, 0xfda4af);
const enemyShadow = createShadowBlob(18, 0.35);
enemyShadow.y = 16;
const enemy = new PIXI.Container();
enemy.addChild(enemyShadow, enemySprite);
iso.entityLayer.addChild(enemy);

// Combatants
const playerFighter = new Combatant({ sprite: player });
const enemyFighter = new Combatant({ sprite: enemy, maxHp: 70, postureMax: 80 });

// Positions in iso coords
const playerPos = { x: 3, y: 3, z: 0 };
const enemyPos = { x: 6, y: 6, z: 0 };
placeEntity(player, playerPos.x, playerPos.y, playerPos.z);
placeEntity(enemy, enemyPos.x, enemyPos.y, enemyPos.z);

// Lighting
const torch = createRadialLight(180, 0xfff1c2, 0.45);
torch.position.set(0, 0);
iso.fxLayer.addChild(torch);

// Camera slight follow
function updateCamera() {
  const p = iso.screenFromIso(playerPos.x, playerPos.y, playerPos.z);
  iso.camera.x = p.x * 0.2; // parallaxed center
  iso.camera.y = p.y * 0.15;
}

// Input handling
function handleInput(dt) {
  const speed = 3 * dt; // tiles per second in fractional units
  let dx = 0, dy = 0;
  if (input.down('w')) dy -= speed;
  if (input.down('s')) dy += speed;
  if (input.down('a')) dx -= speed;
  if (input.down('d')) dx += speed;

  // Move player in iso grid
  if (dx !== 0 || dy !== 0) {
    playerPos.x += dx;
    playerPos.y += dy;
  }

  if (input.down('q')) iso.rotate(-1);
  if (input.down('e')) iso.rotate(1);
}

// Actions (parry/attack)
window.addEventListener('keydown', (e) => {
  const now = performance.now();
  if (e.key === ' ') {
    playerFighter.tryAttack(now);
  }
  if (e.key.toLowerCase() === 'shift') {
    playerFighter.pressParry(now);
  }
});

// Simple enemy AI: swing every 1.2s when close
let enemyAttackTimer = 0;
function updateEnemy(now, dtMs) {
  const dx = enemyPos.x - playerPos.x;
  const dy = enemyPos.y - playerPos.y;
  const dist = Math.hypot(dx, dy);
  const close = dist < 1.2;
  enemyAttackTimer += dtMs;
  if (close && enemyAttackTimer > 1200) {
    enemyAttackTimer = 0;
    const res = playerFighter.receiveAttack(now, 8, 35);
    // flash enemy on parry
    enemySprite.tint = res.parried ? 0x22c55e : 0xfda4af;
  }
}

// Ticker
let last = performance.now();
app.ticker.add(() => {
  const now = performance.now();
  const dtMs = now - last; last = now;
  const dt = dtMs / 1000;

  handleInput(dt);
  updateEnemy(now, dtMs);
  updateCamera();

  // Reposition entities by projection
  placeEntity(player, playerPos.x, playerPos.y, playerPos.z);
  placeEntity(enemy, enemyPos.x, enemyPos.y, enemyPos.z);

  // Torch follows player slightly above
  const p = iso.screenFromIso(playerPos.x, playerPos.y, playerPos.z - 24);
  torch.position.set(p.x, p.y - 16);

  iso.sortEntitiesByDepth();
});
