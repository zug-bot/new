export default class IsometricEngine {
    constructor(scene) {
        this.scene = scene;
        this.tileWidth = 64;
        this.tileHeight = 32;
        this.tileDepth = 16;
    }

    // Convert world coordinates to isometric screen coordinates
    worldToScreen(x, y, z = 0) {
        const screenX = (x - y) * (this.tileWidth / 2);
        const screenY = (x + y) * (this.tileHeight / 2) - (z * this.tileDepth);
        return { x: screenX, y: screenY };
    }

    // Convert screen coordinates to world coordinates
    screenToWorld(screenX, screenY) {
        const x = (screenX / (this.tileWidth / 2) + screenY / (this.tileHeight / 2)) / 2;
        const y = (screenY / (this.tileHeight / 2) - screenX / (this.tileWidth / 2)) / 2;
        return { x: Math.floor(x), y: Math.floor(y) };
    }

    // Get depth for proper sprite sorting
    getDepth(x, y, z = 0) {
        return (x + y) * 10 + z;
    }

    // Create isometric sprite
    createIsoSprite(x, y, z, texture, frame) {
        const screenPos = this.worldToScreen(x, y, z);
        const sprite = this.scene.add.sprite(screenPos.x, screenPos.y, texture, frame);
        sprite.setDepth(this.getDepth(x, y, z));
        sprite.isoX = x;
        sprite.isoY = y;
        sprite.isoZ = z;
        return sprite;
    }

    // Update sprite position
    updateSpritePosition(sprite, x, y, z) {
        const screenPos = this.worldToScreen(x, y, z);
        sprite.x = screenPos.x;
        sprite.y = screenPos.y;
        sprite.setDepth(this.getDepth(x, y, z));
        sprite.isoX = x;
        sprite.isoY = y;
        sprite.isoZ = z;
    }
}