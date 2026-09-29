# ScratchBlox 3D

A 2007-inspired Roblox-style 3D block sandbox built with Three.js and vanilla JavaScript.

## Features

- **Real 3D rendering** with Three.js
- **First-person camera** with mouse look (pointer lock)
- **Block placement & removal** with click/right-click
- **5 color palette** (press 1-5)
- **Grid-snapped building** for clean construction
- **Shadows & lighting** for visual depth
- **Simple, readable code** designed for js2scratch conversion

## Controls

- **WASD** — Move around
- **Space** — Jump
- **Left click** — Place a block
- **Right click** — Delete a block
- **1–5** — Select block color
- **R** — Reset the world
- **Mouse** — Look around (click canvas to enable)

## Run it

Open `index.html` in any modern browser with WebGL support. That's it.

## Code Structure

- `index.html` — Entry point, loads Three.js and the game script
- `game-3d.js` — Main game logic:
  - `world.blocks` — Array of all block meshes
  - `player` — Object tracking position, velocity, camera angles
  - `keys` — Object tracking pressed keys
  - `addBlock()` — Create a new block at grid coordinates
  - `removeBlock()` — Delete a block by position
  - `resetWorld()` — Clear and regenerate the world
  - `updatePlayer()` — Handle movement and jumping
  - `updateCamera()` — Third-person camera following player
  - `animate()` — Main render loop

## js2scratch Conversion

The code is written to be convertible to Scratch using js2scratch:

- No classes, only functions and objects
- Simple arrays for game state
- Plain loops instead of advanced iteration
- Three.js API calls mapped to basic 3D operations
- Linear, readable function flow

## Legacy Version

The old 2D isometric prototype is archived in `old/` for reference.

## Notes

ScratchBlox is a fan project inspired by 2007-era Roblox. It is not affiliated with Roblox Corporation.
