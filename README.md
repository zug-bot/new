# 2.5D Isometric Souls/Sekiro-like Prototype

A PixiJS-based 2.5D isometric prototype inspired by Triangle Strategy and Octopath Traveler (art) and Sekiro (real-time, parry-focused combat).

## Run locally

```bash
npm install
npm run dev
```

Open the shown URL (defaults to `http://localhost:5173`).

## Controls

- Move: W A S D
- Attack: J
- Parry: K (very short window)
- Pan: Drag mouse
- Zoom: Mouse wheel

## Structure

- `assets/` — put your sprites/backgrounds/light textures here
- `src/` — PixiJS engine, rendering, lighting, combat, input
- `docs/` — references and inspiration

## Art Assets & Licensing

This repo ships with code-only placeholders (primitive shapes) to avoid bundling third-party art. For production, source or create your own 2.5D isometric assets and verify licenses:

- `itch.io` — search for isometric pixel packs
- `OpenGameArt.org` — liberal licenses
- `Kenney.nl` — high-quality CC0/CC-BY assets
- Use searches like "Octopath Traveler isometric sprites" and "Triangle Strategy pixel assets" for inspiration. Always check licenses and attribution requirements.

Note: Sites like `spriters-resource.com` host rips from commercial games; these are typically not licensed for redistribution in your projects. Use only for study/reference unless you have clear rights.

## Lighting & Shadows

- Ambient darkness overlay uses multiply blend
- Additive radial lights simulate torches/glows
- Shadow blobs under characters are semi-transparent ellipses

## Next steps

- Replace primitive character sprites with real isometric pixel art
- Add proper animation states (idle, run, attack, parry)
- Expand AI, posture/balance mechanics, and hitboxes
- Terrain height and occlusion
- Audio and hit sparks
