# JJBA Steel Ball Run Coin Flip

An interactive **Steel Ball Run-inspired 3D coin flip experience** built with vanilla JavaScript and Three.js.

The project renders a fully rotatable 3D coin with textured faces, dynamic lighting, weighted material variants, heads-or-tails gameplay, flip history, and background audio.

## Features

- Interactive 3D coin rendered with Three.js
- Free 360° mouse rotation, zoom, and pan
- Heads-or-tails call and animated coin flip
- Flip history with win/loss tracking
- Adjustable light position, depth, and front/back lighting
- Random material variants:
  - Copper — 50%
  - Silver — 35%
  - Gold — 14.9%
  - Diamond — 0.1%
- Refresh control to reroll the coin material
- Background music with mute and volume controls
- Responsive full-screen presentation

## Tech

- HTML5
- CSS3
- JavaScript ES modules
- [Three.js](https://threejs.org/)
- WebGL

Three.js is loaded from jsDelivr through an import map, so there is no package-install or build step.

## Run locally

From the project directory:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Opening `index.html` directly is not recommended because browser module and asset-loading rules work best through a local HTTP server.

## Controls

- **Left drag:** rotate the coin freely
- **Mouse wheel:** zoom
- **Right drag:** pan
- **Heads / Tails:** make a call before flipping
- **Flip Coin:** animate and resolve a fair 50/50 flip
- **Refresh icon:** reroll the coin material
- **Light Position:** move the key light around the coin
- **Distance:** move the light along the Z axis
- **Front / Back:** switch which side receives the key light
- **Reset Coin:** restore the default coin and camera orientation

## Asset optimization

The web version uses optimized WebP textures to keep the deployment lightweight while preserving the original artwork and bump-map detail.

## Disclaimer

This is a non-commercial fan project inspired by *JoJo's Bizarre Adventure: Steel Ball Run*. JoJo's Bizarre Adventure and related names, characters, logos, and imagery belong to their respective rights holders. This repository is not affiliated with or endorsed by the official rights holders.
