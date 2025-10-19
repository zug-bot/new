# Beautiful 2.5D Isometric Souls/Sekiro-like Game

A game prototype inspired by Triangle Strategy and Octopath Traveler (for art), and Sekiro (for real-time, parry-focused, difficult combat). Features beautiful 2.5D isometric visuals with dynamic lighting and shadows.

## 🎮 Game Features

- **2.5D Isometric Graphics**: Pixel art characters and objects on 3D-ish terrain
- **Real-time Combat**: High difficulty combat with parrying as a core mechanic
- **Dynamic Lighting**: Flickering torches and ambient lighting effects
- **Particle Effects**: Blood, sparks, and visual feedback for combat
- **Combo System**: Chain attacks for increased damage
- **Parry System**: Timing-based defense with perfect parry rewards

## 🎯 Controls

- **WASD**: Move character
- **Mouse**: Look around
- **Left Click**: Attack
- **Right Click**: Parry (timing-based defense)
- **Space**: Dodge roll

## 🚀 Getting Started

### Prerequisites

- Node.js (for package management)
- Modern web browser with WebGL support

### Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:8080`

## 🎨 Art Style Inspiration

This game draws inspiration from:

- **Triangle Strategy**: Isometric pixel art style and environmental design
- **Octopath Traveler**: Character sprites and lighting effects
- **Sekiro**: Real-time combat mechanics and parrying system

## 🏗️ Project Structure

```
assets/
  sprites/          # Character and enemy sprites (2.5D isometric style)
  backgrounds/      # Environment and parallax backgrounds
  lights/           # Lighting effects and shadow PNGs
src/
  main.js          # Main game engine and entry point
  renderer.js      # Advanced rendering system
  combat.js        # Combat system with parrying mechanics
docs/
  inspiration.md   # Reference images and art inspiration
```

## 🔧 Technical Features

### Rendering System
- Isometric coordinate conversion
- Dynamic lighting with flickering effects
- Particle system for visual effects
- Post-processing filters for mood

### Combat System
- Hitbox-based collision detection
- Parry windows with timing mechanics
- Combo system for chaining attacks
- Damage numbers and visual feedback

### Lighting System
- Multiple light sources with different properties
- Flickering torch effects
- Ambient lighting overlay
- Dynamic shadow casting

## 🎮 Gameplay Mechanics

### Combat
- **Attack**: Left click to perform basic attacks
- **Parry**: Right click with precise timing to deflect enemy attacks
- **Dodge**: Space bar to perform invincible dodge rolls
- **Combo**: Chain attacks for increased damage multiplier

### Enemy AI
- Aggro range detection
- Attack cooldowns
- Movement towards player
- Stun effects from parries

## 🔮 Future Enhancements

- [ ] More enemy types with unique attack patterns
- [ ] Boss battles with complex mechanics
- [ ] Environmental hazards and interactive objects
- [ ] Sound effects and music
- [ ] Save/load system
- [ ] Multiple levels and areas
- [ ] Character progression and upgrades

## 📚 Art Asset Sources

For finding appropriate 2.5D isometric sprites:

- [itch.io](https://itch.io) - Indie game assets
- [OpenGameArt.org](https://opengameart.org) - Open source game art
- [Kenney.nl](https://kenney.nl) - Free game assets
- [Spriters Resource](https://www.spriters-resource.com) - Sprite references

## 🎨 License

This project is for educational and demonstration purposes. Make sure to check licenses and attribution requirements for any external assets used.

## 🤝 Contributing

Feel free to contribute by:
- Adding new enemy types
- Improving the combat system
- Creating new visual effects
- Adding sound effects
- Optimizing performance

## 📖 References

- [Octopath Traveler Art Style Analysis](https://example.com)
- [Triangle Strategy Pixel Art](https://example.com)
- [Sekiro Combat Mechanics](https://example.com)

---

**Note**: This is a prototype/demo. The current sprites are programmatically generated placeholders. In a full implementation, you would replace these with actual pixel art assets sourced from the recommended sites above.