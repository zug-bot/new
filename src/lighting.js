import * as PIXI from 'pixi.js';

export function createShadowBlob(radius = 20, alpha = 0.4) {
  const g = new PIXI.Graphics();
  g.beginFill(0x000000, alpha);
  g.drawEllipse(0, 0, radius, radius * 0.6);
  g.endFill();
  g.filters = [new PIXI.BlurFilter(4)];
  return g;
}

export function createRadialLight(radius = 140, color = 0xfff1c2, strength = 0.6) {
  const container = new PIXI.Container();
  const g = new PIXI.Graphics();

  const steps = 16;
  for (let i = steps; i >= 1; i--) {
    const t = i / steps;
    const a = strength * t * t;
    g.beginFill(color, a);
    g.drawCircle(0, 0, radius * t);
    g.endFill();
  }
  container.addChild(g);
  container.blendMode = PIXI.BLEND_MODES.ADD;
  container.alpha = 0.9;
  return container;
}
