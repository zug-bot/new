// engine.js
// Core math & helpers for 2.5D isometric projection and timing.

export const TILE_W = 128;
export const TILE_H = 64;

export function cartToIso(x, y) {
  // Convert cartesian grid coords to isometric screen coords
  const isoX = (x - y) * (TILE_W / 2);
  const isoY = (x + y) * (TILE_H / 2);
  return { x: isoX, y: isoY };
}

export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export class Clock {
  constructor() { this.t = 0; }
  tick(dt) { this.t += dt; }
}
