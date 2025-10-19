// processSpriteSheet.js
// Utility to generate sprite sheet JSON configurations

export function generateSpriteSheetConfig(options) {
  const {
    sheetName = 'character',
    frameWidth = 32,
    frameHeight = 48,
    columns = 8,
    rows = 8,
    animations = {}
  } = options;
  
  const frames = {};
  const animationData = {};
  
  // Generate frame data
  let frameIndex = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const frameName = `${sheetName}_${frameIndex}`;
      frames[frameName] = {
        frame: {
          x: col * frameWidth,
          y: row * frameHeight,
          w: frameWidth,
          h: frameHeight
        },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: frameWidth, h: frameHeight },
        sourceSize: { w: frameWidth, h: frameHeight }
      };
      frameIndex++;
    }
  }
  
  // Generate animation sequences
  for (const [animName, config] of Object.entries(animations)) {
    const { startFrame, frameCount } = config;
    const animFrames = [];
    for (let i = 0; i < frameCount; i++) {
      animFrames.push(`${sheetName}_${startFrame + i}`);
    }
    animationData[animName] = animFrames;
  }
  
  return {
    frames,
    animations: animationData,
    meta: {
      app: "isometric-souls",
      version: "1.0",
      image: `${sheetName}_spritesheet.png`,
      format: "RGBA8888",
      size: { w: columns * frameWidth, h: rows * frameHeight },
      scale: "1"
    }
  };
}

// Example configuration for the knight character based on the sprite sheet
export const knightAnimationConfig = {
  sheetName: 'knight',
  frameWidth: 32,
  frameHeight: 48,
  columns: 8,
  rows: 12,
  animations: {
    // Idle animations (assuming first row)
    idle_down: { startFrame: 0, frameCount: 3 },
    idle_right: { startFrame: 8, frameCount: 3 },
    idle_up: { startFrame: 16, frameCount: 3 },
    idle_left: { startFrame: 24, frameCount: 3 },
    
    // Walking animations (rows 2-3)
    walk_down: { startFrame: 32, frameCount: 4 },
    walk_downright: { startFrame: 36, frameCount: 4 },
    walk_right: { startFrame: 40, frameCount: 4 },
    walk_upright: { startFrame: 44, frameCount: 4 },
    walk_up: { startFrame: 48, frameCount: 4 },
    walk_upleft: { startFrame: 52, frameCount: 4 },
    walk_left: { startFrame: 56, frameCount: 4 },
    walk_downleft: { startFrame: 60, frameCount: 4 },
    
    // Combat animations
    attack: { startFrame: 64, frameCount: 4 },
    block: { startFrame: 68, frameCount: 2 },
    hurt: { startFrame: 70, frameCount: 2 },
    death: { startFrame: 72, frameCount: 4 }
  }
};

// Generate and save the configuration
if (import.meta.url === `file://${process.argv[1]}`) {
  const config = generateSpriteSheetConfig(knightAnimationConfig);
  console.log(JSON.stringify(config, null, 2));
}