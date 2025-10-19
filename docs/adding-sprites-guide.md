# Guide to Adding Custom Sprites

## Where to Find Sprites

### Recommended Sources

1. **Spriters Resource** (https://www.spriters-resource.com/)
   - Search for: "isometric", "tactics", "strategy rpg"
   - Look in categories like "Mobile", "PC/Computer", "GBA"

2. **itch.io Asset Packs**
   - Search: "isometric pixel art"
   - Filter by: Game Assets > 2D Assets
   - Many free and paid options

3. **OpenGameArt**
   - Search: "isometric character"
   - All assets are open source

## How to Add Sprites to the Game

### 1. Character Sprites

Place your character sprite sheets in `assets/sprites/` with these naming conventions:
- `hero_idle.png` - Idle animation frames
- `hero_walk.png` - Walking animation frames
- `hero_attack.png` - Attack animation frames
- `enemy_[type]_idle.png` - Enemy sprites

### 2. Update PreloadScene.js

```javascript
// In PreloadScene.js preload() method:
preload() {
    // Load actual sprites instead of creating placeholders
    this.load.spritesheet('hero', 'assets/sprites/hero_sheet.png', {
        frameWidth: 48,
        frameHeight: 64
    });
    
    this.load.spritesheet('enemy', 'assets/sprites/enemy_sheet.png', {
        frameWidth: 48,
        frameHeight: 64
    });
    
    // Load tiles
    this.load.image('floor_tile', 'assets/tiles/floor_tile.png');
    this.load.image('wall_tile', 'assets/tiles/wall_tile.png');
    
    // Load effects
    this.load.image('shadow', 'assets/sprites/shadow.png');
    this.load.spritesheet('effects', 'assets/sprites/effects_sheet.png', {
        frameWidth: 64,
        frameHeight: 64
    });
}
```

### 3. Creating Animations

Add this to your entity classes:

```javascript
// In Player.js or Enemy.js constructor:
createAnimations() {
    this.scene.anims.create({
        key: 'hero_idle',
        frames: this.scene.anims.generateFrameNumbers('hero', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1
    });
    
    this.scene.anims.create({
        key: 'hero_walk',
        frames: this.scene.anims.generateFrameNumbers('hero', { start: 4, end: 11 }),
        frameRate: 12,
        repeat: -1
    });
    
    // Play animation
    this.sprite.play('hero_idle');
}
```

## Sprite Requirements

### Character Sprites
- **Size**: 32x48 to 64x96 pixels (adjust based on your style)
- **Perspective**: 2:1 isometric (26.565° angle)
- **Animations needed**:
  - Idle (4-8 frames)
  - Walk (6-8 frames)
  - Attack (3-4 frames)
  - Hit/Damage (2-3 frames)
  - Death (4-6 frames)

### Tile Sprites
- **Floor tiles**: 64x32 pixels (standard isometric)
- **Wall tiles**: 64x48 or 64x64 pixels
- **Props**: Variable sizes, maintain isometric perspective

### Effect Sprites
- **Slash effects**: 64x64 or larger
- **Impact effects**: 32x32 to 64x64
- **Magic effects**: Variable, use additive blending

## Example Asset Structure

```
assets/
├── sprites/
│   ├── characters/
│   │   ├── hero_sheet.png
│   │   ├── enemy_goblin_sheet.png
│   │   └── boss_knight_sheet.png
│   ├── effects/
│   │   ├── slash_effect.png
│   │   ├── parry_spark.png
│   │   └── death_particles.png
│   └── ui/
│       ├── health_bar_frame.png
│       └── posture_bar_frame.png
├── tiles/
│   ├── dungeon_floor.png
│   ├── dungeon_wall.png
│   └── decorations_sheet.png
└── lights/
    ├── torch_glow.png
    └── crystal_aura.png
```

## Color Palette Matching

To maintain the Triangle Strategy/Octopath aesthetic:

1. **Limit colors**: Use 16-32 colors maximum per sprite
2. **Consistent outlines**: Dark outlines (usually black or dark purple)
3. **Highlight colors**: Add bright highlights for magical/metallic surfaces
4. **Shadow colors**: Use purple/blue tinted shadows, not pure black

## Quick Sprite Creation Tips

If you can't find perfect sprites, you can modify existing ones:

1. **Recolor**: Change hue/saturation to match your palette
2. **Resize**: Scale to proper isometric proportions
3. **Combine**: Mix parts from different sprites
4. **Edit**: Add/remove details to fit your style

Tools for sprite editing:
- Aseprite (paid, best for pixel art)
- GraphicsGale (free)
- Piskel (free, web-based)
- GIMP (free, general purpose)