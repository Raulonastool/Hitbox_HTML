/*  CONFIGURATION */
const WORLD_SIZE = 128; // world is 128 × 128 tiles
const FIXED_VIEW_TILES = 32; // tiles visible across
const DPAD_MIN_PX = 40; // smallest button diameter

/*  ========================================
    THEME SYSTEM - Swap this object to change visuals!
    ======================================== */

const VAPORWAVE_THEME = {
  name: "Vaporwave",

  colors: {
    pink: [255, 71, 184],
    purple: [138, 43, 226],
    cyan: [0, 255, 255],
    blue: [75, 0, 130],
    deepPurple: [30, 10, 50],
    neonPink: [255, 20, 147],
    grid: [255, 71, 184, 100]
  },

  drawBackground: function() {
    /* animated gradient background */
    bgGradientOffset += 0.003;
    let topColor = color(
      this.colors.deepPurple[0],
      this.colors.deepPurple[1] + sin(bgGradientOffset) * 20,
      this.colors.deepPurple[2] + cos(bgGradientOffset) * 30
    );
    let bottomColor = color(
      this.colors.blue[0] + sin(bgGradientOffset + PI) * 30,
      this.colors.blue[1],
      this.colors.blue[2]
    );

    /* draw gradient */
    for (let y = 0; y < VIEW_PIXELS; y++) {
      let inter = map(y, 0, VIEW_PIXELS, 0, 1);
      let c = lerpColor(topColor, bottomColor, inter);
      stroke(c);
      line(0, y, VIEW_PIXELS, y);
    }

    /* stars */
    noStroke();
    randomSeed(42);
    for (let i = 0; i < 80; i++) {
      let x = random(VIEW_PIXELS);
      let y = random(VIEW_PIXELS);
      let twinkle = sin(frameCount * 0.05 + i) * 0.5 + 0.5;
      fill(255, 255, 255, 150 * twinkle);
      ellipse(x, y, 2 + twinkle);
    }

    /* perspective grid */
    push();
    stroke(...this.colors.grid);
    strokeWeight(1.5);

    let gridSize = VIEW_PIXELS / 10;
    let gridY = VIEW_PIXELS * 0.7;
    let vanishY = VIEW_PIXELS * 0.4;
    let gridOffset = (frameCount * 0.5) % gridSize;

    /* horizontal lines */
    for (let i = 0; i < 15; i++) {
      let y = gridY + i * gridSize / 3 - gridOffset;
      if (y < VIEW_PIXELS) {
        let perspective = map(y, gridY, VIEW_PIXELS, 0.3, 1);
        let x1 = VIEW_PIXELS / 2 - (VIEW_PIXELS / 2) * perspective;
        let x2 = VIEW_PIXELS / 2 + (VIEW_PIXELS / 2) * perspective;
        stroke(...this.colors.grid.slice(0, 3), this.colors.grid[3] * perspective);
        line(x1, y, x2, y);
      }
    }

    /* vertical lines */
    for (let i = -5; i <= 5; i++) {
      let x = VIEW_PIXELS / 2 + i * gridSize;
      stroke(...this.colors.grid);
      line(x, vanishY, VIEW_PIXELS / 2 + i * gridSize * 2, VIEW_PIXELS);
    }

    pop();

    /* scan lines effect */
    noStroke();
    for (let y = 0; y < VIEW_PIXELS; y += 4) {
      fill(0, 0, 0, 8);
      rect(0, y, VIEW_PIXELS, 2);
    }
  },

  drawTile: function(type, x, y, wx, wy) {
    let cx = x + TILE_SIZE / 2,
      cy = y + TILE_SIZE / 2,
      base = TILE_SIZE * 0.6;
    push();
    switch (type) {
      case "floor":
        fill(...this.colors.cyan, 30);
        ellipse(cx, cy, base * 1.1);
        fill(...this.colors.cyan, 150);
        ellipse(cx, cy, base * 0.6);
        break;
      case "grass":
        fill(0, 255, 150, 40);
        ellipse(cx, cy, base * 1.2);
        fill(0, 255, 150);
        ellipse(cx, cy, base * 0.7);
        break;
      case "lava":
        let glow = 100 + sin(frameCount * 0.2 + wx) * 100;
        fill(...this.colors.neonPink, 80);
        ellipse(cx, cy, base * 1.4);
        fill(...this.colors.neonPink.slice(0, 2), glow);
        ellipse(cx, cy, base * 0.8);
        break;
      case "coin":
        let pulse = sin(frameCount * 0.1 + wx) * 0.2 + 0.8;
        fill(255, 215, 0, 80);
        ellipse(cx, cy, base * 1.1 * pulse);
        fill(255, 223, 0);
        ellipse(cx, cy, base * 0.6);
        break;
      case "wall":
        fill(...this.colors.purple, 200);
        ellipse(cx, cy, base);
        fill(...this.colors.purple, 100);
        ellipse(cx, cy, base * 0.5);
        break;
      case "shrine":
        let rotation = frameCount * 0.05;
        let shrineGlow = sin(frameCount * 0.1) * 0.5 + 0.5;
        fill(255, 255, 255, 100 * shrineGlow);
        ellipse(cx, cy, base * 1.5);
        push();
        translate(cx, cy);
        rotate(rotation);
        fill(...this.colors.cyan, 200);
        noStroke();
        quad(-base*0.4, 0, 0, -base*0.4, base*0.4, 0, 0, base*0.4);
        pop();
        fill(255, 255, 255);
        ellipse(cx, cy, base * 0.2);
        break;
      case "explosion":
        let timer = explosionTimers[wy][wx];
        let danger = timer < 30 ? map(timer, 0, 30, 255, 0) : 0;
        let warning = timer > 30 ? sin(timer * 0.3) * 128 + 128 : 255;

        if (timer <= 10) {
          // Exploding! DANGER!
          fill(255, 100, 0, 200);
          ellipse(cx, cy, base * 1.8);
          fill(255, 200, 0);
          ellipse(cx, cy, base * 1.2);
        } else if (timer < 30) {
          // About to explode
          fill(255, danger, 0, 150);
          ellipse(cx, cy, base * 1.3);
          fill(255, 150, 0);
          ellipse(cx, cy, base * 0.8);
        } else {
          // Warning state
          fill(255, 200, 0, warning * 0.5);
          ellipse(cx, cy, base * 1.1);
          fill(255, 200, 0, warning);
          ellipse(cx, cy, base * 0.6);
        }
        break;
      case "moving_hazard":
        // Animated moving lava orb
        let movePulse = sin(frameCount * 0.2) * 0.3 + 0.7;
        let moveGlow = sin(frameCount * 0.15) * 100 + 155;

        // Outer glow
        fill(255, 50, 0, 100 * movePulse);
        ellipse(cx, cy, base * 1.6);

        // Lava orb
        fill(255, moveGlow, 0);
        ellipse(cx, cy, base * 1.0 * movePulse);

        // Hot core
        fill(255, 255, 100);
        ellipse(cx, cy, base * 0.4);
        break;
    }
    pop();
  },

  drawPlayer: function(x, y, hurt) {
    push();
    if (hurt) {
      fill(...this.colors.neonPink, 200);
      stroke(...this.colors.neonPink, 100);
    } else {
      fill(255, 255, 0, 80);
      ellipse(x, y, TILE_SIZE * 0.8);
      fill(255, 255, 0);
      stroke(255, 255, 100, 150);
    }
    strokeWeight(3);
    ellipse(x, y, TILE_SIZE * 0.6);
    pop();
  },

  drawHoverHighlight: function(tx, ty) {
    push();
    let pulse = sin(frameCount * 0.1) * 0.3 + 0.7;
    fill(...this.colors.pink, 40 * pulse);
    ellipse(
      tx * TILE_SIZE + TILE_SIZE / 2,
      ty * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE * 0.95
    );
    noFill();
    stroke(...this.colors.pink, 100 * pulse);
    strokeWeight(2);
    ellipse(
      tx * TILE_SIZE + TILE_SIZE / 2,
      ty * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE * 0.9
    );
    pop();
  },

  drawHUD: function(score, lives, tileInfo) {
    const pad = TILE_SIZE * 0.3,
      w = TILE_SIZE * 6,
      h = TILE_SIZE * 2;

    /* scoreboard */
    push();
    fill(...this.colors.deepPurple, 200);
    rect(pad, pad, w, h, 8);
    noFill();
    stroke(...this.colors.pink);
    strokeWeight(2);
    rect(pad, pad, w, h, 8);
    pop();

    fill(...this.colors.cyan);
    textAlign(LEFT, TOP);
    textSize(TILE_SIZE * 0.4);
    text(`Score: ${score}`, pad + 10, pad + 5);
    text(`Lives: ${lives}`, pad + 10, pad + TILE_SIZE * 0.9);

    /* tile info */
    if (tileInfo) {
      const ix = width - w - pad;
      push();
      fill(...this.colors.deepPurple, 200);
      rect(ix, pad, w, h, 8);
      noFill();
      stroke(...this.colors.pink);
      strokeWeight(2);
      rect(ix, pad, w, h, 8);
      pop();

      fill(...this.colors.cyan);
      textSize(TILE_SIZE * 0.35);
      text(`Tile: ${tileInfo.type}`, ix + 10, pad + 5);
      text(`(${tileInfo.x}, ${tileInfo.y})`, ix + 10, pad + TILE_SIZE * 0.9);
    }

    /* instruction */
    fill(...this.colors.pink, 200);
    textAlign(CENTER);
    textSize(TILE_SIZE * 0.35);
    text("Arrow keys or on-screen D-pad", width / 2, height - TILE_SIZE * 0.5);
  },

  drawControls: function(dpadConfig) {
    const s = dpadConfig.size,
      o = dpadConfig.dist,
      cx = dpadConfig.cx,
      cy = dpadConfig.cy;

    push();
    noStroke();
    fill(...this.colors.pink, 30);
    ellipse(cx, cy, s * 1.8);
    fill(...this.colors.deepPurple, 180);
    ellipse(cx, cy, s * 1.4);
    noFill();
    stroke(...this.colors.pink);
    strokeWeight(2);
    ellipse(cx, cy, s * 1.4);

    noStroke();
    fill(...this.colors.purple, 100);
    ellipse(cx - o, cy, s);
    ellipse(cx + o, cy, s);
    ellipse(cx, cy - o, s);
    ellipse(cx, cy + o, s);

    fill(...this.colors.cyan);
    textAlign(CENTER, CENTER);
    textSize(s * 0.55);
    text("←", cx - o, cy);
    text("→", cx + o, cy);
    text("↑", cx, cy - o);
    text("↓", cx, cy + o);
    pop();
  }
};

