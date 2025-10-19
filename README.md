# Beautiful 2.5D Isometric Souls/Sekiro-like

A game prototype inspired by _Triangle Strategy_ and _Octopath Traveler_ (for art), and _Sekiro_ (for real-time, parry-focused, difficult combat). The goal is beautiful 2.5D isometric visuals with dynamic lighting and shadows.

## Art Style

- **2.5D Isometric**: Pixel art characters and objects on 3D-ish terrain, with dynamic camera and lighting.
- **Inspiration**: Triangle Strategy, Octopath Traveler for environment and character style.
- **Combat**: Real-time, high difficulty, with parrying as a core mechanic.

## Structure

- **assets/sprites/**: Place all character, enemy, and object sprites here. Use 2.5D isometric style.
- **assets/backgrounds/**: For environment and parallax backgrounds.
- **assets/lights/**: For lighting effects and shadows PNGs.
- **src/**: Game code (engine, rendering, combat logic).
- **docs/**: Reference images, links to inspirational art.

## Art Asset Sourcing

You must source or create art assets yourself. Good sources:
- [itch.io](https://itch.io/game-assets/tag-isometric)
- [OpenGameArt.org](https://opengameart.org/)
- [Kenney.nl](https://kenney.nl/assets?q=isometric)
- Search for "Octopath Traveler isometric sprites" and "Triangle Strategy pixel assets" for inspiration.

**Make sure to check licenses and attribution requirements!**

### Legal note on ripped assets
Do not ship ripped assets from commercial games. Sites like `spriters-resource.com` host rips intended for study/reference; they are not cleared for redistribution. Use legally licensed assets (itch.io, OpenGameArt, Kenney, etc.) for any public builds. Maintain `docs/ATTRIBUTIONS.md` if you include third‑party art.

## Example Directory Structure

```
assets/
  sprites/
    hero_idle.png
    hero_attack.png
    enemy_goblin.png
  backgrounds/
    forest_bg.png
  lights/
    light_cone.png
    shadow_blob.png
src/
  main.js
  renderer.js
docs/
  inspiration.md
README.md
```

## Lighting & Shadow Tips

- Use semi-transparent PNGs for shadow blobs under characters.
- Overlay light cones or glows above sprites for torch/ambient light.
- Consider using a 2D lighting engine (like [pixi.js lighting plugin](https://github.com/pixijs/pixi-lights)) if using JS.
- For Unity: use 2D lights and isometric tilemaps.

## Placeholder Sprites

Until you find art, use colored rectangles or basic isometric tiles as placeholders. This repo renders placeholder rectangles and shadow blobs programmatically.

---
use. https://www.spriters-resource.com/ ccreate a beautiful 2.5d isometric souls/sekiro like - art inspired by triangle strategy octopath traveller but with real time difficult combat with parrying. Webcrawl through the internet to find appropriate sprites but use 2.5d and make it beautiful with lighting effects and shadows
## References

- [Octopath Traveler Art Style Analysis](https://www.youtube.com/watch?v=9wZ9rV1dXDc)
- [Triangle Strategy Pixel Art](https://www.spriters-resource.com/pc_computer/trianglestrategy/) — study only
- [Sekiro Combat Mechanics](https://www.youtube.com/watch?v=K3I7lQ7rj8o)

## Getting started

1. Install Node 18+.
2. Install deps: `npm install`
3. Run dev server: `npm run dev`
4. Controls: WASD move, Space attack, Shift parry, Q/E rotate camera.

## Project structure

```
assets/
  sprites/
  backgrounds/
  lights/
docs/
  inspiration.md
src/
  main.js
  renderer.js
  lighting.js
  input.js
  combat.js
vite.config.js
index.html
```
