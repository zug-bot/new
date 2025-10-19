# Beautiful 2.5D Isometric Souls/Sekiro-like Prototype

A game prototype inspired by Triangle Strategy and Octopath Traveler's beautiful 2.5D isometric art style, combined with Sekiro's intense parry-focused combat system.

## Features

- **2.5D Isometric Graphics**: Beautiful pixel art style with dynamic lighting and shadows
- **Sekiro-inspired Combat**: 
  - Real-time combat with parrying as core mechanic
  - Posture system - break enemy posture to stun them
  - Perfect parry timing rewards
  - Invincibility dash mechanics
- **Dynamic Lighting System**: Real-time lighting with flickering effects
- **Enemy AI**: Enemies that detect, approach, and attack the player
- **Beautiful Visual Effects**: Particle systems, combat effects, and ambient atmosphere

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm start
```

3. Open your browser to `http://localhost:3000`

## Controls

- **Arrow Keys** - Move character
- **Z** - Attack
- **X** - Parry (time it right for perfect parry!)
- **C** - Block (reduces damage but builds posture)
- **Space** - Dash (brief invincibility)

## Combat Tips

- **Parrying**: Press X just before an enemy attack lands for a perfect parry
- **Posture System**: Both you and enemies have posture bars. When full, you/they become stunned
- **Enemy Telegraphs**: Enemies flash red before attacking - watch for this!
- **Dash**: Use space to dash through attacks with invincibility frames

## Art Assets

Currently using placeholder graphics. To add real sprites:

1. Place character sprites in `assets/sprites/`
2. Place backgrounds in `assets/backgrounds/`
3. Place lighting effects in `assets/lights/`
4. Update the PreloadScene.js to load your actual assets

Good sources for 2.5D isometric sprites:
- [itch.io](https://itch.io)
- [OpenGameArt.org](https://opengameart.org)
- [Kenney.nl](https://kenney.nl)
- [Spriters Resource](https://www.spriters-resource.com/)

## Technical Details

- Built with **Phaser 3** game engine
- Custom isometric rendering system
- Dynamic lighting with render textures
- Modular entity system for players and enemies

## Future Enhancements

- More enemy types with varied attack patterns
- Boss battles with multiple phases
- Level progression system
- Equipment and upgrades
- Sound effects and music
- Save/load system

## License

This is a prototype for learning purposes. Please check individual asset licenses if using external sprites.