// renderer.js
// PixiJS renderer, isometric grid, lighting overlays

import * as PIXI from 'pixi.js'
import { TILE_W, TILE_H, cartToIso } from './engine.js'

async function imageExists(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function extractPortraitRegions(img) {
  // Heuristic: scan the bottom band to locate the four portrait heads.
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const bandHeight = Math.floor(img.height * 0.18); // bottom ~18%
  const bandTop = img.height - bandHeight;
  const { data, width } = ctx.getImageData(0, bandTop, img.width, bandHeight);

  // Column alpha sums
  const colSums = new Array(width).fill(0);
  for (let y = 0; y < bandHeight; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4 + 3; // alpha channel
      colSums[x] += data[idx];
    }
  }

  // Group contiguous columns with significant alpha
  const threshold = 20 * bandHeight; // tune for transparency
  const groups = [];
  let start = -1;
  for (let x = 0; x < width; x++) {
    const solid = colSums[x] > threshold;
    if (solid && start === -1) start = x;
    if ((!solid || x === width - 1) && start !== -1) {
      const end = solid && x === width - 1 ? x : x - 1;
      const w = end - start + 1;
      if (w >= 32 && w <= 160) {
        groups.push({ x0: start, x1: end });
      }
      start = -1;
    }
  }

  // Refine each group to a tight bounding box in the band
  const rects = groups.map((g) => {
    let yMin = bandHeight - 1;
    let yMax = 0;
    for (let y = 0; y < bandHeight; y++) {
      for (let x = g.x0; x <= g.x1; x++) {
        const idx = (y * width + x) * 4 + 3;
        if (data[idx] > 0) {
          if (y < yMin) yMin = y;
          if (y > yMax) yMax = y;
        }
      }
    }
    const xMin = g.x0;
    const xMax = g.x1;
    return {
      x: xMin,
      y: bandTop + yMin,
      w: xMax - xMin + 1,
      h: yMax - yMin + 1,
    };
  });

  // Sort left-to-right, pick first four likely portraits
  rects.sort((a, b) => a.x - b.x);
  return rects.slice(0, 4);
}

function textureFromRect(img, rect) {
  const c = document.createElement('canvas');
  c.width = rect.w;
  c.height = rect.h;
  const cctx = c.getContext('2d');
  cctx.drawImage(img, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
  return PIXI.Texture.from(c);
}

export async function createRenderer() {
  const app = new PIXI.Application();
  await app.init({ background: 0x0e1220, resizeTo: window });
  document.getElementById('app').appendChild(app.canvas);

  // Load textures (placeholders + optional knight sheet)
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

  // If knight spritesheet exists, extract portraits for hero/enemy
  const knightUrl = '/assets/sprites/male_knight.png';
  if (await imageExists(knightUrl)) {
    try {
      const img = await loadImage(knightUrl);
      const rects = extractPortraitRegions(img);
      if (rects.length >= 2) {
        const heroTex = textureFromRect(img, rects[0]);
        const enemyTex = textureFromRect(img, rects[rects.length - 1]);
        hero.texture = heroTex;
        enemy.texture = enemyTex;
        const targetHeight = 96; // scale portraits to a readable size
        hero.scale.set(targetHeight / hero.height);
        enemy.scale.set(targetHeight / enemy.height);
      }
    } catch (e) {
      // Ignore, keep placeholder textures
      console.warn('Failed to extract knight portraits:', e);
    }
  }

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
