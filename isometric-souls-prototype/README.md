# Beautiful 2.5D Isometric Souls/Sekiro-like (Prototype)

A game prototype inspired by **Triangle Strategy** and **Octopath Traveler** (for art),
and **Sekiro** (for real-time, parry‑focused, difficult combat). The goal is beautiful
**2.5D isometric** visuals with dynamic lighting and shadows — delivered as a web project
you can run locally with Vite + PixiJS.

> ⚠️ Art assets included here are **placeholders** generated at build-time.
> For production, source your own sprites from licensed repositories (itch.io,
> OpenGameArt.org, Kenney.nl). **Do not** scrape or redistribute copyrighted
> assets from third-party sites without permission.

## Quick Start
```bash
# 1) Install dependencies
npm install

# 2) Run dev server
npm run dev

# 3) Open the local URL (usually http://localhost:5173)
```

## Scripts

```bash
# Start local dev server
npm run dev

# Production build to `dist/`
npm run build

# Preview built assets locally
npm run preview
```

- iPad users: you can commit this whole folder with **Working Copy** and push to GitHub.
  Run/build on a desktop later, or use a cloud dev environment (Replit, Codespaces).

## Structure

```
assets/
  sprites/
    hero_idle.png
    enemy_goblin.png
    iso_tile_placeholder.png
  backgrounds/
    forest_bg.png
  lights/
    light_glow.png
    shadow_blob.png
src/
  main.js
  engine.js
  renderer.js
  combat.js
docs/
  inspiration.md
index.html
package.json
vite.config.js
```

## Art Asset Sourcing (you must do this)
- Use **itch.io**, **OpenGameArt.org**, **Kenney.nl**, or your own art.
- Search terms: “Octopath Traveler isometric sprites”, “Triangle Strategy pixel assets”.
- Always check licenses and attribution requirements.
- Replace the placeholder PNGs in `/assets` with your own.

## Lighting & Shadow Tips
- Use semi-transparent PNGs for shadow blobs under characters.
- Place a glowing overlay (additive blend) for torches and ambient lights.
- Consider a 2D lighting pipeline (PixiJS filters, normal maps).

## Controls
- WASD / Arrow Keys: move the hero on the isometric plane
- Space: attempt a parry as the enemy telegraphs an attack

During the telegraph, the enemy gains a subtle red tint and slight scale-up.
Press Space right before impact to parry; the background briefly flashes on success.

## References (for study)
- Octopath Traveler art style analysis
- Triangle Strategy pixel art breakdowns
- Sekiro combat mechanics & parry timing

## License
This template is provided **as-is** for educational and prototype use.
You are responsible for sourcing and licensing your own art and audio.
