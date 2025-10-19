// Advanced rendering system for 2.5D isometric game
class IsometricRenderer {
    constructor(app) {
        this.app = app;
        this.lightingSystem = new LightingSystem(app);
        this.particleSystem = new ParticleSystem(app);
        this.postProcessing = new PostProcessing(app);
    }
    
    createIsometricSprite(texture, x = 0, y = 0) {
        const sprite = new PIXI.Sprite(texture);
        sprite.anchor.set(0.5, 1); // Bottom-center anchor for isometric sprites
        sprite.x = x;
        sprite.y = y;
        return sprite;
    }
    
    createIsometricTile(texture, gridX, gridY, tileSize = 64) {
        const sprite = new PIXI.Sprite(texture);
        sprite.anchor.set(0.5, 1);
        
        // Convert grid coordinates to isometric screen coordinates
        const isoX = (gridX - gridY) * (tileSize / 2);
        const isoY = (gridX + gridY) * (tileSize / 4);
        
        sprite.x = isoX;
        sprite.y = isoY;
        
        return sprite;
    }
    
    createShadowSprite(width, height, alpha = 0.3) {
        const shadow = new PIXI.Graphics();
        shadow.beginFill(0x000000, alpha);
        shadow.drawEllipse(0, 0, width, height);
        shadow.endFill();
        return shadow;
    }
    
    createLightCone(x, y, radius, color = 0xFFB366, intensity = 0.6) {
        const light = new PIXI.Graphics();
        
        // Create radial gradient effect
        const gradient = light.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(${(color >> 16) & 0xFF}, ${(color >> 8) & 0xFF}, ${color & 0xFF}, ${intensity})`);
        gradient.addColorStop(0.5, `rgba(${(color >> 16) & 0xFF}, ${(color >> 8) & 0xFF}, ${color & 0xFF}, ${intensity * 0.5})`);
        gradient.addColorStop(1, `rgba(${(color >> 16) & 0xFF}, ${(color >> 8) & 0xFF}, ${color & 0xFF}, 0)`);
        
        light.beginFill(color, intensity);
        light.drawCircle(x, y, radius);
        light.endFill();
        
        return light;
    }
}

// Advanced lighting system
class LightingSystem {
    constructor(app) {
        this.app = app;
        this.lights = [];
        this.ambientColor = 0x1a1a2e;
        this.ambientIntensity = 0.3;
        
        this.setupLightingLayers();
    }
    
    setupLightingLayers() {
        // Create lighting container
        this.lightingContainer = new PIXI.Container();
        this.app.stage.addChild(this.lightingContainer);
        
        // Create ambient light overlay
        this.ambientOverlay = new PIXI.Graphics();
        this.ambientOverlay.beginFill(this.ambientColor, this.ambientIntensity);
        this.ambientOverlay.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
        this.ambientOverlay.endFill();
        this.lightingContainer.addChild(this.ambientOverlay);
    }
    
    addLight(x, y, radius, color, intensity = 0.8, flicker = false) {
        const light = {
            x: x,
            y: y,
            radius: radius,
            color: color,
            intensity: intensity,
            flicker: flicker,
            baseIntensity: intensity,
            sprite: this.createLightSprite(x, y, radius, color, intensity)
        };
        
        this.lights.push(light);
        this.lightingContainer.addChild(light.sprite);
        
        return light;
    }
    
    createLightSprite(x, y, radius, color, intensity) {
        const light = new PIXI.Graphics();
        
        // Create multiple circles for better light falloff
        for (let i = 0; i < 3; i++) {
            const alpha = intensity * (1 - i * 0.3);
            const r = radius * (1 - i * 0.2);
            
            light.beginFill(color, alpha);
            light.drawCircle(x, y, r);
            light.endFill();
        }
        
        return light;
    }
    
    update() {
        this.lights.forEach(light => {
            if (light.flicker) {
                const flickerAmount = Math.sin(Date.now() * 0.005) * 0.2 + 0.8;
                light.intensity = light.baseIntensity * flickerAmount;
                light.sprite.alpha = light.intensity;
            }
        });
    }
    
    removeLight(light) {
        const index = this.lights.indexOf(light);
        if (index > -1) {
            this.lights.splice(index, 1);
            this.lightingContainer.removeChild(light.sprite);
        }
    }
}

// Particle system for effects
class ParticleSystem {
    constructor(app) {
        this.app = app;
        this.particles = [];
        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container);
    }
    
    createParticle(x, y, type = 'spark') {
        const particle = new PIXI.Graphics();
        
        switch (type) {
            case 'spark':
                particle.beginFill(0xFFD700);
                particle.drawCircle(0, 0, 2);
                particle.endFill();
                break;
            case 'smoke':
                particle.beginFill(0x666666, 0.5);
                particle.drawCircle(0, 0, 4);
                particle.endFill();
                break;
            case 'blood':
                particle.beginFill(0x8B0000);
                particle.drawCircle(0, 0, 3);
                particle.endFill();
                break;
        }
        
        particle.x = x;
        particle.y = y;
        
        const particleData = {
            sprite: particle,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 60,
            maxLife: 60,
            type: type
        };
        
        this.particles.push(particleData);
        this.container.addChild(particle);
        
        return particleData;
    }
    
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.sprite.x += particle.vx;
            particle.sprite.y += particle.vy;
            particle.life--;
            
            // Apply gravity to sparks
            if (particle.type === 'spark') {
                particle.vy += 0.1;
            }
            
            // Fade out
            particle.sprite.alpha = particle.life / particle.maxLife;
            
            if (particle.life <= 0) {
                this.container.removeChild(particle.sprite);
                this.particles.splice(i, 1);
            }
        }
    }
}

// Post-processing effects
class PostProcessing {
    constructor(app) {
        this.app = app;
        this.filters = [];
        this.setupFilters();
    }
    
    setupFilters() {
        // Add blur filter for depth of field effect
        this.blurFilter = new PIXI.filters.BlurFilter();
        this.blurFilter.blur = 0;
        
        // Add color matrix filter for mood
        this.colorMatrixFilter = new PIXI.filters.ColorMatrixFilter();
        this.colorMatrixFilter.brightness(0.8);
        this.colorMatrixFilter.contrast(1.1);
        
        this.filters = [this.blurFilter, this.colorMatrixFilter];
    }
    
    applyFilters(container) {
        container.filters = this.filters;
    }
    
    update() {
        // Update filters based on game state
        const time = Date.now() * 0.001;
        this.blurFilter.blur = Math.sin(time) * 0.5;
    }
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { IsometricRenderer, LightingSystem, ParticleSystem, PostProcessing };
}