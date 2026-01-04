# Hitbox - Collaborative Explorable Artwork

An open-source procedurally generated exploration game designed to be visually modifiable while maintaining core gameplay.

## 🎮 Play Now

**[Play Hitbox Online →](https://raulonastool.github.io/Hitbox_HTML/)**

Works on desktop, tablet, and mobile devices!

## Vision

This project is inspired by Twitch Plays Pokemon - a beautiful explorable world that can be controlled collaboratively by multiple people. The goal is to create something compelling, interesting, and fun to explore, while being completely open for visual customization.

## Features

- **Procedural World Generation** with distinct biomes
- **Interesting Structures**: Rooms, paths, treasure chambers, and shrines
- **Fog of War**: Discover the world as you explore
- **Themeable Visuals**: Complete separation between game logic and visual presentation
- **Mobile-Friendly**: Touch controls via on-screen D-pad

## Playing the Game

- **Desktop**: Use arrow keys to move
- **Mobile/Touch**: Use the on-screen D-pad in the bottom-right
- **Goal**: Explore biomes, find treasure rooms, discover shrines, collect coins
- **Avoid**: Lava tiles (pink glow) - they damage you!

## World Features

### Biomes
- **Neon City**: Dense walls and coins
- **Lava Fields**: Dangerous molten areas
- **Crystal Garden**: Peaceful grassy meadows
- **Void**: Sparse, mysterious emptiness
- **Safe Zones**: Protected starting areas

### Points of Interest
- **Treasure Rooms**: Circular chambers filled with coins
- **Shrines**: Mystical rotating markers
- **Rooms**: Rectangular structures with walls
- **Paths**: Connected corridors between areas

## Creating Your Own Theme

The entire visual style can be swapped by creating a new theme object. This allows anyone to reimagine the game with their own art style - pixel art characters like Mario or Link, different biomes like forests or mountains, etc.

### Theme Structure

A theme is a JavaScript object with the following methods:

```javascript
const MY_CUSTOM_THEME = {
  name: "My Theme Name",

  colors: {
    // Define your color palette here
    // Colors are arrays: [R, G, B] or [R, G, B, Alpha]
  },

  // Draw the background (called once per frame)
  drawBackground: function() {
    // Your background rendering code
    // Can access VIEW_PIXELS, TILE_SIZE, frameCount, etc.
  },

  // Draw a single tile (called for each visible tile)
  drawTile: function(type, x, y, wx, wy) {
    // type: "floor", "grass", "lava", "coin", "wall", "shrine"
    // x, y: screen position in pixels
    // wx, wy: world coordinates
    // TILE_SIZE: size of one tile in pixels
  },

  // Draw the player character
  drawPlayer: function(x, y, hurt) {
    // x, y: screen position in pixels
    // hurt: boolean - true if player is hurt
    // TILE_SIZE: available for sizing
  },

  // Draw hover highlight effect
  drawHoverHighlight: function(tx, ty) {
    // tx, ty: tile coordinates (0-31)
  },

  // Draw HUD (score, lives, tile info)
  drawHUD: function(score, lives, tileInfo) {
    // tileInfo: { type, x, y } or null
  },

  // Draw on-screen controls
  drawControls: function(dpadConfig) {
    // dpadConfig: { size, dist, cx, cy, hit }
  }
};
```

### Activating Your Theme

At the bottom of the theme definitions, change:

```javascript
let CURRENT_THEME = MY_CUSTOM_THEME;
```

### Theme Examples

You can create themes like:
- **Pixel Art**: 8-bit sprites, retro tiles
- **Watercolor**: Soft, painterly backgrounds
- **Minimalist**: Clean, simple shapes
- **Fantasy RPG**: Medieval castles, forests, dungeons
- **Sci-Fi**: Spaceships, alien planets, neon grids

The game logic remains identical - only the visuals change!

## File Structure

```
index.html          - Main HTML file
sketch.js           - Game logic + theme system
style.css           - Basic styling
README.md           - This file
```

## Technical Details

- Built with [p5.js](https://p5js.org/) for canvas rendering
- World: 128×128 tiles
- Viewport: 32×32 tiles visible at once
- Responsive canvas sizing
- Perlin noise-based biome generation

## Extending the Game

### Core Game Logic
All game logic is in sketch.js and separated from rendering:
- `generateWorld()` - Procedural world generation
- `tryMove()` - Movement and collision
- `checkLava()` - Damage system
- `collectCoin()` - Scoring

### Adding New Tile Types
1. Add generation logic in `generateWorld()`
2. Add rendering in your theme's `drawTile()` function
3. Add collision/interaction logic if needed

### Adding New Features
The architecture supports easy additions like:
- Power-ups
- NPCs
- Quests
- Multiplayer (future)
- Different world generation algorithms

## License

Open source - feel free to fork, modify, and create your own visual themes!

## Future Vision

Multiplayer collaborative exploration where multiple players control the same character (Twitch Plays Pokemon style) exploring this beautiful procedural world together.
