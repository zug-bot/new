# Enhanced Isometric Souls Prototype

A beautiful 2.5D isometric action game inspired by _Triangle Strategy_, _Octopath Traveler_, and _Sekiro_. Features real-time combat with parrying mechanics, dynamic lighting, particle effects, and intelligent enemy AI.

## ✨ Features

### 🎮 Enhanced Combat System
- **Health & Posture System**: Sekiro-inspired combat with health and posture mechanics
- **Precise Parrying**: Time-based parry system with visual feedback
- **Combo System**: Chain attacks and break enemy posture
- **Screen Effects**: Screen shake, damage flashes, and visual feedback

### 🎨 Visual Excellence
- **Dynamic Lighting**: Torch lights, ambient lighting, and combat lighting effects
- **Particle System**: Explosions, sparks, healing effects, and atmospheric particles
- **Character Animations**: Idle, movement, attack, parry, and stunned states
- **Isometric Graphics**: Beautiful 2.5D perspective with depth and shadows

### 🤖 Intelligent AI
- **Enemy Behavior**: Pursuit, attack patterns, and tactical retreat
- **Attack Patterns**: Multiple attack types with different windup times
- **Adaptive Difficulty**: AI becomes more aggressive when damaged
- **Combat States**: Idle, pursuing, attacking, stunned, and retreating

### 🎯 User Interface
- **Health Bars**: Real-time health and posture tracking
- **Combat Log**: Action feedback and combat messages
- **Minimap**: Real-time position tracking
- **Parry Indicators**: Visual cues for perfect timing
- **Damage Numbers**: Floating damage display

### 🕹️ Enhanced Controls
- **Keyboard Support**: WASD movement, Space for parry, J for attack
- **Gamepad Support**: Full controller support with vibration feedback
- **Responsive Input**: Smooth movement and precise combat timing

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Controls
- **Movement**: WASD or Arrow Keys (also supports gamepad)
- **Parry**: Space (or gamepad B/Y button)
- **Attack**: J (or gamepad A/X button)
- **Mouse**: Camera control (future feature)

## 🏗️ Architecture

### Core Systems
- **Engine**: Isometric math utilities and timing
- **Renderer**: PixiJS-based rendering with animations
- **Combat**: Health, posture, and parry mechanics
- **AI**: Enemy behavior and attack patterns
- **Lighting**: Dynamic lighting and shadow system
- **Particles**: Visual effects and atmosphere
- **UI**: Health bars, indicators, and HUD
- **Controls**: Input handling for keyboard and gamepad

### File Structure
```
src/
├── main.js          # Entry point and game initialization
├── engine.js        # Core math and utilities
├── renderer.js      # PixiJS rendering and character animations
├── combat.js        # Combat system with health/posture
├── enemyAI.js       # Enemy behavior and attack patterns
├── lighting.js      # Dynamic lighting system
├── particles.js     # Particle effects and screen effects
├── ui.js           # User interface and HUD
└── controls.js     # Input handling (keyboard + gamepad)

assets/
├── sprites/         # Character and object sprites
├── backgrounds/     # Environment backgrounds
└── lights/         # Lighting effects and shadows
```

## 🎨 Art Style

- **2.5D Isometric**: Pixel art characters on 3D-ish terrain
- **Dynamic Lighting**: Real-time lighting with torches and ambient effects
- **Particle Effects**: Sparks, explosions, and atmospheric particles
- **Smooth Animations**: Character states with smooth transitions

## 🔧 Technical Features

### Performance Optimizations
- Efficient particle pooling
- Optimized rendering pipeline
- Smart update loops
- Memory management

### Visual Effects
- Screen shake and damage feedback
- Dynamic lighting with flickering torches
- Particle systems for combat effects
- Smooth character animations

### AI System
- State machine-based enemy behavior
- Attack pattern variety
- Adaptive difficulty
- Tactical decision making

## 🎯 Gameplay

### Combat Mechanics
1. **Health System**: Both hero and enemy have health that decreases when hit
2. **Posture System**: Build up posture through attacks and parries
3. **Parry Timing**: Press Space during enemy attack windup to parry
4. **Attack Patterns**: Different enemy attacks with varying timing
5. **Posture Break**: High posture leads to stunning and vulnerability

### Strategy
- Learn enemy attack patterns
- Time parries perfectly for maximum effect
- Manage your posture to avoid being stunned
- Use attacks to build enemy posture
- Watch for visual cues and timing windows

## 🛠️ Development

### Adding New Features
- **New Attack Types**: Add to `enemyAI.js` attack patterns
- **Visual Effects**: Extend `particles.js` with new effects
- **UI Elements**: Add to `ui.js` for new interface components
- **Controls**: Extend `controls.js` for new input methods

### Customization
- Adjust combat timing in `combat.js`
- Modify AI behavior in `enemyAI.js`
- Change visual effects in `particles.js`
- Customize UI layout in `ui.js`

## 📚 References

- [Octopath Traveler Art Style](https://www.youtube.com/watch?v=9wZ9rV1dXDc)
- [Triangle Strategy Pixel Art](https://www.spriters-resource.com/pc_computer/trianglestrategy/)
- [Sekiro Combat Mechanics](https://www.youtube.com/watch?v=K3I7lQ7rj8o)
- [PixiJS Documentation](https://pixijs.com/)

## 🎮 Future Enhancements

- Audio system with sound effects and music
- Multiple enemy types with unique behaviors
- Level progression and difficulty scaling
- Camera controls and zoom functionality
- Save/load system
- Multiplayer support

---

**Enjoy the enhanced isometric souls experience!** 🗡️✨