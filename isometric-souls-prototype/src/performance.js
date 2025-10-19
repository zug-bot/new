// performance.js
// Performance optimization utilities

export class PerformanceMonitor {
  constructor() {
    this.fps = 60;
    this.frameTime = 16.67;
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.fpsHistory = [];
    this.maxHistoryLength = 60;
  }
  
  update() {
    const currentTime = performance.now();
    this.frameTime = currentTime - this.lastTime;
    this.fps = 1000 / this.frameTime;
    this.lastTime = currentTime;
    
    this.fpsHistory.push(this.fps);
    if (this.fpsHistory.length > this.maxHistoryLength) {
      this.fpsHistory.shift();
    }
    
    this.frameCount++;
  }
  
  getAverageFPS() {
    if (this.fpsHistory.length === 0) return 0;
    return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
  }
  
  isPerformanceGood() {
    return this.getAverageFPS() > 45;
  }
}

export class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    this.active = [];
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }
  
  get() {
    let obj;
    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else {
      obj = this.createFn();
    }
    this.active.push(obj);
    return obj;
  }
  
  release(obj) {
    const index = this.active.indexOf(obj);
    if (index > -1) {
      this.active.splice(index, 1);
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }
  
  releaseAll() {
    while (this.active.length > 0) {
      this.release(this.active[0]);
    }
  }
  
  getActiveCount() {
    return this.active.length;
  }
  
  getPoolSize() {
    return this.pool.length;
  }
}

export class ParticlePool extends ObjectPool {
  constructor(container, initialSize = 50) {
    super(
      () => {
        const particle = new PIXI.Graphics();
        container.addChild(particle);
        return particle;
      },
      (particle) => {
        particle.clear();
        particle.visible = false;
        particle.alpha = 1;
        particle.scale.set(1);
        particle.rotation = 0;
        particle.x = 0;
        particle.y = 0;
      },
      initialSize
    );
  }
}

export class PerformanceOptimizer {
  constructor(app) {
    this.app = app;
    this.monitor = new PerformanceMonitor();
    this.adaptiveQuality = true;
    this.targetFPS = 60;
    this.qualityLevel = 1.0; // 0.5 to 1.0
    
    this.setupOptimizations();
  }
  
  setupOptimizations() {
    // Enable PixiJS optimizations
    this.app.renderer.plugins.interaction.autoPreventDefault = false;
    this.app.renderer.plugins.interaction.interactionFrequency = 10;
    
    // Optimize ticker
    this.app.ticker.maxFPS = 60;
    this.app.ticker.minFPS = 30;
  }
  
  update() {
    this.monitor.update();
    
    if (this.adaptiveQuality) {
      this.adjustQuality();
    }
  }
  
  adjustQuality() {
    const avgFPS = this.monitor.getAverageFPS();
    
    if (avgFPS < this.targetFPS * 0.8) {
      // Performance is poor, reduce quality
      this.qualityLevel = Math.max(0.5, this.qualityLevel - 0.05);
      this.applyQualitySettings();
    } else if (avgFPS > this.targetFPS * 0.95) {
      // Performance is good, increase quality
      this.qualityLevel = Math.min(1.0, this.qualityLevel + 0.02);
      this.applyQualitySettings();
    }
  }
  
  applyQualitySettings() {
    // Adjust particle count based on quality
    const particleMultiplier = this.qualityLevel;
    
    // Adjust lighting quality
    const lightingQuality = this.qualityLevel;
    
    // Adjust animation smoothness
    const animationSmoothness = this.qualityLevel;
    
    // Store settings for other systems to use
    this.settings = {
      particleMultiplier,
      lightingQuality,
      animationSmoothness
    };
  }
  
  getSettings() {
    return this.settings || {
      particleMultiplier: 1.0,
      lightingQuality: 1.0,
      animationSmoothness: 1.0
    };
  }
  
  getFPS() {
    return this.monitor.fps;
  }
  
  getAverageFPS() {
    return this.monitor.getAverageFPS();
  }
  
  isPerformanceGood() {
    return this.monitor.isPerformanceGood();
  }
}

export class MemoryManager {
  constructor() {
    this.textureCache = new Map();
    this.soundCache = new Map();
    this.maxCacheSize = 50;
  }
  
  cacheTexture(key, texture) {
    if (this.textureCache.size >= this.maxCacheSize) {
      // Remove oldest texture
      const firstKey = this.textureCache.keys().next().value;
      this.textureCache.delete(firstKey);
    }
    this.textureCache.set(key, texture);
  }
  
  getCachedTexture(key) {
    return this.textureCache.get(key);
  }
  
  clearCache() {
    this.textureCache.clear();
    this.soundCache.clear();
  }
  
  getCacheSize() {
    return this.textureCache.size;
  }
}

export class BatchRenderer {
  constructor() {
    this.batches = new Map();
  }
  
  addToBatch(batchKey, object) {
    if (!this.batches.has(batchKey)) {
      this.batches.set(batchKey, []);
    }
    this.batches.get(batchKey).push(object);
  }
  
  renderBatch(batchKey, renderFn) {
    const batch = this.batches.get(batchKey);
    if (batch) {
      batch.forEach(renderFn);
    }
  }
  
  clearBatch(batchKey) {
    if (this.batches.has(batchKey)) {
      this.batches.get(batchKey).length = 0;
    }
  }
  
  clearAllBatches() {
    this.batches.clear();
  }
}