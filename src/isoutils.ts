export const TILE_WIDTH = 64; // pixels (screen-space width of a diamond)
export const TILE_HEIGHT = 32; // pixels (screen-space height of a diamond)

export type IsoPoint = { x: number; y: number; z?: number };
export type ScreenPoint = { x: number; y: number };

const HALF_W = TILE_WIDTH / 2;
const HALF_H = TILE_HEIGHT / 2;

export function isoToScreen(iso: IsoPoint): ScreenPoint {
  const z = iso.z ?? 0;
  const x = (iso.x - iso.y) * HALF_W;
  const y = (iso.x + iso.y) * HALF_H - z;
  return { x, y };
}

export function screenToIso(screen: ScreenPoint, z = 0): IsoPoint {
  const ix = (screen.y + z) / HALF_H / 2 + screen.x / HALF_W / 2;
  const iy = (screen.y + z) / HALF_H / 2 - screen.x / HALF_W / 2;
  return { x: ix, y: iy, z };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
