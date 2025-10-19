// renderer.js
// PixiJS renderer, isometric grid, lighting overlays

import * as PIXI from 'pixi.js'
import { TILE_W, TILE_H, cartToIso } from './engine.js'

export async function createRenderer() {
  const app = new PIXI.Application();
  await app.init({ background: 0x0e1220, resizeTo: window });
  document.getElementById('app').appendChild(app.canvas);

  // Load textures (placeholders)
  const assets = await PIXI.Assets.load({
    hero: '/assets/sprites/hero_idle.png',
    goblin: '/assets/sprites/enemy_goblin.png',
    tile: '/assets/sprites/iso_tile_placeholder.png',
    bg: '/assets/backgrounds/forest_bg.png',
    light: '/assets/lights/light_glow.png',
    shadow: '/assets/lights/shadow_blob.png'
  });

  // Background
  const bg = new PIXI.Sprite(assets.bg);
  bg.anchor.set(0.5);
  bg.x = app.renderer.width * 0.5;
  bg.y = app.renderer.height * 0.5;
  app.stage.addChild(bg);

  // Isometric grid floor (small 7x7)
  const grid = new PIXI.Container();
  const GRID = 7;
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const tile = new PIXI.Sprite(assets.tile);
      tile.anchor.set(0.5, 0.75);
      const iso = cartToIso(x - Math.floor(GRID/2), y - Math.floor(GRID/2));
      tile.x = app.renderer.width * 0.5 + iso.x;
      tile.y = app.renderer.height * 0.65 + iso.y;
      grid.addChild(tile);
    }
  }
  app.stage.addChild(grid);

  // Hero
  const heroShadow = new PIXI.Sprite(assets.shadow);
  heroShadow.anchor.set(0.5, 0.5);
  const hero = new PIXI.Sprite(assets.hero);
  hero.anchor.set(0.5, 0.8);
  hero.x = app.renderer.width * 0.5;
  hero.y = app.renderer.height * 0.65 - TILE_H * 0.5;
  heroShadow.x = hero.x;
  heroShadow.y = hero.y + 24;
  app.stage.addChild(heroShadow);
  app.stage.addChild(hero);

  // Enemy
  const enemyShadow = new PIXI.Sprite(assets.shadow);
  enemyShadow.anchor.set(0.5, 0.5);
  const enemy = new PIXI.Sprite(assets.goblin);
  enemy.anchor.set(0.5, 0.8);
  enemy.x = hero.x + TILE_W * 0.75;
  enemy.y = hero.y + TILE_H * 0.5;
  enemyShadow.x = enemy.x;
  enemyShadow.y = enemy.y + 24;
  app.stage.addChild(enemyShadow);
  app.stage.addChild(enemy);

  // Light overlay (additive glow)
  const light = new PIXI.Sprite(assets.light);
  light.anchor.set(0.5);
  light.blendMode = 'add';
  app.stage.addChild(light);

  // Simple camera parallax
  app.ticker.add(() => {
    const t = app.ticker.lastTime * 0.001;
    bg.x = app.renderer.width * 0.5 + Math.sin(t * 0.2) * 20;
    light.x = hero.x + Math.cos(t * 0.8) * 60;
    light.y = hero.y - 80 + Math.sin(t * 0.8) * 40;
    light.alpha = 0.65 + Math.sin(t * 2.0) * 0.15;
  });

  // Basic controls to move hero on isometric grid
  const keys = new Set();
  window.addEventListener('keydown', (e) => keys.add(e.code));
  window.addEventListener('keyup', (e) => keys.delete(e.code));

  app.ticker.add((frame) => {
    const speed = 2.0;
    let dx = 0, dy = 0;
    if (keys.has('KeyW') || keys.has('ArrowUp')) dy -= 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) dy += 1;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) dx -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) dx += 1;
    if (dx || dy) {
      // Move along iso axes (approximate)
      hero.x += (dx - dy) * (TILE_W/4) * (frame.deltaTime/16) * speed * 0.5;
      hero.y += (dx + dy) * (TILE_H/4) * (frame.deltaTime/16) * speed * 0.5;
      heroShadow.x = hero.x;
      heroShadow.y = hero.y + 24;
    }
  });

  return { app, hero, enemy };
}
