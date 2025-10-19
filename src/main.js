import Phaser from 'phaser';
import GameConfig from './config/GameConfig.js';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';

class Game extends Phaser.Game {
    constructor() {
        super(GameConfig);
        
        // Add scenes
        this.scene.add('BootScene', BootScene);
        this.scene.add('PreloadScene', PreloadScene);
        this.scene.add('GameScene', GameScene);
        this.scene.add('UIScene', UIScene);
        
        // Start with boot scene
        this.scene.start('BootScene');
    }
}

// Wait for DOM to be ready
window.addEventListener('load', () => {
    // Remove loading text
    const loading = document.querySelector('.loading');
    if (loading) loading.remove();
    
    // Start the game
    window.game = new Game();
});