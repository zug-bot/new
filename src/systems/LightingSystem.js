export default class LightingSystem {
    constructor(scene) {
        this.scene = scene;
        this.lights = [];
        
        // Create darkness overlay
        this.darkness = scene.add.rectangle(
            scene.cameras.main.centerX,
            scene.cameras.main.centerY,
            scene.cameras.main.width * 2,
            scene.cameras.main.height * 2,
            0x000033,
            0.7
        );
        this.darkness.setDepth(900);
        this.darkness.setScrollFactor(0);
        
        // Create render texture for lights
        this.lightRT = scene.add.renderTexture(0, 0, scene.cameras.main.width, scene.cameras.main.height);
        this.lightRT.setDepth(901);
        this.lightRT.setScrollFactor(0);
        this.lightRT.setBlendMode(Phaser.BlendModes.ADD);
    }

    addLight(x, y, radius, color = 0xffffff, intensity = 0.5) {
        const light = {
            x: x,
            y: y,
            radius: radius,
            color: color,
            intensity: intensity,
            flicker: Math.random() * 0.1,
            flickerSpeed: 2 + Math.random() * 2
        };
        
        this.lights.push(light);
        return light;
    }

    removeLight(light) {
        const index = this.lights.indexOf(light);
        if (index > -1) {
            this.lights.splice(index, 1);
        }
    }

    update() {
        // Clear the render texture
        this.lightRT.clear();
        
        const camera = this.scene.cameras.main;
        const time = this.scene.time.now;
        
        // Draw each light
        this.lights.forEach(light => {
            // Calculate screen position relative to camera
            const screenX = light.x - camera.scrollX;
            const screenY = light.y - camera.scrollY;
            
            // Add flicker effect
            const flicker = Math.sin(time * 0.001 * light.flickerSpeed) * light.flicker;
            const currentRadius = light.radius * (1 + flicker);
            const currentIntensity = light.intensity * (1 + flicker * 0.5);
            
            // Create gradient light effect
            const graphics = this.scene.add.graphics();
            
            // Draw multiple circles for gradient effect
            const steps = 5;
            for (let i = 0; i < steps; i++) {
                const ratio = 1 - (i / steps);
                const alpha = currentIntensity * ratio * ratio;
                const radius = currentRadius * ratio;
                
                graphics.fillStyle(light.color, alpha);
                graphics.fillCircle(screenX, screenY, radius);
            }
            
            // Draw to render texture
            this.lightRT.draw(graphics);
            graphics.destroy();
        });
        
        // Add some ambient light variation
        const ambientPulse = Math.sin(time * 0.0005) * 0.05;
        this.darkness.setAlpha(0.7 - ambientPulse);
    }
}