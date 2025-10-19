// This file contains methods to create better placeholder sprites
// Until real assets are found, these will make the game look more polished

export function createCharacterSprite(scene, type = 'hero') {
    const canvas = scene.textures.createCanvas(`${type}-sprite`, 48, 64);
    const context = canvas.getContext();
    
    // Base colors
    const colors = {
        hero: { primary: '#4444ff', secondary: '#6666ff', accent: '#aaaaff' },
        enemy: { primary: '#ff4444', secondary: '#ff6666', accent: '#ffaaaa' },
        boss: { primary: '#aa00aa', secondary: '#cc00cc', accent: '#ff00ff' }
    };
    
    const color = colors[type] || colors.hero;
    
    // Draw character
    context.fillStyle = color.primary;
    // Body
    context.fillRect(16, 24, 16, 20);
    // Head
    context.fillRect(18, 12, 12, 12);
    // Arms
    context.fillRect(12, 26, 4, 12);
    context.fillRect(32, 26, 4, 12);
    // Legs
    context.fillRect(18, 44, 6, 12);
    context.fillRect(24, 44, 6, 12);
    
    // Add details
    context.fillStyle = color.secondary;
    context.fillRect(18, 26, 12, 4); // Chest detail
    context.fillRect(20, 16, 8, 4); // Face area
    
    // Add highlights
    context.fillStyle = color.accent;
    context.fillRect(22, 18, 4, 2); // Eyes
    context.fillRect(20, 28, 8, 2); // Belt
    
    canvas.refresh();
    return canvas;
}

export function createTileSprite(scene, type = 'floor') {
    const canvas = scene.textures.createCanvas(`${type}-tile`, 64, 32);
    const context = canvas.getContext();
    
    if (type === 'floor') {
        // Isometric floor tile
        context.strokeStyle = '#666666';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(32, 0);
        context.lineTo(64, 16);
        context.lineTo(32, 32);
        context.lineTo(0, 16);
        context.closePath();
        context.stroke();
        
        // Add some texture
        context.fillStyle = '#444444';
        context.fill();
        
        // Add detail lines
        context.strokeStyle = '#555555';
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(16, 8);
        context.lineTo(48, 8);
        context.moveTo(16, 24);
        context.lineTo(48, 24);
        context.stroke();
    } else if (type === 'wall') {
        // Isometric wall tile
        context.fillStyle = '#666666';
        context.fillRect(0, 0, 64, 48);
        
        // Add depth
        context.fillStyle = '#555555';
        context.fillRect(0, 0, 64, 4);
        context.fillRect(0, 0, 4, 48);
        
        // Add highlight
        context.fillStyle = '#777777';
        context.fillRect(4, 4, 56, 2);
        context.fillRect(4, 4, 2, 40);
    }
    
    canvas.refresh();
    return canvas;
}

export function createEffectSprite(scene, type = 'slash') {
    const size = 64;
    const canvas = scene.textures.createCanvas(`${type}-effect`, size, size);
    const context = canvas.getContext();
    
    context.strokeStyle = '#ffffff';
    context.lineWidth = 3;
    context.lineCap = 'round';
    
    if (type === 'slash') {
        // Curved slash effect
        context.beginPath();
        context.arc(size/2, size/2, size/3, -Math.PI/4, Math.PI/4);
        context.stroke();
        
        // Add motion blur
        context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        context.lineWidth = 5;
        context.beginPath();
        context.arc(size/2, size/2, size/3 - 3, -Math.PI/4 + 0.1, Math.PI/4 - 0.1);
        context.stroke();
    } else if (type === 'impact') {
        // Impact burst
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            context.beginPath();
            context.moveTo(size/2, size/2);
            context.lineTo(
                size/2 + Math.cos(angle) * size/3,
                size/2 + Math.sin(angle) * size/3
            );
            context.stroke();
        }
    }
    
    canvas.refresh();
    return canvas;
}

// Asset sourcing guide
export const ASSET_SOURCES = {
    sprites: [
        {
            name: "itch.io - 2D Isometric Assets",
            url: "https://itch.io/game-assets/tag-isometric/tag-pixel-art",
            license: "Varies - check individual assets"
        },
        {
            name: "OpenGameArt - Isometric",
            url: "https://opengameart.org/art-search-advanced?field_art_type_tid%5B%5D=9",
            license: "Various open licenses"
        },
        {
            name: "Kenney - Isometric Assets",
            url: "https://kenney.nl/assets?q=isometric",
            license: "CC0 - Free to use"
        }
    ],
    
    searchTerms: [
        "isometric pixel art character",
        "2.5d rpg sprites",
        "triangle strategy style sprites",
        "octopath traveler inspired pixel art",
        "isometric dungeon tiles",
        "pixel art sword slash effect",
        "isometric character sprites"
    ],
    
    tips: [
        "Look for sprite sheets with multiple animation frames",
        "Ensure sprites match the 2:1 isometric ratio",
        "Check license requirements for attribution",
        "Consider color palette consistency",
        "Download both character and environment assets from same pack for consistency"
    ]
};