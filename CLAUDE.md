# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hitbox is a procedurally generated exploration game with a **composable theme system**. The architecture completely separates game logic, visual presentation, and audio, allowing artists to create entirely new visual themes while gameplay remains identical.

**Live site:** https://raulonastool.github.io/Hitbox_HTML/

## Development Commands

```bash
# Testing
npm test                 # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report

# Development
open index.html         # Run locally (uses p5.js CDN, no build needed)
```

## Architecture: Three-Layer Separation

The entire codebase exists in a single `sketch.js` file, but is architected with strict separation:

### 1. Game Logic (Pure, Theme-Independent)
- **World Generation:** `generateWorld()` creates 128×128 tile world with 5 biomes using region-based distribution
- **Player State:** Position, lives (3), hurt timer, fog of war revelation
- **Core Mechanics:** `tryMove()`, `checkHazards()`, `damagePlayer()`, `collectCoin()`
- **Dynamic Systems:**
  - `updateExplosions()` - timed explosion tiles (120 frame cycle)
  - `updateMovingHazards()` - patrolling fireball enemies
- **World Features:** Treasure rooms (circular coin chambers), shrines, paths, safe zones

### 2. Visual Presentation (Theme Objects)
Each theme is a JavaScript object implementing these required methods:

```javascript
{
  name: "Theme Name",
  colors: { deepPurple, purple, cyan, pink, ...custom },  // Required core colors
  drawBackground(),
  drawTile(type, x, y, wx, wy),
  drawPlayer(x, y, hurt),
  drawHoverHighlight(tx, ty),
  drawHUD(score, lives, tileInfo),
  drawControls(dpadConfig)
}
```

**Current themes:** VAPORWAVE_THEME, PIXEL_ART_THEME, ASCII_THEME (defined at top of sketch.js)

**Critical:** Themes can ONLY affect visuals, never game logic. The `THEMES` array holds all available themes.

### 3. Audio System (Procedural, Web Audio API)
- **AudioManager class** generates all sounds procedurally (no external files)
- **Theme-specific music:** Each theme has unique background music pattern
- **Sound effects:** Triggered by game events (`playCoinSound()`, `playDamageSound()`, `playExplosionSound()`)
- **Viewport-aware:** Explosion sounds only play when visible to player

## Key Constants

```javascript
WORLD_SIZE = 128          // Total world tiles (128×128)
FIXED_VIEW_TILES = 32     // Visible viewport (32×32)
BIOMES = { NEON_CITY, LAVA_FIELDS, CRYSTAL_GARDEN, VOID, SAFE_ZONE }
```

## Adding a New Theme

1. Create theme object before `THEMES` array with all required methods
2. Add to `THEMES` array: `const THEMES = [VAPORWAVE_THEME, PIXEL_ART_THEME, ASCII_THEME, YOUR_THEME];`
3. Add music pattern in `AudioManager.startMusic()` if desired
4. Test with `npm test` - theme validator checks required properties

**Theme validator** in `__tests__/theme-structure.test.js` verifies:
- Required properties (name, colors)
- Required colors (deepPurple, purple, cyan, pink)
- Required methods with correct signatures

## Mobile Support

- **Responsive canvas:** Automatically scales to screen size while maintaining square aspect ratio
- **Touch controls:** D-pad in bottom-right corner (see `drawControls()` in each theme)
- **Theme selection:** Arrow buttons (◀ ▶) on start screen, implemented in `handleStartScreenTouch()`
- **CSS:** `touch-action: none`, `user-select: none`, `overscroll-behavior: none` prevent mobile browser interference

## Testing Strategy

Three test suites in `__tests__/`:
1. **theme-structure.test.js** - Validates theme API compliance
2. **game-constants.test.js** - Verifies world/biome/tile configuration
3. **game-logic.test.js** - Tests core mechanics (movement, collision, damage, fog of war)

Tests run automatically on push/PR via GitHub Actions (`.github/workflows/test.yml`)

## p5.js Integration

- **Framework:** p5.js v1.11.7 (loaded via CDN in index.html)
- **Core functions:** `setup()`, `draw()`, `keyPressed()`, `touchStarted()`, `mouseClicked()`
- **Canvas mode:** WEBGL not used, 2D canvas only
- **Global variables:** All game state lives in global scope (player object, world arrays, revealed fog)

## Biome Distribution

World divided into 8×8 regions (each 16×16 tiles):
- **Neon City** (25%): Dense walls, coins, urban
- **Lava Fields** (25%): Hazards (lava, explosions, moving enemies)
- **Crystal Garden** (30%): Peaceful grass, scattered coins
- **Void** (20%): Sparse, minimal obstacles
- **Safe Zones**: Spawn area, no hazards

Biomes assigned to regions, then `noise()` creates organic boundaries between them.

## Critical Implementation Details

**Explosion Timer Logic:**
- 120 frames total cycle
- Frames 11-120: Yellow caution state
- Frames 1-10: Red warning/exploding state (damages player)
- Sound plays at transition 11→10, only if tile in viewport

**Fog of War:**
- `revealed[][]` boolean array tracks discovered tiles
- `revealAround(x, y)` reveals 3-tile radius around player
- Only revealed tiles render

**Camera System:**
- Viewport follows player with `constrain()` to prevent out-of-bounds
- `camX` and `camY` calculated from player position
- Used in `draw()` and `updateExplosions()` for viewport checks

## Vision & Collaboration

Inspired by **Twitch Plays Pokemon** - designed for future multiplayer where multiple people control one character. The theme system enables artists to completely reimagine visuals (pixel art, watercolor, minimalist, etc.) while core exploration gameplay stays identical.

See CONTRIBUTING.md for contributor guidelines and theme contribution checklist.
