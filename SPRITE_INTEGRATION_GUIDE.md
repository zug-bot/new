# Sprite Integration Guide

This guide explains how to integrate the character sprites from your image into the game.

## Quick Start

1. **Save the sprite sheet image** as `public/assets/sprites/characters/characters_full_sheet.png`

2. **Extract individual character sheets** (optional but recommended):
   - Each character variant should be saved as a separate PNG
   - Name them: `knight_blue.png`, `knight_green.png`, `knight_red.png`, etc.

3. **The system is already set up** to handle animated sprites with:
   - `spriteAnimator.js` - Handles sprite animation playback
   - `CharacterController` - Manages character states and animations
   - Updated `renderer.js` - Integrates the animation system

## Sprite Sheet Layout (from your image)

The sprite sheet contains multiple character variants with different:
- **Hair colors**: Blonde, brown, dark, red, light
- **Armor colors**: Blue, gray/silver, green, red
- **Animation states**: Walk (8 directions), idle, attack, block, death

### Frame Organization:
```
Row 1-2: Walking animations (all 8 directions)
Row 3-4: Idle and combat animations  
Row 5-6: Sitting/mounted positions
Row 7-8: Additional states and items
```

## Creating Sprite Sheet JSON

Use the provided utility to generate JSON configurations:

```javascript
node processSpriteSheet.js > public/assets/sprites/characters/knight_spritesheet.json
```

Or manually create a JSON file following this structure:

```json
{
  "frames": {
    "knight_idle_0": {
      "frame": {"x": 0, "y": 0, "w": 32, "h": 48},
      "sourceSize": {"w": 32, "h": 48}
    }
    // ... more frames
  },
  "animations": {
    "idle": ["knight_idle_0", "knight_idle_1", "knight_idle_2"],
    "walk": ["knight_walk_0", "knight_walk_1", "knight_walk_2", "knight_walk_3"],
    "attack": ["knight_attack_0", "knight_attack_1", "knight_attack_2"]
  },
  "meta": {
    "image": "knight_spritesheet.png"
  }
}
```

## Animation System Features

### Character Controller
- **Movement**: WASD or Arrow keys
- **Attack**: Space bar
- **Auto-animation**: Character automatically plays appropriate animations
- **Direction support**: Sprite flips based on movement direction

### Available Animations
- `idle` - Standing still animation
- `walk` - Walking animation (plays during movement)
- `attack` - Attack animation (triggered by Space)

### Adding New Animations

1. Add frames to the sprite sheet JSON
2. Add animation name and frame list to the "animations" section
3. Update `CharacterController` to handle the new state

Example:
```javascript
// In CharacterController.update()
if (this.isBlocking) {
  this.animator.play('block');
}
```

## Testing

1. Place your sprite sheet in `public/assets/sprites/characters/`
2. Ensure the JSON configuration matches your sprite sheet
3. Run the game: `npm run dev`
4. The character should animate based on your input

## Troubleshooting

- **Character not animating**: Check browser console for errors loading the sprite sheet
- **Wrong frames showing**: Verify frame coordinates in the JSON match your sprite sheet
- **Animation too fast/slow**: Adjust `animationSpeed` in `SpriteAnimator` constructor

## Next Steps

1. Add enemy sprites using the same system
2. Implement directional animations (8-way movement)
3. Add special effects and particle animations
4. Create equipment overlay sprites