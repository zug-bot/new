import * as PIXI from 'pixi.js';

export class LightingSystem {
  container: PIXI.Container;
  overlay: PIXI.Graphics;
  lightsLayer: PIXI.Container;
  worldWidth: number;
  worldHeight: number;

  constructor(worldWidthPx: number, worldHeightPx: number) {
    this.worldWidth = worldWidthPx;
    this.worldHeight = worldHeightPx;
    this.container = new PIXI.Container();

    // Ambient darkness overlay using multiply
    this.overlay = new PIXI.Graphics();
    this.overlay.beginFill(0x0b0d12, 0.85);
    this.overlay.drawRect(-worldWidthPx, -worldHeightPx, worldWidthPx * 3, worldHeightPx * 3);
    this.overlay.endFill();
    this.overlay.blendMode = PIXI.BLEND_MODES.MULTIPLY;

    this.lightsLayer = new PIXI.Container();

    this.container.addChild(this.overlay);
    this.container.addChild(this.lightsLayer);
  }

  createRadialLight(radius: number, intensity = 1, color = 0xfff1c1): PIXI.Sprite {
    const g = new PIXI.Graphics();
    const steps = 32;
    for (let i = steps; i >= 1; i--) {
      const t = i / steps;
      const r = Math.max(1, radius * t);
      const a = Math.pow(t, 2) * 0.9 * intensity; // falloff
      g.beginFill(color, a);
      g.drawCircle(0, 0, r);
      g.endFill();
    }
    const tex = g.generateCanvasTexture();
    const s = new PIXI.Sprite(tex);
    s.anchor.set(0.5);
    s.blendMode = PIXI.BLEND_MODES.ADD;
    return s;
  }

  addLight(light: PIXI.Sprite): void {
    this.lightsLayer.addChild(light);
  }
}
