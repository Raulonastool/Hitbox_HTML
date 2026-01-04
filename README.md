# Hitbox - Collaborative Explorable Artwork

An open-source procedurally generated exploration game designed to be a beautiful, compelling world to explore. Built with a composable theme system that allows anyone to completely reimagine the visuals while keeping the core gameplay intact.

## 🎮 Play Now

**[Play Hitbox Online →](https://raulonastool.github.io/Hitbox_HTML/)**

Works perfectly on desktop, tablet, and mobile devices!

## Vision

**Inspired by Twitch Plays Pokemon**, this project aims to create a beautiful explorable world that can be controlled collaboratively by multiple people. The core philosophy is making something:
- **Compelling and fun to explore** - Rich procedural world with diverse biomes, treasures, and hazards
- **Visually composable** - Complete separation between game logic and visual presentation
- **Collaboratively playable** - Future multiplayer where multiple people control the same character

The dream is for artists to create their own visual themes (pixel art characters like Mario or Link, different aesthetic styles like watercolor or minimalist, unique biomes like forests or alien planets) while the exploration and discovery gameplay remains consistent.

## Current Features

### Gameplay
- **Procedural World Generation**: 128×128 tile world with region-based biome distribution
- **Five Distinct Biomes**: Neon City, Lava Fields, Crystal Garden, Void, and Safe Zones
- **Fog of War**: Discover the world as you explore, tiles reveal as you move
- **Lives System**: 3 lives, respawn at starting position on death
- **Score System**: Collect coins scattered throughout the world
- **Dynamic Hazards**:
  - Static lava tiles that damage on contact
  - Timed explosion tiles with warning states
  - Moving fireball hazards that patrol paths
- **Points of Interest**:
  - Treasure Rooms: Circular chambers filled with coins
  - Shrines: Mystical rotating markers
  - Rooms: Rectangular structures with walls and gaps
  - Paths: Connected corridors between areas

### Visuals & Themes
- **Two Complete Themes**:
  - **Vaporwave**: Neon aesthetic with animated perspective grid, twinkling stars, CRT scan lines, and glowing effects
  - **Pixel Art Retro**: 8-bit NES-style with blocky pixels, animated sprites, spinning coins, and classic game feel
- **Theme Selection**: Choose your visual style at the start screen using arrow keys
- **Fully Responsive**: Automatically adapts to any screen size from mobile phones to ultra-wide monitors
- **Smooth Animations**: Coins spin, lava bubbles, explosions blink, hazards move

### Controls
- **Desktop**: Arrow keys to move
- **Mobile/Touch**: On-screen D-pad in bottom-right corner
- **Responsive D-pad**: Scales and positions correctly on all screen sizes

## Playing the Game

1. **Start Screen**: Use ← → arrow keys to switch between themes, then press SPACE, ENTER, or tap to start
2. **Explore**: Move around to reveal tiles and discover biomes
3. **Collect**: Grab coins to increase your score
4. **Survive**: Avoid lava, dodge moving hazards, watch for explosion warnings
5. **Discover**: Find treasure rooms and shrines hidden throughout the world

### Biomes

- **Neon City** (25% of world): Dense with walls and coins, urban exploration
- **Lava Fields** (25% of world): Dangerous area with lava, explosions, and moving hazards - more floor space for navigation
- **Crystal Garden** (30% of world): Peaceful grassy meadows with scattered coins
- **Void** (20% of world): Sparse, mysterious emptiness with minimal obstacles
- **Safe Zones**: Protected starting areas with no hazards

### Hazards

- **Lava Tiles**: Glowing tiles that damage on contact
- **Explosion Tiles**:
  - Yellow (safe): Caution symbol visible
  - Red (warning): Blinking red with 30 frames to escape
  - Orange (exploding): Active explosion state - damages player!
- **Moving Hazards**: Fireball enemies that patrol horizontal or vertical paths

## Creating Your Own Theme

The entire visual style can be completely swapped by creating a new theme object. This is the core feature that makes Hitbox composable - artists can reimagine the entire game while the gameplay stays the same.

### Theme Structure

A theme is a JavaScript object with these required methods:

```javascript
const MY_CUSTOM_THEME = {
  name: "My Theme Name",

  colors: {
    // Define your color palette
    // Must include: deepPurple, purple, cyan, pink (used by core game)
    // Colors are arrays: [R, G, B] or [R, G, B, Alpha]
  },

  // Draw the background (called once per frame)
  drawBackground: function() {
    // Your background rendering code
    // Access: VIEW_PIXELS, TILE_SIZE, frameCount, etc.
  },

  // Draw a single tile (called for each visible tile)
  drawTile: function(type, x, y, wx, wy) {
    // type: "floor", "grass", "lava", "coin", "wall", "shrine", "explosion", "moving_hazard"
    // x, y: screen position in pixels
    // wx, wy: world coordinates in tiles
    // TILE_SIZE: size of one tile in pixels
    // explosionTimers[wy][wx]: timer value for explosion tiles (0-120)
  },

  // Draw the player character
  drawPlayer: function(x, y, hurt) {
    // x, y: screen position in pixels (center of player)
    // hurt: boolean - true if player recently took damage
    // TILE_SIZE: available for sizing reference
  },

  // Draw hover highlight effect (mouse/touch feedback)
  drawHoverHighlight: function(tx, ty) {
    // tx, ty: tile coordinates (0-31 in viewport)
  },

  // Draw HUD (score, lives, tile info)
  drawHUD: function(score, lives, tileInfo) {
    // score: number of coins collected
    // lives: number of lives remaining (0-3)
    // tileInfo: { type, x, y } or null
    // VIEW_PIXELS: canvas size for positioning
  },

  // Draw on-screen controls
  drawControls: function(dpadConfig) {
    // dpadConfig: { size, dist, cx, cy, hit }
    // size: button diameter
    // dist: distance from center to buttons
    // cx, cy: center position
    // hit: hit detection radius
  }
};
```

### Adding Your Theme

1. Add your theme object to `sketch.js` before the `THEMES` array
2. Add it to the array:
```javascript
const THEMES = [
  VAPORWAVE_THEME,
  PIXEL_ART_THEME,
  MY_CUSTOM_THEME  // Your theme here!
];
```
3. Players can now select it at the start screen!

### Theme Ideas

The sky's the limit! Here are some ideas:
- **Fantasy RPG**: Medieval castles, stone walls, torches, knight character
- **Sci-Fi**: Spaceships, alien planets, neon grids, astronaut character
- **Nature**: Hand-drawn forests, mountains, rivers, animal character
- **Watercolor**: Soft painterly backgrounds, artistic tiles
- **Minimalist**: Clean geometric shapes, simple color blocks
- **Horror**: Dark atmosphere, creepy shadows, gothic style
- **Cyberpunk**: Rain effects, holographic elements, dark neon
- **Cartoon**: Bright colors, bouncy animations, comic book style

**The game logic is identical - only the visuals change!**

## File Structure

```
index.html          - Main HTML file with viewport configuration
sketch.js           - Complete game logic + theme system
style.css           - Responsive styling and canvas positioning
README.md           - This file
.gitignore          - Git configuration
```

## Technical Details

- **Framework**: [p5.js](https://p5js.org/) v1.11.7 for canvas rendering
- **World Size**: 128×128 tiles (16,384 total tiles)
- **Viewport**: 32×32 tiles visible at once
- **Biome Generation**: Region-based (16×16 tile regions) with Perlin noise for organic boundaries
- **Responsive Design**: Canvas fills maximum screen space while maintaining square aspect ratio
- **Mobile Support**: Touch controls with responsive D-pad sizing and positioning
- **Performance**: Optimized tile rendering with fog of war culling

## Architecture

### Separation of Concerns

The game is architected with complete separation between game logic and visual presentation:

**Game Logic (Pure)**:
- World generation (`generateWorld()`)
- Movement and collision (`tryMove()`)
- Hazard checking (`checkHazards()`)
- Explosion timers (`updateExplosions()`)
- Moving hazards (`updateMovingHazards()`)
- Coin collection (`collectCoin()`)
- Lives and damage (`damagePlayer()`)

**Visual Presentation (Theme-Dependent)**:
- All rendering calls go through `CURRENT_THEME` methods
- No game logic in theme code
- Themes can't affect gameplay, only appearance

This architecture is what enables the composable artwork vision.

## Extending the Game

### Adding New Tile Types

1. Add generation logic in `generateWorld()`
2. Add the tile type to a biome's generation pattern
3. Implement rendering in both theme's `drawTile()` functions
4. Add collision/interaction logic if needed in `tryMove()` or `checkHazards()`

### Adding New Hazards

1. Create the hazard data structure (like `movingHazards` array)
2. Generate hazards in `generateWorld()`
3. Add update logic in `draw()` loop
4. Add damage detection in `checkHazards()`
5. Implement visual rendering in theme `drawTile()`

### Adding New Biomes

1. Add biome constant to `BIOMES` object
2. Update region distribution in `generateWorld()`
3. Add tile generation pattern in the biome switch statement
4. Themes automatically render the tiles!

## Future Vision

### Multiplayer Collaborative Exploration

The ultimate goal is to enable **Twitch Plays Pokemon-style multiplayer** where:
- Multiple players control the same character simultaneously
- Commands are aggregated (most common direction wins)
- Everyone explores the procedural world together
- Shared discovery and collective decision-making
- Chat integration for community engagement

### Community Themes

A future gallery where:
- Artists share their custom themes
- Players can easily download and install new visual styles
- Showcase the diversity of interpretations of the same game world
- Celebrate creativity while maintaining consistent gameplay

## Contributing

This is an open-source collaborative artwork! Contributions welcome:

- **Create themes**: Make your own visual style and share it
- **Improve gameplay**: Add new features, hazards, or mechanics
- **Optimize**: Performance improvements, bug fixes
- **Document**: Help others understand and extend the code

## License

Open source - feel free to fork, modify, and create your own visual themes!

---

**Built with ❤️ as an explorable collaborative artwork**
