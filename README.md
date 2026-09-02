# JJBA Steel Ball Run Coin Flip

An interactive 3D coin-flip experience inspired by *JoJo's Bizarre Adventure: Steel Ball Run*, built with Three.js and deployed as a static web project on Vercel.

The project has been restored around its original high-resolution visual assets and audio while keeping the application lightweight and entirely client-side.

## Live Demo

**Vercel:** https://jjba-steel-ball-run-coin-flip-test.vercel.app

## Overview

The application renders a detailed Steel Ball Run-inspired coin in 3D with physically shaded materials, front and back textures, bump mapping, interactive lighting, camera controls, animated coin flips, heads-or-tails gameplay, flip history, and background music.

The interface is designed for both desktop and mobile use. Narrow portrait screens receive responsive camera framing, compact touch-friendly controls, safe-area handling for notched devices, and reduced WebGL render density for better mobile performance.

No backend, database, build framework, or application server is required. The project is plain HTML, CSS, JavaScript ES modules, Three.js, and static assets.

## Features

- Interactive 3D coin rendered with Three.js
- Original high-resolution PNG front, back, and bump textures
- Original background and logo assets
- Free coin rotation, zoom, and camera panning on desktop
- Single-finger coin rotation on touch devices
- Responsive portrait and landscape layouts
- Mobile-aware camera framing so the coin remains visible on narrow screens
- Touch-sized Heads, Tails, Flip, refresh, lighting, and audio controls
- Collapsible lighting and audio panels on mobile
- Safe-area support for notched phones and devices with home indicators
- Reduced mobile pixel ratio for smoother WebGL rendering on high-DPI displays
- Adjustable key-light position and distance
- Front/back lighting controls
- Heads-or-tails call before each flip
- Animated randomized coin flip
- Flip history with win/loss tracking
- Random coin material rarity system:
  - Copper — 50%
  - Silver — 35%
  - Gold — 14.9%
  - Diamond — 0.1%
- Material refresh control
- Background music with mute and volume controls
- Static deployment on Vercel

## Tech Stack

- HTML5
- CSS3
- JavaScript ES modules
- Three.js 0.180.0
- Vercel

## Run Locally

Because the application uses JavaScript modules and local assets, serve the repository through a local HTTP server instead of opening `index.html` directly.

Using Python:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Any equivalent static HTTP server will work.

## Controls

### Desktop

| Control | Action |
| --- | --- |
| Left-drag | Rotate the coin freely |
| Mouse wheel | Zoom |
| Right-drag | Pan the camera |
| Light Position | Reposition the key light |
| Distance | Move the light closer or farther away |
| Front / Back | Move lighting between the two coin faces |
| Reset Coin | Restore the initial coin and camera position |
| Heads / Tails | Make a call before flipping |
| Flip Coin | Run an animated randomized flip |
| Refresh | Generate a new random coin material |
| Mute / Volume | Control the background music |

### Mobile

| Control | Action |
| --- | --- |
| One-finger drag | Rotate the coin |
| Light | Open or close the lighting controls |
| Audio | Open or close the music controls |
| Flip History | Expand or collapse recent results |
| Heads / Tails | Make a call before flipping |
| Flip Coin | Run an animated randomized flip |
| Refresh | Generate a new random coin material |

The mobile layout automatically adapts to portrait and landscape orientation. Control panels remain collapsed until needed so the 3D coin keeps most of the available screen space.

## Project Structure

```text
.
├── index.html
├── main.js
├── responsive.js
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

`responsive.js` contains the mobile camera-framing, render-density, panel, and touch helpers while `main.js` remains responsible for the Three.js scene and coin-flip behavior.

## Deployment

The `main` branch is connected directly to Vercel. Pushes to `main` produce the production deployment automatically.

The current production version uses the restored PNG textures and source audio directly; temporary compatibility assets and obsolete compressed asset copies have been removed from the repository.

## Attribution

This is a non-commercial fan project inspired by *JoJo's Bizarre Adventure: Steel Ball Run*.

See [CREDITS.md](CREDITS.md) for attribution and the full project disclaimer.

## License

The original source code in this repository is licensed under the MIT License. Third-party characters, artwork, branding, music, and other referenced intellectual property remain the property of their respective owners.
