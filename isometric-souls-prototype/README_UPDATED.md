# Isometric Souls - Enhanced 2.5D Combat Game

A beautiful 2.5D isometric souls-like game with Sekiro-inspired combat, developed using PixiJS.

## 🎮 Game Features

### Combat System
- **Sekiro-inspired parry mechanics**: Time your blocks perfectly to deflect attacks
- **Posture system**: Break enemy posture for execution opportunities
- **Multiple attack patterns**: Each enemy type has unique combat behaviors
- **Visual combat indicators**: Red danger symbols warn of incoming attacks

### Visual Excellence
- **Dynamic lighting system**: Multiple light sources with real-time effects
- **Particle effects**: Atmospheric floating particles
- **Screen effects**: Camera shake, flash effects on perfect parries
- **Parallax backgrounds**: Multi-layer backgrounds for depth
- **Smart asset loading**: Procedural placeholder generation when assets are missing

### Enemy AI
- **Three enemy types**:
  - Goblin: Basic enemy with moderate stats
  - Samurai: Tough enemy with high health and damage
  - Ninja: Fast enemy with quick attacks
- **State-based AI**: Enemies pursue, attack, and retreat intelligently
- **Dynamic behaviors**: Each enemy type has unique movement and attack patterns

### Game Systems
- **Complete menu system**: Main menu, pause, game over, and victory screens
- **Audio system**: Synthesized sound effects for all combat actions
- **Smooth controls**: Acceleration-based movement with proper isometric constraints
- **Performance monitoring**: Built-in FPS counter

## 🎯 How to Play

### Controls
- **Movement**: WASD or Arrow Keys
- **Attack**: J
- **Block/Parry**: K (hold to block, time perfectly to parry)
- **Pause**: ESC

### Combat Tips
1. Watch for the red 危 (danger) symbol before enemy attacks
2. Press K just before an attack hits to perform a perfect parry
3. Perfect parries deal massive posture damage to enemies
4. Break enemy posture (orange bar) to open them for execution
5. Your posture recovers when not blocking
6. Different enemies require different strategies!

## 🚀 Running the Game

```bash
# Navigate to the project directory
cd isometric-souls-prototype

# Install dependencies
npm install

# Start the development server
npm run dev
```

The game will automatically open in your browser at `http://localhost:5173`

## 📁 Project Structure

```
isometric-souls-prototype/
├── src/
│   ├── main.js          # Entry point
│   ├── renderer.js      # Enhanced PixiJS rendering
│   ├── combat.js        # Sekiro-inspired combat system
│   ├── enemy.js         # Enemy AI and behaviors
│   ├── engine.js        # Core isometric math
│   ├── assetLoader.js   # Smart asset loading
│   ├── audioSystem.js   # Web Audio API sound effects
│   └── gameStates.js    # Menu and game state management
├── assets/              # Game assets (sprites, backgrounds, etc.)
├── index.html           # Main HTML file
├── package.json         # Dependencies
└── vite.config.js       # Build configuration
```

## 🎨 Technical Highlights

- **Modular architecture**: Clean separation of concerns
- **Performance optimized**: Efficient sprite batching and rendering
- **Fallback systems**: Game works even without asset files
- **Modern JavaScript**: ES6+ modules and async/await
- **Responsive design**: Adapts to different screen sizes

## 🔧 Dependencies

- **PixiJS 8.1.5**: 2D rendering engine
- **Vite**: Fast build tool and dev server

## 🎮 Gameplay Video

The game features:
- Smooth isometric movement across a 9x9 grid
- Multiple enemies attacking with different patterns
- Dynamic lighting that follows the player
- Particle effects for atmosphere
- Professional UI with health/posture bars

## 🏆 Victory Conditions

- Defeat all enemies by reducing their health to zero
- Or break their posture and execute them for instant kills
- Survive with careful blocking and perfect parries!

## 💡 Future Enhancements

While the game is fully playable, potential additions could include:
- More enemy types and boss battles
- Multiple levels with different environments
- Player progression and skill trees
- Weapon variety and special abilities
- Online leaderboards
- Controller support

Enjoy your adventure in this beautiful 2.5D isometric world!