// Available themes array
const THEMES = [
  VAPORWAVE_THEME
  // More themes can be added here
];

// Active theme - swap this to change the entire visual style!
let CURRENT_THEME = THEMES[0];

/*  GLOBAL STATE */
let TILE_SIZE, VIEW_PIXELS; // tile size & canvas side (px)
let canvas;
let bgGradientOffset = 0; // for animated gradient

/* game state */
let gameState = "start"; // "start" or "playing"
let selectedThemeIndex = 0;

/* player + world */
let player = { x: 64, y: 64, lives: 3, hurtTimer: 0 };
let world = [];
let revealed = [];
let biomes = []; // biome map
let explosionTimers = []; // tracks explosion countdowns
let movingHazards = []; // simple tile-based moving hazards
let score = 0;
let startX = 64,
  startY = 64;

/* biome types */
const BIOMES = {
  NEON_CITY: 'neon_city',
  LAVA_FIELDS: 'lava_fields',
  CRYSTAL_GARDEN: 'crystal_garden',
  VOID: 'void',
  SAFE_ZONE: 'safe_zone'
};

/* screen shake */
let shake = { duration: 0, magnitude: 0 };

/* D-pad geometry (updated every resize) */
const dpad = { size: 0, dist: 0, hit: 0, cx: 0, cy: 0 };

