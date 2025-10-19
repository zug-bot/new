// assetLoader.js
// Smart asset loader that creates placeholder sprites when files are missing

import * as PIXI from 'pixi.js';

export class AssetLoader {
  static async loadAssets(assetMap) {
    const loadedAssets = {};
    
    for (const [key, path] of Object.entries(assetMap)) {
      try {
        // Try to load the actual asset
        const texture = await PIXI.Assets.load(path);
        loadedAssets[key] = texture;
      } catch (error) {
        console.warn(`Failed to load ${path}, creating placeholder`);
        // Create placeholder based on asset type
        loadedAssets[key] = this.createPlaceholder(key);
      }
    }
    
    return loadedAssets;
  }
  
  static createPlaceholder(assetName) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    switch (assetName) {
      case 'hero':
        return this.createCharacterSprite(canvas, ctx, '#4488ff', 'H');
        
      case 'goblin':
        return this.createCharacterSprite(canvas, ctx, '#00aa00', 'G');
        
      case 'samurai':
        return this.createCharacterSprite(canvas, ctx, '#aa0000', 'S');
        
      case 'ninja':
        return this.createCharacterSprite(canvas, ctx, '#333333', 'N');
        
      case 'tile':
        return this.createIsometricTile(canvas, ctx);
        
      case 'bg':
        return this.createBackground(canvas, ctx);
        
      case 'light':
        return this.createLightGlow(canvas, ctx);
        
      case 'shadow':
        return this.createShadowBlob(canvas, ctx);
        
      default:
        return this.createDefaultPlaceholder(canvas, ctx);
    }
  }
  
  static createCharacterSprite(canvas, ctx, color, letter) {
    canvas.width = 64;
    canvas.height = 96;
    
    // Body
    ctx.fillStyle = color;
    ctx.fillRect(16, 32, 32, 48);
    
    // Head
    ctx.beginPath();
    ctx.arc(32, 24, 16, 0, Math.PI * 2);
    ctx.fill();
    
    // Arms
    ctx.fillRect(8, 40, 8, 24);
    ctx.fillRect(48, 40, 8, 24);
    
    // Legs
    ctx.fillRect(20, 80, 8, 16);
    ctx.fillRect(36, 80, 8, 16);
    
    // Letter identifier
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, 32, 24);
    
    // Add some shading
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(32, 32, 16, 48);
    
    return PIXI.Texture.from(canvas);
  }
  
  static createIsometricTile(canvas, ctx) {
    canvas.width = 128;
    canvas.height = 64;
    
    // Draw isometric diamond
    ctx.fillStyle = '#666666';
    ctx.beginPath();
    ctx.moveTo(64, 0);
    ctx.lineTo(128, 32);
    ctx.lineTo(64, 64);
    ctx.lineTo(0, 32);
    ctx.closePath();
    ctx.fill();
    
    // Add highlights
    ctx.fillStyle = '#888888';
    ctx.beginPath();
    ctx.moveTo(64, 0);
    ctx.lineTo(0, 32);
    ctx.lineTo(32, 48);
    ctx.lineTo(64, 32);
    ctx.closePath();
    ctx.fill();
    
    // Add grid lines
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(64, 0);
    ctx.lineTo(128, 32);
    ctx.lineTo(64, 64);
    ctx.lineTo(0, 32);
    ctx.closePath();
    ctx.stroke();
    
    return PIXI.Texture.from(canvas);
  }
  
  static createBackground(canvas, ctx) {
    canvas.width = 800;
    canvas.height = 600;
    
    // Create gradient sky
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);
    
    // Add some "mountains" silhouette
    ctx.fillStyle = '#0a1929';
    ctx.beginPath();
    ctx.moveTo(0, 400);
    ctx.lineTo(200, 300);
    ctx.lineTo(400, 350);
    ctx.lineTo(600, 280);
    ctx.lineTo(800, 400);
    ctx.lineTo(800, 600);
    ctx.lineTo(0, 600);
    ctx.closePath();
    ctx.fill();
    
    // Add some stars
    ctx.fillStyle = 'white';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 800;
      const y = Math.random() * 300;
      const size = Math.random() * 2;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    return PIXI.Texture.from(canvas);
  }
  
  static createLightGlow(canvas, ctx) {
    canvas.width = 256;
    canvas.height = 256;
    
    // Create radial gradient
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 150, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    
    return PIXI.Texture.from(canvas);
  }
  
  static createShadowBlob(canvas, ctx) {
    canvas.width = 64;
    canvas.height = 32;
    
    // Create elliptical shadow
    const gradient = ctx.createRadialGradient(32, 16, 0, 32, 16, 32);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
    gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 32);
    
    return PIXI.Texture.from(canvas);
  }
  
  static createDefaultPlaceholder(canvas, ctx) {
    canvas.width = 64;
    canvas.height = 64;
    
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MISSING', 32, 32);
    
    return PIXI.Texture.from(canvas);
  }
}