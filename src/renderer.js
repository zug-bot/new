import * as PIXI from 'pixi.js';

export class IsoRenderer {
  constructor(app) {
    this.app = app;
    this.stage = new PIXI.Container();
    this.groundLayer = new PIXI.Container();
    this.entityLayer = new PIXI.Container();
    this.fxLayer = new PIXI.Container();

    this.stage.addChild(this.groundLayer, this.entityLayer, this.fxLayer);

    this.camera = { x: 0, y: 0, rotationIndex: 0 };
    this.tileSize = { w: 64, h: 32 }; // classic isometric diamond ratio

    app.stage.addChild(this.stage);
  }

  applyRotation(ix, iy) {
    const r = this.camera.rotationIndex % 4;
    if (r === 0) return { x: ix, y: iy };
    if (r === 1) return { x: iy, y: -ix };
    if (r === 2) return { x: -ix, y: -iy };
    return { x: -iy, y: ix }; // r === 3
  }

  screenFromIso(ix, iy, iz = 0) {
    const { w, h } = this.tileSize;
    const rotated = this.applyRotation(ix, iy);
    // 2:1 diamond projection
    const sx = (rotated.x - rotated.y) * (w / 2);
    const sy = (rotated.x + rotated.y) * (h / 2) - iz;
    return { x: sx - this.camera.x, y: sy - this.camera.y };
  }

  rotate(dir) {
    // four-way rotations (0..3)
    this.camera.rotationIndex = (this.camera.rotationIndex + (dir > 0 ? 1 : -1) + 4) % 4;
  }

  worldToStage(x, y) {
    this.stage.x = this.app.renderer.width / 2 + x;
    this.stage.y = this.app.renderer.height / 3 + y;
  }

  sortEntitiesByDepth() {
    // Sort by y to simulate depth; entities store last projected y
    this.entityLayer.children.sort((a, b) => (a.depthY || 0) - (b.depthY || 0));
  }

  drawIsoTile(ix, iy, color = 0x1f2937, outline = 0x111827) {
    const p = this.screenFromIso(ix, iy, 0);
    const g = new PIXI.Graphics();
    const { w, h } = this.tileSize;
    g.x = p.x; g.y = p.y;
    g.lineStyle({ width: 1, color: outline, alpha: 0.6 });
    g.beginFill(color, 1.0);
    g.moveTo(0, 0);
    g.lineTo(w / 2, h / 2);
    g.lineTo(0, h);
    g.lineTo(-w / 2, h / 2);
    g.closePath();
    g.endFill();
    this.groundLayer.addChild(g);
    return g;
  }
}