/*  INITIALISATION */

function setup() {
  calcTileSize(); // ← sets TILE_SIZE & dpad.*
  canvas = createCanvas(VIEW_PIXELS, VIEW_PIXELS);
  canvas.elt.setAttribute("tabindex", "0");
  canvas.elt.focus();

  noStroke();
  textFont("monospace");

  // World generation happens when game starts (not on setup)
}

/*  RESIZE HANDLER */

function windowResized() {
  calcTileSize();
  resizeCanvas(VIEW_PIXELS, VIEW_PIXELS);
}

/*  MAIN DRAW LOOP  */

function draw() {
  if (document.activeElement !== canvas.elt) canvas.elt.focus();

  if (gameState === "start") {
    drawStartScreen();
    return;
  }

  /* ─── background ─── */
  CURRENT_THEME.drawBackground();

  /* ─── update game state ─── */
  updateExplosions();
  updateMovingHazards();

  /* ─── check hazards continuously (for explosions while standing still) ─── */
  if (frameCount % 5 === 0) { // check every 5 frames
    checkHazards(player.x, player.y);
  }

  /* ─── camera shake ─── */
  push();
  if (shake.duration > 0) {
    translate(
      random(-shake.magnitude, shake.magnitude),
      random(-shake.magnitude, shake.magnitude)
    );
    shake.duration--;
  }

  /* ─── camera clamping ─── */
  let camX = constrain(
    player.x - FIXED_VIEW_TILES / 2,
    0,
    WORLD_SIZE - FIXED_VIEW_TILES
  );
  let camY = constrain(
    player.y - FIXED_VIEW_TILES / 2,
    0,
    WORLD_SIZE - FIXED_VIEW_TILES
  );

  /* ─── world tiles ─── */
  for (let y = 0; y < FIXED_VIEW_TILES; y++) {
    for (let x = 0; x < FIXED_VIEW_TILES; x++) {
      let wx = camX + x,
        wy = camY + y;
      if (revealed[wy][wx])
        CURRENT_THEME.drawTile(world[wy][wx], x * TILE_SIZE, y * TILE_SIZE, wx, wy);
      else {
        /* unrevealed tiles */
        fill(...CURRENT_THEME.colors.deepPurple, 180);
        rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        noFill();
        stroke(...CURRENT_THEME.colors.purple, 30);
        strokeWeight(1);
        rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  /* ─── hover highlight ─── */
  let tx = floor(mouseX / TILE_SIZE),
    ty = floor(mouseY / TILE_SIZE);
  if (tx >= 0 && tx < FIXED_VIEW_TILES && ty >= 0 && ty < FIXED_VIEW_TILES) {
    CURRENT_THEME.drawHoverHighlight(tx, ty);
  }

  /* Moving hazards are rendered as regular tiles in the tile loop above */

  /* ─── player ──── */
  let px = (player.x - camX) * TILE_SIZE + TILE_SIZE / 2;
  let py = (player.y - camY) * TILE_SIZE + TILE_SIZE / 2;
  if (player.hurtTimer > 0) player.hurtTimer--;
  CURRENT_THEME.drawPlayer(px, py, player.hurtTimer > 0);

  pop(); // end shake push

  /* ─── HUD & D-pad ── */
  let tileInfo = null;
  let hoverX = floor(mouseX / TILE_SIZE) + camX;
  let hoverY = floor(mouseY / TILE_SIZE) + camY;
  if (hoverX >= 0 && hoverX < WORLD_SIZE && hoverY >= 0 && hoverY < WORLD_SIZE && revealed[hoverY][hoverX]) {
    tileInfo = { type: world[hoverY][hoverX], x: hoverX, y: hoverY };
  }
  CURRENT_THEME.drawHUD(score, player.lives, tileInfo);
  CURRENT_THEME.drawControls(dpad);
}

/*  INPUT   */

function keyPressed() {
  if (gameState === "start") {
    // Theme selection
    if (keyCode === LEFT_ARROW) {
      selectedThemeIndex = (selectedThemeIndex - 1 + THEMES.length) % THEMES.length;
      CURRENT_THEME = THEMES[selectedThemeIndex];
      return false;
    }
    if (keyCode === RIGHT_ARROW) {
      selectedThemeIndex = (selectedThemeIndex + 1) % THEMES.length;
      CURRENT_THEME = THEMES[selectedThemeIndex];
      return false;
    }
    // Start game
    if (key === ' ' || keyCode === ENTER) {
      startGame();
      return false;
    }
    return false;
  }

  // In-game controls
  let dx = 0,
    dy = 0;
  if (keyCode === LEFT_ARROW) dx = -1;
  if (keyCode === RIGHT_ARROW) dx = 1;
  if (keyCode === UP_ARROW) dy = -1;
  if (keyCode === DOWN_ARROW) dy = 1;

  if (dx || dy) {
    tryMove(dx, dy);
    return false;
  } // block page scrolling
}

function touchStarted() {
  if (gameState === "start") {
    // Touch anywhere to start
    startGame();
    return false;
  }

  /* four hit-tests against the invisible circles */
  if (dist(mouseX, mouseY, dpad.cx - dpad.dist, dpad.cy) < dpad.hit)
    tryMove(-1, 0);
  if (dist(mouseX, mouseY, dpad.cx + dpad.dist, dpad.cy) < dpad.hit)
    tryMove(1, 0);
  if (dist(mouseX, mouseY, dpad.cx, dpad.cy - dpad.dist) < dpad.hit)
    tryMove(0, -1);
  if (dist(mouseX, mouseY, dpad.cx, dpad.cy + dpad.dist) < dpad.hit)
    tryMove(0, 1);
  return false;
}

function mouseClicked() {
  if (gameState === "start") {
    startGame();
    return false;
  }
}

/*  START SCREEN  */

function drawStartScreen() {
  // Draw background
  CURRENT_THEME.drawBackground();

  // Title
  push();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(VIEW_PIXELS * 0.08);
  text("HITBOX", VIEW_PIXELS / 2, VIEW_PIXELS * 0.3);

  // Subtitle
  textSize(VIEW_PIXELS * 0.03);
  fill(200);
  text("Collaborative Explorable Artwork", VIEW_PIXELS / 2, VIEW_PIXELS * 0.4);

  // Theme info
  textSize(VIEW_PIXELS * 0.04);
  fill(255);
  text(`Theme: ${CURRENT_THEME.name}`, VIEW_PIXELS / 2, VIEW_PIXELS * 0.55);

  // Instructions
  textSize(VIEW_PIXELS * 0.025);
  fill(180);
  if (THEMES.length > 1) {
    text("← → to change theme", VIEW_PIXELS / 2, VIEW_PIXELS * 0.65);
  }

  // Start button
  textSize(VIEW_PIXELS * 0.035);
  fill(...CURRENT_THEME.colors.cyan);
  let pulse = sin(frameCount * 0.1) * 0.3 + 0.7;
  fill(...CURRENT_THEME.colors.pink, 255 * pulse);
  text("Press SPACE or Click to Start", VIEW_PIXELS / 2, VIEW_PIXELS * 0.75);

  pop();
}

function startGame() {
  gameState = "playing";
  generateWorld();
  revealAround(player.x, player.y);
}

/*  GAME LOGIC  */

function tryMove(dx, dy) {
  let nx = player.x + dx,
    ny = player.y + dy;
  if (
    nx >= 0 &&
    nx < WORLD_SIZE &&
    ny >= 0 &&
    ny < WORLD_SIZE &&
    world[ny][nx] !== "wall"
  ) {
    player.x = nx;
    player.y = ny;
    revealAround(nx, ny);
    collectCoin(nx, ny);
    checkHazards(nx, ny);
  }
}

function checkHazards(x, y) {
  // Check lava
  if (world[y][x] === "lava") {
    damagePlayer();
    return;
  }

  // Check explosion tiles (if currently exploding)
  if (world[y][x] === "explosion" && explosionTimers[y][x] <= 10) {
    damagePlayer();
    return;
  }

  // Check moving hazard tiles
  if (world[y][x] === "moving_hazard") {
    damagePlayer();
    return;
  }
}

function damagePlayer() {
  player.lives--;
  player.hurtTimer = 15;
  shake = { duration: 10, magnitude: 5 };
  if (player.lives <= 0) {
    score = 0;
    Object.assign(player, { x: startX, y: startY, lives: 3, hurtTimer: 30 });
  }
}

function updateExplosions() {
  // Update explosion timers
  for (let y = 0; y < WORLD_SIZE; y++) {
    for (let x = 0; x < WORLD_SIZE; x++) {
      if (world[y][x] === "explosion") {
        explosionTimers[y][x]--;
        if (explosionTimers[y][x] <= 0) {
          explosionTimers[y][x] = 120; // reset timer (2 seconds at 60fps)
        }
      }
    }
  }
}

function updateMovingHazards() {
  // Update each moving hazard (simple tile-based movement)
  for (let hazard of movingHazards) {
    hazard.moveTimer++;
    if (hazard.moveTimer >= hazard.moveSpeed) {
      hazard.moveTimer = 0;

      // Clear old position
      world[hazard.y][hazard.x] = hazard.underTile;

      // Move along path
      hazard.pathProgress++;
      if (hazard.pathProgress >= hazard.path.length) {
        hazard.pathProgress = 0; // loop path
      }

      // Update position
      let newPos = hazard.path[hazard.pathProgress];
      hazard.x = newPos.x;
      hazard.y = newPos.y;

      // Save what's under the new position and place hazard
      hazard.underTile = world[hazard.y][hazard.x];
      world[hazard.y][hazard.x] = "moving_hazard";
    }
  }
}

function generateWorld() {
  // Initialize arrays
  for (let y = 0; y < WORLD_SIZE; y++) {
    world[y] = [];
    revealed[y] = [];
    biomes[y] = [];
    for (let x = 0; x < WORLD_SIZE; x++) {
      world[y][x] = "floor";
      revealed[y][x] = false;
      biomes[y][x] = BIOMES.VOID;
    }
  }

  // Generate biomes using region-based approach with noise for organic boundaries
  // First, create large biome regions
  let regionSize = 16; // each region is 16x16 tiles
  let regions = [];
  for (let ry = 0; ry < WORLD_SIZE / regionSize; ry++) {
    regions[ry] = [];
    for (let rx = 0; rx < WORLD_SIZE / regionSize; rx++) {
      let r = random();
      // Distribute regions more evenly
      if (r < 0.40) regions[ry][rx] = BIOMES.LAVA_FIELDS; // 40%
      else if (r < 0.65) regions[ry][rx] = BIOMES.CRYSTAL_GARDEN; // 25%
      else if (r < 0.85) regions[ry][rx] = BIOMES.NEON_CITY; // 20%
      else regions[ry][rx] = BIOMES.VOID; // 15%
    }
  }

  // Now apply with noise for organic boundaries
  let noiseScale = 0.08;
  for (let y = 0; y < WORLD_SIZE; y++) {
    for (let x = 0; x < WORLD_SIZE; x++) {
      let rx = floor(x / regionSize);
      let ry = floor(y / regionSize);
      let baseBiome = regions[ry][rx];

      // Use noise to create fuzzy boundaries between regions
      let n = noise(x * noiseScale, y * noiseScale);

      // Occasionally let noise override to create natural variation
      if (n > 0.8) {
        // Check neighboring region
        let nrx = constrain(rx + (x % regionSize > regionSize/2 ? 1 : -1), 0, floor(WORLD_SIZE/regionSize) - 1);
        let nry = constrain(ry + (y % regionSize > regionSize/2 ? 1 : -1), 0, floor(WORLD_SIZE/regionSize) - 1);
        biomes[y][x] = regions[nry][nrx];
      } else {
        biomes[y][x] = baseBiome;
      }
    }
  }

  // Create safe starting zone
  createSafeZone(startX, startY, 8);

  // Generate rooms (interesting structures) - reduced to preserve more biome tiles
  for (let i = 0; i < 12; i++) {
    let rx = floor(random(10, WORLD_SIZE - 10));
    let ry = floor(random(10, WORLD_SIZE - 10));
    let rw = floor(random(4, 8));
    let rh = floor(random(4, 8));
    createRoom(rx, ry, rw, rh);
  }

  // Generate treasure rooms
  for (let i = 0; i < 6; i++) {
    let tx = floor(random(10, WORLD_SIZE - 10));
    let ty = floor(random(10, WORLD_SIZE - 10));
    createTreasureRoom(tx, ty);
  }

  // Generate paths - reduced to preserve more natural biome distribution
  for (let i = 0; i < 10; i++) {
    let x1 = floor(random(WORLD_SIZE));
    let y1 = floor(random(WORLD_SIZE));
    let x2 = floor(random(WORLD_SIZE));
    let y2 = floor(random(WORLD_SIZE));
    createPath(x1, y1, x2, y2);
  }

  // Initialize explosion timers array
  for (let y = 0; y < WORLD_SIZE; y++) {
    explosionTimers[y] = [];
    for (let x = 0; x < WORLD_SIZE; x++) {
      explosionTimers[y][x] = 0;
    }
  }

  // Fill tiles based on biomes
  for (let y = 0; y < WORLD_SIZE; y++) {
    for (let x = 0; x < WORLD_SIZE; x++) {
      if (world[y][x] !== "floor") continue; // skip already set tiles

      let biome = biomes[y][x];
      let r = random();

      switch(biome) {
        case BIOMES.LAVA_FIELDS:
          // More lava, plus explosion tiles
          world[y][x] = r < 0.45 ? "lava"
                      : r < 0.55 ? "wall"
                      : r < 0.6 ? "coin"
                      : r < 0.65 ? "explosion"
                      : "floor";
          if (world[y][x] === "explosion") {
            explosionTimers[y][x] = floor(random(60, 180)); // random initial timer
          }
          break;
        case BIOMES.NEON_CITY:
          world[y][x] = r < 0.25 ? "wall"
                      : r < 0.35 ? "coin"
                      : r < 0.38 ? "explosion"
                      : "floor";
          if (world[y][x] === "explosion") {
            explosionTimers[y][x] = floor(random(60, 180));
          }
          break;
        case BIOMES.CRYSTAL_GARDEN:
          world[y][x] = r < 0.5 ? "grass" : r < 0.6 ? "coin" : "floor";
          break;
        case BIOMES.VOID:
          world[y][x] = r < 0.05 ? "wall" : r < 0.08 ? "coin" : "floor";
          break;
        case BIOMES.SAFE_ZONE:
          world[y][x] = r < 0.3 ? "grass" : r < 0.4 ? "coin" : "floor";
          break;
      }
    }
  }

  // Add shrines (points of interest)
  for (let i = 0; i < 5; i++) {
    let sx = floor(random(10, WORLD_SIZE - 10));
    let sy = floor(random(10, WORLD_SIZE - 10));
    createShrine(sx, sy);
  }

  // Create moving hazards (simple tile-based that follow paths)
  let hazardsCreated = 0;
  let attempts = 0;
  while (hazardsCreated < 10 && attempts < 50) {
    attempts++;
    let mx = floor(random(15, WORLD_SIZE - 15));
    let my = floor(random(15, WORLD_SIZE - 15));
    let distFromStart = dist(mx, my, startX, startY);

    // Must be far enough from start
    if (distFromStart > 15 && world[my][mx] === "floor") {
      // Create a simple path (either horizontal or vertical)
      let path = [];
      let isHorizontal = random() > 0.5;
      let pathLength = floor(random(4, 8));

      if (isHorizontal) {
        // Move horizontally
        for (let i = 0; i < pathLength; i++) {
          let px = mx + i;
          if (px < WORLD_SIZE && world[my][px] === "floor") {
            path.push({ x: px, y: my });
          }
        }
        // Return path
        for (let i = pathLength - 2; i > 0; i--) {
          path.push({ x: mx + i, y: my });
        }
      } else {
        // Move vertically
        for (let i = 0; i < pathLength; i++) {
          let py = my + i;
          if (py < WORLD_SIZE && world[py][mx] === "floor") {
            path.push({ x: mx, y: py });
          }
        }
        // Return path
        for (let i = pathLength - 2; i > 0; i--) {
          path.push({ x: mx, y: my + i });
        }
      }

      if (path.length > 2) {
        let startPos = path[0];
        movingHazards.push({
          x: startPos.x,
          y: startPos.y,
          path: path,
          pathProgress: 0,
          moveTimer: floor(random(0, 30)),
          moveSpeed: 30, // move every 30 frames (0.5 seconds)
          underTile: world[startPos.y][startPos.x]
        });
        world[startPos.y][startPos.x] = "moving_hazard";
        hazardsCreated++;
      }
    }
  }
}

function createSafeZone(cx, cy, radius) {
  for (let y = cy - radius; y <= cy + radius; y++) {
    for (let x = cx - radius; x <= cx + radius; x++) {
      if (x >= 0 && x < WORLD_SIZE && y >= 0 && y < WORLD_SIZE) {
        let d = dist(x, y, cx, cy);
        if (d <= radius) {
          biomes[y][x] = BIOMES.SAFE_ZONE;
          world[y][x] = "floor";
        }
      }
    }
  }
}

function createRoom(x, y, w, h) {
  for (let j = y; j < y + h && j < WORLD_SIZE; j++) {
    for (let i = x; i < x + w && i < WORLD_SIZE; i++) {
      if (i >= 0 && j >= 0) {
        // Walls on edges
        if (i === x || i === x + w - 1 || j === y || j === y + h - 1) {
          if (random() > 0.2) world[j][i] = "wall"; // some gaps
        } else {
          world[j][i] = "floor";
        }
      }
    }
  }
}

function createTreasureRoom(x, y) {
  let size = 5;
  for (let j = y - size; j <= y + size; j++) {
    for (let i = x - size; i <= x + size; i++) {
      if (i >= 0 && i < WORLD_SIZE && j >= 0 && j < WORLD_SIZE) {
        let d = dist(i, j, x, y);
        if (d <= size) {
          if (d === floor(size)) {
            world[j][i] = "wall";
          } else {
            world[j][i] = random() < 0.4 ? "coin" : "floor";
          }
        }
      }
    }
  }
}

function createPath(x1, y1, x2, y2) {
  let steps = floor(dist(x1, y1, x2, y2));
  for (let i = 0; i <= steps; i++) {
    let t = i / steps;
    let x = floor(lerp(x1, x2, t));
    let y = floor(lerp(y1, y2, t));

    if (x >= 0 && x < WORLD_SIZE && y >= 0 && y < WORLD_SIZE) {
      world[y][x] = "floor";
      // Add width to path
      if (x + 1 < WORLD_SIZE) world[y][x + 1] = "floor";
      if (y + 1 < WORLD_SIZE) world[y + 1][x] = "floor";
    }
  }
}

function createShrine(x, y) {
  if (x >= 1 && x < WORLD_SIZE - 1 && y >= 1 && y < WORLD_SIZE - 1) {
    // 3x3 shrine with special marker
    for (let j = y - 1; j <= y + 1; j++) {
      for (let i = x - 1; i <= x + 1; i++) {
        world[j][i] = "floor";
      }
    }
    world[y][x] = "shrine";
    // Coins around it
    world[y - 1][x] = "coin";
    world[y + 1][x] = "coin";
    world[y][x - 1] = "coin";
    world[y][x + 1] = "coin";
  }
}

function collectCoin(x, y) {
  if (world[y][x] === "coin") {
    world[y][x] = "floor";
    score++;
  }
}

function revealAround(x, y) {
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++)
      if (
        x + dx >= 0 &&
        y + dy >= 0 &&
        x + dx < WORLD_SIZE &&
        y + dy < WORLD_SIZE
      )
        revealed[y + dy][x + dx] = true;
}

/*  SIZE & DPAD CALCULATION  */

function calcTileSize() {
  /* 1. square canvas that fits the shortest window edge */
  TILE_SIZE = floor(min(windowWidth, windowHeight) / FIXED_VIEW_TILES);
  VIEW_PIXELS = TILE_SIZE * FIXED_VIEW_TILES;

  /* 2. D-pad geometry (guaranteed on-screen) */
  dpad.size = constrain(VIEW_PIXELS * 0.1, DPAD_MIN_PX, TILE_SIZE * 4); // 10 % of canvas, clamped
  dpad.dist = dpad.size * 1.2; // centre → button
  dpad.hit = dpad.size * 1.3; // generous hit radius

  const margin = dpad.size * 0.6; // distance from canvas edge
  dpad.cx = VIEW_PIXELS - margin - dpad.size / 2;
  dpad.cy = VIEW_PIXELS - margin - dpad.size / 2;
}