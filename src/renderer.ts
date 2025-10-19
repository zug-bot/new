import * as PIXI from 'pixi.js';
import { TILE_HEIGHT, TILE_WIDTH, isoToScreen } from './isoutils';

export class WorldRenderer {
  container: PIXI.Container;
  ground: PIXI.Container;
  entities: PIXI.Container;
  overlay: PIXI.Container;

  mapWidth: number;
  mapHeight: number;

  constructor(mapW: number, mapH: number) {
    this.mapWidth = mapW;
    this.mapHeight = mapH;

    this.container = new PIXI.Container();
    this.ground = new PIXI.Container();
    this.entities = new PIXI.Container();
    this.overlay = new PIXI.Container();

    this.container.addChild(this.ground);
    this.container.addChild(this.entities);
    this.container.addChild(this.overlay);

    this.drawIsometricFloor();
  }

  drawIsometricFloor(): void {
    const tileW = TILE_WIDTH;
    const tileH = TILE_HEIGHT;

    const g = new PIXI.Graphics();

    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const sx = (x - y) * (tileW / 2);
        const sy = (x + y) * (tileH / 2);
        const color = (x + y) % 2 === 0 ? 0x1d2430 : 0x1a202c;
        g.beginFill(color);
        g.lineStyle(1, 0x2a3442, 0.6);
        g.moveTo(sx, sy);
        g.lineTo(sx + tileW / 2, sy + tileH / 2);
        g.lineTo(sx, sy + tileH);
        g.lineTo(sx - tileW / 2, sy + tileH / 2);
        g.closePath();
        g.endFill();
      }
    }

    // grid accent lines
    g.lineStyle(1, 0x334155, 0.4);
    for (let x = 0; x <= this.mapWidth; x++) {
      const p1 = isoToScreen({ x, y: 0 });
      const p2 = isoToScreen({ x, y: this.mapHeight });
      g.moveTo(p1.x, p1.y);
      g.lineTo(p2.x, p2.y);
    }
    for (let y = 0; y <= this.mapHeight; y++) {
      const p1 = isoToScreen({ x: 0, y });
      const p2 = isoToScreen({ x: this.mapWidth, y });
      g.moveTo(p1.x, p1.y);
      g.lineTo(p2.x, p2.y);
    }

    this.ground.addChild(g);
  }
}
