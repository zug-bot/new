# Sprite Sheet Information

Based on the provided image, the character sprites are organized as follows:

## Character Variants (5 different knights shown at bottom):
1. Male Knight - Blonde hair
2. Male Knight - Brown hair  
3. Male Knight - Dark hair
4. Male Knight - Red hair
5. Male Knight - Light hair

## Color Variations (shown in grid):
- Blue armor (top rows)
- Gray/Silver armor 
- Green armor
- Red armor

## Animation States per character:
Each character has the following animation states in the sprite sheet:

### Walking Animations (8 directions):
- Walk Down (3-4 frames)
- Walk Down-Right (3-4 frames)
- Walk Right (3-4 frames)
- Walk Up-Right (3-4 frames)
- Walk Up (3-4 frames)
- Walk Up-Left (3-4 frames)
- Walk Left (3-4 frames)
- Walk Down-Left (3-4 frames)

### Action Animations:
- Idle (standing still)
- Attack/Slash animation
- Block/Shield animation
- Death/Hurt animation
- Sitting/Mounted position

### Sprite Dimensions:
- Standing character: ~32x48 pixels
- Action frames: ~48x48 pixels (for attack animations)

## To use these sprites:

1. Save the sprite sheet image as `characters_full_sheet.png`
2. Create individual character sheets for each variant
3. Set up animation frames in the JSON configuration
4. Each frame should be extracted at the correct pixel coordinates