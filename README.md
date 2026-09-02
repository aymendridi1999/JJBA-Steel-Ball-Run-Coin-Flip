# JJBA Steel Ball Run Coin Flip

An interactive 3D coin-flip web experience inspired by *JoJo's Bizarre Adventure: Steel Ball Run*.

The project uses Three.js to render a detailed, physically shaded coin with interactive lighting, free rotation, randomized material rarity, heads-or-tails gameplay, flip history, and background music.

## Features

- Interactive 3D coin rendered with Three.js
- High-resolution front, back, and bump textures
- Free coin rotation, zoom, and camera panning
- Adjustable light position and front/back lighting
- Heads-or-tails call and animated coin flip
- Flip history with win/loss tracking
- Random material rarity system:
  - Copper — 50%
  - Silver — 35%
  - Gold — 14.9%
  - Diamond — 0.1%
- Material refresh control
- Background music with mute and volume controls
- Responsive full-screen presentation

## Tech Stack

- HTML5
- CSS3
- JavaScript ES modules
- Three.js 0.180.0
- Vercel

## Run Locally

Because the project uses JavaScript modules and local assets, serve it through a local HTTP server rather than opening `index.html` directly.

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Controls

- **Left-drag:** rotate the coin
- **Mouse wheel:** zoom
- **Right-drag:** pan the camera
- **Light Position:** drag inside the radial control to reposition the key light
- **Distance:** move the light closer or farther away
- **Front / Back:** move the key light between the two sides of the coin
- **Reset Coin:** restore the initial coin orientation and camera position
- **Heads / Tails:** make a call before flipping
- **Flip Coin:** animate a randomized flip
- **↻:** generate a new random coin material

## Project Structure

```text
.
├── index.html
├── main.js
├── background.png
├── logo.png
├── coin_face_front.png
├── coin_face_back.png
├── coin_bump.png
├── coin_bump_back.png
├── background_music.wav
├── CREDITS.md
├── LICENSE
└── vercel.json
```

## Attribution

This is a non-commercial fan project inspired by *JoJo's Bizarre Adventure: Steel Ball Run*. See [CREDITS.md](CREDITS.md) for attribution and the project disclaimer.

## License

The original source code in this repository is licensed under the MIT License. Third-party characters, artwork, branding, music, and other referenced intellectual property remain the property of their respective owners.
