// renderer.js
// Enhanced PixiJS renderer with improved lighting, particles, and visual effects

import * as PIXI from 'pixi.js'
import { TILE_W, TILE_H, cartToIso } from './engine.js'
import { EnemyManager } from './enemy.js'
import { AssetLoader } from './assetLoader.js'

export async function createRenderer() {
  const app = new PIXI.Application();
  await app.init({ 
    background: 0x0e1220, 
    resizeTo: window,
    antialias: true,
    resolution: window.devicePixelRatio || 1
  });
  document.getElementById('app').appendChild(app.canvas);

  // Create containers for proper layering
  const worldContainer = new PIXI.Container();
  const backgroundLayer = new PIXI.Container();
  const groundLayer = new PIXI.Container();
  const shadowLayer = new PIXI.Container();
  const entityLayer = new PIXI.Container();
  const effectLayer = new PIXI.Container();
  const lightingLayer = new PIXI.Container();
  const uiLayer = new PIXI.Container();
  
  app.stage.addChild(worldContainer);
  worldContainer.addChild(backgroundLayer);
  worldContainer.addChild(groundLayer);
  worldContainer.addChild(shadowLayer);
  worldContainer.addChild(entityLayer);
  worldContainer.addChild(effectLayer);
  worldContainer.addChild(lightingLayer);
  app.stage.addChild(uiLayer); // UI stays fixed

  // Load textures with smart fallbacks
  const assets = await AssetLoader.loadAssets({
    hero: '/assets/sprites/hero_idle.png',
    goblin: '/assets/sprites/enemy_goblin.png',
    tile: '/assets/sprites/iso_tile_placeholder.png',
    bg: '/assets/backgrounds/forest_bg.png',
    light: '/assets/lights/light_glow.png',
    shadow: '/assets/lights/shadow_blob.png',
    samurai: '/assets/sprites/enemy_samurai.png',
    ninja: '/assets/sprites/enemy_ninja.png'
  });

  // Enhanced background with parallax layers
  const bgContainer = new PIXI.Container();
  const bg = new PIXI.Sprite(assets.bg);
  bg.anchor.set(0.5);
  bg.x = app.renderer.width * 0.5;
  bg.y = app.renderer.height * 0.5;
  bg.scale.set(1.2); // Slightly larger for parallax movement
  bgContainer.addChild(bg);
  backgroundLayer.addChild(bgContainer);

  // Create fog/mist effect
  const fog = new PIXI.Graphics();
  fog.beginFill(0x223344, 0.3);
  fog.drawRect(0, 0, app.renderer.width, app.renderer.height);
  fog.endFill();
  fog.blendMode = 'multiply';
  backgroundLayer.addChild(fog);

  // Enhanced isometric grid with depth
  const GRID_SIZE = 9;
  const tiles = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    tiles[y] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      const tile = new PIXI.Sprite(assets.tile);
      tile.anchor.set(0.5, 0.75);
      const iso = cartToIso(x - Math.floor(GRID_SIZE/2), y - Math.floor(GRID_SIZE/2));
      tile.x = app.renderer.width * 0.5 + iso.x;
      tile.y = app.renderer.height * 0.65 + iso.y;
      
      // Add depth tinting
      const depth = (x + y) / (GRID_SIZE * 2);
      tile.tint = PIXI.Color.shared.setValue([
        1 - depth * 0.2,
        1 - depth * 0.2,
        1 - depth * 0.15
      ]).toNumber();
      
      tiles[y][x] = tile;
      groundLayer.addChild(tile);
    }
  }

  // Create hero with enhanced visuals
  const heroShadow = new PIXI.Sprite(assets.shadow);
  heroShadow.anchor.set(0.5, 0.5);
  heroShadow.scale.set(1.2, 0.6);
  heroShadow.alpha = 0.5;
  shadowLayer.addChild(heroShadow);

  const hero = new PIXI.Sprite(assets.hero);
  hero.anchor.set(0.5, 0.8);
  hero.x = app.renderer.width * 0.5;
  hero.y = app.renderer.height * 0.65 - TILE_H * 0.5;
  heroShadow.x = hero.x;
  heroShadow.y = hero.y + 24;
  entityLayer.addChild(hero);

  // Add hero glow effect
  const heroGlow = new PIXI.Graphics();
  heroGlow.beginFill(0x4488ff, 0.3);
  heroGlow.drawCircle(0, 0, 40);
  heroGlow.endFill();
  heroGlow.filters = [new PIXI.BlurFilter(8)];
  heroGlow.blendMode = 'add';
  effectLayer.addChild(heroGlow);

  // Initialize enemy manager with assets
  const enemyManager = new EnemyManager(app, assets);
  
  // Spawn multiple enemies
  const enemyPositions = [
    { x: 150, y: 0, type: 'goblin' },
    { x: -150, y: 50, type: 'goblin' },
    { x: 0, y: -100, type: 'samurai' }
  ];
  
  enemyPositions.forEach(pos => {
    const enemy = enemyManager.spawnEnemy(
      hero.x + pos.x,
      hero.y + pos.y,
      pos.type
    );
    shadowLayer.addChild(enemy.shadow);
    entityLayer.addChild(enemy.sprite);
  });
  
  enemyManager.setPlayerTarget(hero);

  // Enhanced dynamic lighting system
  const lights = [];
  
  // Ambient light
  const ambientLight = new PIXI.Graphics();
  ambientLight.beginFill(0x4466aa, 0.2);
  ambientLight.drawRect(0, 0, app.renderer.width, app.renderer.height);
  ambientLight.endFill();
  ambientLight.blendMode = 'add';
  lightingLayer.addChild(ambientLight);
  
  // Hero light
  const heroLight = new PIXI.Sprite(assets.light);
  heroLight.anchor.set(0.5);
  heroLight.scale.set(1.5);
  heroLight.blendMode = 'add';
  heroLight.alpha = 0.6;
  lightingLayer.addChild(heroLight);
  lights.push({ sprite: heroLight, follow: hero, offset: { x: 0, y: -40 } });
  
  // Floating orb lights
  for (let i = 0; i < 3; i++) {
    const orbLight = new PIXI.Sprite(assets.light);
    orbLight.anchor.set(0.5);
    orbLight.scale.set(0.8);
    orbLight.blendMode = 'add';
    orbLight.tint = [0xff8844, 0x44ff88, 0x8844ff][i];
    orbLight.alpha = 0.4;
    lightingLayer.addChild(orbLight);
    lights.push({ 
      sprite: orbLight, 
      orbit: { 
        center: { x: app.renderer.width * 0.5, y: app.renderer.height * 0.5 },
        radius: 200,
        speed: 0.5 + i * 0.2,
        offset: i * (Math.PI * 2 / 3)
      }
    });
  }

  // Particle system for ambient effects
  const particles = [];
  const maxParticles = 50;
  
  for (let i = 0; i < maxParticles; i++) {
    const particle = new PIXI.Graphics();
    particle.beginFill(0xffffff);
    particle.drawCircle(0, 0, Math.random() * 2 + 1);
    particle.endFill();
    particle.alpha = 0;
    particle.x = Math.random() * app.renderer.width;
    particle.y = Math.random() * app.renderer.height;
    effectLayer.addChild(particle);
    particles.push({
      sprite: particle,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -Math.random() * 0.5 - 0.5,
      life: 0,
      maxLife: Math.random() * 3000 + 2000
    });
  }

  // Enhanced controls with smooth movement
  const keys = new Set();
  const movement = { vx: 0, vy: 0, speed: 3.0 };
  
  window.addEventListener('keydown', (e) => keys.add(e.code));
  window.addEventListener('keyup', (e) => keys.delete(e.code));

  // Main update loop
  app.ticker.add((ticker) => {
    const deltaTime = ticker.deltaMS;
    const time = ticker.lastTime * 0.001;

    // Smooth camera parallax
    const targetX = app.renderer.width * 0.5 - (hero.x - app.renderer.width * 0.5) * 0.1;
    const targetY = app.renderer.height * 0.5 - (hero.y - app.renderer.height * 0.5) * 0.1;
    bg.x += (targetX - bg.x) * 0.05;
    bg.y += (targetY - bg.y) * 0.05;

    // Update hero movement with acceleration
    let targetVx = 0, targetVy = 0;
    if (keys.has('KeyW') || keys.has('ArrowUp')) targetVy -= 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) targetVy += 1;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) targetVx -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) targetVx += 1;
    
    // Normalize diagonal movement
    if (targetVx && targetVy) {
      targetVx *= 0.707;
      targetVy *= 0.707;
    }
    
    // Smooth acceleration
    movement.vx += (targetVx * movement.speed - movement.vx) * 0.15;
    movement.vy += (targetVy * movement.speed - movement.vy) * 0.15;
    
    // Apply movement
    if (Math.abs(movement.vx) > 0.01 || Math.abs(movement.vy) > 0.01) {
      hero.x += movement.vx;
      hero.y += movement.vy;
      heroShadow.x = hero.x;
      heroShadow.y = hero.y + 24;
      
      // Bobbing animation
      hero.y += Math.sin(time * 10) * 2;
    }

    // Update hero glow position
    heroGlow.x = hero.x;
    heroGlow.y = hero.y - 20;
    heroGlow.scale.set(1 + Math.sin(time * 3) * 0.1);

    // Update dynamic lights
    lights.forEach(light => {
      if (light.follow) {
        light.sprite.x = light.follow.x + (light.offset?.x || 0);
        light.sprite.y = light.follow.y + (light.offset?.y || 0);
      } else if (light.orbit) {
        const angle = time * light.orbit.speed + light.orbit.offset;
        light.sprite.x = light.orbit.center.x + Math.cos(angle) * light.orbit.radius;
        light.sprite.y = light.orbit.center.y + Math.sin(angle) * light.orbit.radius * 0.5;
        light.sprite.alpha = 0.4 + Math.sin(time * 2 + light.orbit.offset) * 0.2;
      }
    });

    // Update particles
    particles.forEach(particle => {
      particle.life += deltaTime;
      if (particle.life > particle.maxLife) {
        particle.life = 0;
        particle.sprite.x = Math.random() * app.renderer.width;
        particle.sprite.y = app.renderer.height + 10;
      }
      
      particle.sprite.x += particle.vx * deltaTime * 0.1;
      particle.sprite.y += particle.vy * deltaTime * 0.1;
      
      const lifeRatio = particle.life / particle.maxLife;
      particle.sprite.alpha = Math.sin(lifeRatio * Math.PI) * 0.5;
    });

    // Update enemies
    enemyManager.update(deltaTime);

    // Sort entities by Y position for proper depth
    entityLayer.children.sort((a, b) => a.y - b.y);
  });

  return { 
    app, 
    hero, 
    enemyManager,
    worldContainer,
    uiLayer,
    effectLayer,
    lightingLayer 
  };
}