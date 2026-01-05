/*  CONFIGURATION */
const WORLD_SIZE = 128; // world is 128 × 128 tiles
const FIXED_VIEW_TILES = 32; // tiles visible across
const DPAD_MIN_PX = 40; // smallest button diameter

/*  ========================================
    AUDIO SYSTEM - Procedurally generated sounds
    ======================================== */

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.muted = false;
    this.initialized = false;
    this.currentMusicInterval = null;
  }

  init() {
    if (this.initialized) return;
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.3; // Lower volume
      this.initialized = true;
    } catch (e) {
      console.log('Audio not supported');
    }
  }

  playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.initialized || this.muted) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.type = type;
    osc.frequency.value = frequency;

    gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + duration);
  }

  playChord(frequencies, duration, type = 'sine', volume = 0.2) {
    frequencies.forEach(freq => this.playTone(freq, duration, type, volume));
  }

  playCoinSound() {
    this.playTone(880, 0.1, 'square', 0.2);
    setTimeout(() => this.playTone(1320, 0.1, 'square', 0.15), 50);
  }

  playDamageSound() {
    this.playTone(110, 0.3, 'sawtooth', 0.3);
    this.playTone(55, 0.4, 'sawtooth', 0.2);
  }

  playExplosionSound() {
    // White noise burst
    if (!this.initialized || this.muted) return;
    const bufferSize = this.audioContext.sampleRate * 0.3;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    const noiseGain = this.audioContext.createGain();
    noise.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noiseGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    noise.start();
  }

  playMoveSound() {
    this.playTone(440, 0.05, 'square', 0.1);
  }

  startMusic(theme) {
    this.stopMusic();
    if (!this.initialized || this.muted) return;

    // Different music patterns for each theme
    if (theme === 'Vaporwave') {
      this.playVaporwaveMusic();
    } else if (theme === 'Pixel Art Retro') {
      this.playRetroMusic();
    } else if (theme === 'ASCII Terminal') {
      this.playTerminalMusic();
    }
  }

  playVaporwaveMusic() {
    // Slow, atmospheric chords
    const chords = [
      [261.63, 329.63, 392.00], // C major
      [293.66, 369.99, 440.00], // D minor
      [246.94, 311.13, 369.99], // B diminished
      [293.66, 369.99, 440.00], // D minor
    ];
    let index = 0;

    this.currentMusicInterval = setInterval(() => {
      if (!this.muted && this.initialized) {
        this.playChord(chords[index], 2.0, 'sine', 0.08);
      }
      index = (index + 1) % chords.length;
    }, 2000);
  }

  playRetroMusic() {
    // 8-bit style melody
    const melody = [523.25, 587.33, 659.25, 523.25, 659.25, 783.99, 880.00, 783.99];
    let index = 0;

    this.currentMusicInterval = setInterval(() => {
      if (!this.muted && this.initialized) {
        this.playTone(melody[index], 0.3, 'square', 0.12);
      }
      index = (index + 1) % melody.length;
    }, 400);
  }

  playTerminalMusic() {
    // Minimal beeps
    const notes = [440, 554.37, 659.25, 554.37];
    let index = 0;

    this.currentMusicInterval = setInterval(() => {
      if (!this.muted && this.initialized) {
        this.playTone(notes[index], 0.15, 'square', 0.06);
      }
      index = (index + 1) % notes.length;
    }, 1000);
  }

  stopMusic() {
    if (this.currentMusicInterval) {
      clearInterval(this.currentMusicInterval);
      this.currentMusicInterval = null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopMusic();
    }
    return this.muted;
  }
}

const audioManager = new AudioManager();

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
    // Better responsive sizing
    const pad = max(TILE_SIZE * 0.4, 8);
    const fontSize = max(TILE_SIZE * 0.45, 11);
    const lineHeight = fontSize * 1.4; // Proper line spacing
    const boxPadding = max(TILE_SIZE * 0.2, 6);

    // Calculate box height based on text
    const h = boxPadding * 2 + lineHeight * 2;
    const w = max(TILE_SIZE * 5, VIEW_PIXELS * 0.22);

    /* scoreboard */
    push();
    fill(...this.colors.deepPurple, 200);
    rect(pad, pad, w, h, 6);
    noFill();
    stroke(...this.colors.pink);
    strokeWeight(2);
    rect(pad, pad, w, h, 6);
    pop();

    fill(...this.colors.cyan);
    textAlign(LEFT, TOP);
    textSize(fontSize);
    text(`Score: ${score}`, pad + boxPadding, pad + boxPadding);
    text(`Lives: ${lives}`, pad + boxPadding, pad + boxPadding + lineHeight);

    /* tile info */
    if (tileInfo) {
      const ix = VIEW_PIXELS - w - pad;
      push();
      fill(...this.colors.deepPurple, 200);
      rect(ix, pad, w, h, 6);
      noFill();
      stroke(...this.colors.pink);
      strokeWeight(2);
      rect(ix, pad, w, h, 6);
      pop();

      fill(...this.colors.cyan);
      textSize(fontSize * 0.9);
      textAlign(LEFT, TOP);
      text(`${tileInfo.type}`, ix + boxPadding, pad + boxPadding);
      text(`[${tileInfo.x},${tileInfo.y}]`, ix + boxPadding, pad + boxPadding + lineHeight);
    }

    /* instruction - only show if enough space */
    if (VIEW_PIXELS > 400) {
      fill(...this.colors.pink, 200);
      textAlign(CENTER);
      textSize(fontSize * 0.8);
      text("Arrow keys or D-pad", VIEW_PIXELS / 2, VIEW_PIXELS - pad - fontSize);
    }

    /* mute button */
    const muteSize = max(fontSize * 1.8, 24);
    const muteX = VIEW_PIXELS / 2;
    const muteY = pad + h / 2;
    fill(...this.colors.pink, audioManager.muted ? 100 : 255);
    textAlign(CENTER, CENTER);
    textSize(muteSize);
    text(audioManager.muted ? "🔇" : "🔊", muteX, muteY);
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
    // Scale arrow text size with D-pad size, but ensure minimum readability
    textSize(max(s * 0.55, 16));
    text("←", cx - o, cy);
    text("→", cx + o, cy);
    text("↑", cx, cy - o);
    text("↓", cx, cy + o);
    pop();
  }
};

const PIXEL_ART_THEME = {
  name: "Pixel Art Retro",

  colors: {
    sky: [92, 148, 252],      // NES blue sky
    ground: [188, 148, 92],   // brown ground
    grass: [0, 168, 0],       // NES green
    lava: [248, 56, 0],       // bright red-orange
    coin: [252, 188, 0],      // golden yellow
    wall: [80, 80, 80],       // dark gray
    player: [252, 216, 168],  // skin tone
    playerOutline: [228, 92, 16], // orange outline
    black: [0, 0, 0],
    white: [255, 255, 255],
    uiBox: [64, 64, 64],
    shrine: [160, 120, 252],  // purple
    // Colors used by game code for unrevealed tiles and start screen
    deepPurple: [40, 40, 60],
    purple: [100, 80, 140],
    cyan: [0, 255, 255],
    pink: [255, 100, 180]
  },

  drawBackground: function() {
    // Simple sky gradient - pixel art style
    noStroke();
    for (let y = 0; y < VIEW_PIXELS; y += 2) {
      let inter = map(y, 0, VIEW_PIXELS, 0, 1);
      let skyColor = lerpColor(
        color(92, 200, 252),
        color(40, 120, 200),
        inter
      );
      fill(skyColor);
      rect(0, y, VIEW_PIXELS, 2);
    }

    // Pixel clouds
    randomSeed(100);
    fill(255, 255, 255, 180);
    for (let i = 0; i < 15; i++) {
      let x = random(VIEW_PIXELS);
      let y = random(VIEW_PIXELS * 0.6);
      let cloudSize = floor(random(2, 5));

      // Draw blocky cloud
      for (let cy = 0; cy < cloudSize; cy++) {
        for (let cx = 0; cx < cloudSize * 2; cx++) {
          let pixelSize = max(TILE_SIZE * 0.15, 3);
          rect(x + cx * pixelSize, y + cy * pixelSize, pixelSize, pixelSize);
        }
      }
    }

    // Pixel stars (8-pointed)
    randomSeed(200);
    fill(255, 255, 255);
    for (let i = 0; i < 30; i++) {
      let x = random(VIEW_PIXELS);
      let y = random(VIEW_PIXELS);
      let twinkle = (frameCount + i * 10) % 60 < 30 ? 1 : 0;
      if (twinkle) {
        let pixelSize = max(TILE_SIZE * 0.1, 2);
        rect(x, y, pixelSize, pixelSize);
      }
    }
  },

  drawTile: function(type, x, y, wx, wy) {
    let tileSize = TILE_SIZE;
    let pixelSize = max(floor(tileSize / 8), 1); // 8x8 pixel tiles

    push();
    noStroke();

    switch (type) {
      case "floor":
        // Simple brown floor with subtle pattern
        fill(...this.colors.ground);
        rect(x, y, tileSize, tileSize);
        // Pixel detail
        if ((wx + wy) % 3 === 0) {
          fill(...this.colors.ground.map(c => c - 20));
          rect(x + pixelSize * 3, y + pixelSize * 3, pixelSize * 2, pixelSize * 2);
        }
        break;

      case "grass":
        // Green grass tile with pixel blades
        fill(...this.colors.grass);
        rect(x, y, tileSize, tileSize);
        // Grass blades
        fill(0, 200, 0);
        for (let i = 0; i < 3; i++) {
          rect(x + pixelSize * (2 + i * 2), y + pixelSize * 2, pixelSize, pixelSize * 4);
        }
        break;

      case "lava":
        // Animated lava
        let frame = floor(frameCount / 10) % 2;
        fill(...this.colors.lava);
        rect(x, y, tileSize, tileSize);
        // Lava bubbles
        fill(252, 160, 68);
        if (frame === 0) {
          rect(x + pixelSize * 2, y + pixelSize * 2, pixelSize * 3, pixelSize * 3);
        } else {
          rect(x + pixelSize * 4, y + pixelSize * 4, pixelSize * 2, pixelSize * 2);
        }
        break;

      case "coin":
        // Spinning coin animation
        let coinFrame = floor(frameCount / 8) % 4;
        fill(...this.colors.coin);

        if (coinFrame === 0 || coinFrame === 2) {
          // Full coin
          rect(x + pixelSize * 2, y + pixelSize * 1, pixelSize * 4, pixelSize * 6);
          fill(...this.colors.black);
          rect(x + pixelSize * 3, y + pixelSize * 2, pixelSize * 2, pixelSize * 4);
        } else if (coinFrame === 1) {
          // Medium coin
          rect(x + pixelSize * 3, y + pixelSize * 1, pixelSize * 2, pixelSize * 6);
        } else {
          // Thin coin
          rect(x + pixelSize * 3, y + pixelSize * 1, pixelSize * 1, pixelSize * 6);
        }
        break;

      case "wall":
        // Brick wall
        fill(...this.colors.wall);
        rect(x, y, tileSize, tileSize);
        // Brick pattern
        stroke(...this.colors.black);
        strokeWeight(1);
        line(x, y + tileSize/2, x + tileSize, y + tileSize/2);
        line(x + tileSize/2, y, x + tileSize/2, y + tileSize/2);
        line(x + tileSize/2, y + tileSize/2, x + tileSize/2, y + tileSize);
        noStroke();
        break;

      case "shrine":
        // Crystal shrine
        let shrineFrame = floor(frameCount / 15) % 4;
        fill(...this.colors.shrine);
        // Diamond shape
        let cx = x + tileSize/2;
        let cy = y + tileSize/2;
        let s = pixelSize * 2;
        quad(cx, cy - s*2, cx + s*2, cy, cx, cy + s*2, cx - s*2, cy);
        // Glow
        if (shrineFrame < 2) {
          fill(255, 255, 255, 150);
          quad(cx, cy - s, cx + s, cy, cx, cy + s, cx - s, cy);
        }
        break;

      case "explosion":
        let timer = explosionTimers[wy][wx];

        if (timer <= 10) {
          // Exploding - big blast
          fill(252, 216, 168);
          rect(x, y, tileSize, tileSize);
          fill(248, 56, 0);
          rect(x + pixelSize * 2, y + pixelSize * 2, pixelSize * 4, pixelSize * 4);
        } else if (timer < 30) {
          // Warning - blinking red
          let blink = floor(timer / 5) % 2;
          if (blink) {
            fill(248, 0, 0);
          } else {
            fill(168, 0, 0);
          }
          rect(x, y, tileSize, tileSize);
          // Warning symbol
          fill(255, 255, 0);
          rect(x + pixelSize * 3, y + pixelSize * 1, pixelSize * 2, pixelSize * 2);
          rect(x + pixelSize * 3, y + pixelSize * 4, pixelSize * 2, pixelSize * 3);
        } else {
          // Safe - yellow caution
          fill(252, 188, 0);
          rect(x, y, tileSize, tileSize);
          fill(0, 0, 0);
          rect(x + pixelSize * 3, y + pixelSize * 1, pixelSize * 2, pixelSize * 2);
          rect(x + pixelSize * 3, y + pixelSize * 4, pixelSize * 2, pixelSize * 3);
        }
        break;

      case "moving_hazard":
        // Fireball enemy
        let enemyFrame = floor(frameCount / 10) % 2;
        fill(248, 56, 0);
        rect(x + pixelSize * 1, y + pixelSize * 1, pixelSize * 6, pixelSize * 6);
        fill(252, 160, 68);
        if (enemyFrame === 0) {
          rect(x + pixelSize * 2, y + pixelSize * 2, pixelSize * 4, pixelSize * 4);
        } else {
          rect(x + pixelSize * 3, y + pixelSize * 3, pixelSize * 2, pixelSize * 2);
        }
        // Eyes
        fill(0, 0, 0);
        rect(x + pixelSize * 2, y + pixelSize * 2, pixelSize, pixelSize);
        rect(x + pixelSize * 5, y + pixelSize * 2, pixelSize, pixelSize);
        break;
    }
    pop();
  },

  drawPlayer: function(x, y, hurt) {
    let pixelSize = max(floor(TILE_SIZE / 8), 1);

    push();
    noStroke();

    // Player is a simple character sprite
    if (hurt) {
      fill(248, 56, 0); // Red when hurt
    } else {
      fill(...this.colors.playerOutline);
    }

    // Body (8x8 pixel character)
    rect(x - pixelSize * 3, y - pixelSize * 3, pixelSize * 6, pixelSize * 6);

    // Head/face color
    if (!hurt) {
      fill(...this.colors.player);
      rect(x - pixelSize * 2, y - pixelSize * 2, pixelSize * 4, pixelSize * 4);
    }

    // Eyes
    fill(...this.colors.black);
    rect(x - pixelSize * 1, y - pixelSize * 1, pixelSize, pixelSize);
    rect(x + pixelSize * 0, y - pixelSize * 1, pixelSize, pixelSize);

    pop();
  },

  drawHoverHighlight: function(tx, ty) {
    push();
    noFill();
    stroke(255, 255, 0);
    strokeWeight(2);
    rect(tx * TILE_SIZE, ty * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    pop();
  },

  drawHUD: function(score, lives, tileInfo) {
    // Better responsive sizing
    const pad = max(TILE_SIZE * 0.4, 8);
    const fontSize = max(TILE_SIZE * 0.45, 11);
    const lineHeight = fontSize * 1.5; // Extra spacing for pixel hearts
    const boxPadding = max(TILE_SIZE * 0.2, 6);

    // Calculate box height based on content
    const h = boxPadding * 2 + lineHeight * 2;
    const w = max(TILE_SIZE * 5, VIEW_PIXELS * 0.22);

    push();
    // Retro box style
    fill(...this.colors.uiBox);
    rect(pad, pad, w, h);
    fill(...this.colors.black);
    rect(pad + 2, pad + 2, w - 4, h - 4);

    fill(...this.colors.coin);
    textAlign(LEFT, TOP);
    textSize(fontSize);
    text(`${score}`, pad + boxPadding, pad + boxPadding);

    // Hearts for lives
    fill(248, 56, 0);
    let heartSize = max(fontSize * 0.7, 8);
    let heartsY = pad + boxPadding + lineHeight;
    for (let i = 0; i < lives; i++) {
      rect(pad + boxPadding + i * (heartSize + 3), heartsY, heartSize, heartSize);
    }

    // Tile info
    if (tileInfo) {
      const ix = VIEW_PIXELS - w - pad;
      fill(...this.colors.uiBox);
      rect(ix, pad, w, h);
      fill(...this.colors.black);
      rect(ix + 2, pad + 2, w - 4, h - 4);

      fill(...this.colors.white);
      textSize(fontSize * 0.9);
      textAlign(LEFT, TOP);
      text(`${tileInfo.type}`, ix + boxPadding, pad + boxPadding);
      text(`[${tileInfo.x},${tileInfo.y}]`, ix + boxPadding, pad + boxPadding + lineHeight);
    }

    // Instructions - only show if enough space
    if (VIEW_PIXELS > 400) {
      fill(...this.colors.white);
      textAlign(CENTER);
      textSize(fontSize * 0.8);
      text("ARROW KEYS / D-PAD", VIEW_PIXELS / 2, VIEW_PIXELS - pad - fontSize);
    }

    /* mute button */
    const muteSize = max(fontSize * 1.8, 24);
    const muteX = VIEW_PIXELS / 2;
    const muteY = pad + h / 2;
    fill(audioManager.muted ? 128 : 255, 255, 0);
    textAlign(CENTER, CENTER);
    textSize(muteSize);
    text(audioManager.muted ? "🔇" : "🔊", muteX, muteY);

    pop();
  },

  drawControls: function(dpadConfig) {
    const s = dpadConfig.size,
      o = dpadConfig.dist,
      cx = dpadConfig.cx,
      cy = dpadConfig.cy;

    push();
    // Retro D-pad design
    fill(80, 80, 80);

    // Cross shape
    rect(cx - s/2, cy - o, s, o * 2);
    rect(cx - o, cy - s/2, o * 2, s);

    // Buttons
    fill(60, 60, 60);
    rect(cx - o - s/2, cy - s/2, s, s); // Left
    rect(cx + o - s/2, cy - s/2, s, s); // Right
    rect(cx - s/2, cy - o - s/2, s, s); // Up
    rect(cx - s/2, cy + o - s/2, s, s); // Down

    // Arrows
    fill(200, 200, 200);
    textAlign(CENTER, CENTER);
    textSize(max(s * 0.55, 16));
    text("←", cx - o, cy);
    text("→", cx + o, cy);
    text("↑", cx, cy - o);
    text("↓", cx, cy + o);

    pop();
  }
};

const ASCII_THEME = {
  name: "ASCII Terminal",

  colors: {
    terminal: [0, 255, 0],        // classic green terminal
    terminalDim: [0, 180, 0],     // dimmer green
    background: [0, 0, 0],        // black background
    amber: [255, 191, 0],         // amber/gold
    red: [255, 0, 0],             // danger red
    white: [255, 255, 255],       // white
    gray: [128, 128, 128],        // gray
    // Required colors for game engine
    deepPurple: [0, 50, 0],
    purple: [0, 120, 0],
    cyan: [0, 255, 255],
    pink: [0, 255, 0]
  },

  drawBackground: function() {
    // Terminal-style background
    background(...this.colors.background);

    // Scan line effect
    push();
    stroke(0, 255, 0, 10);
    strokeWeight(1);
    for (let y = 0; y < VIEW_PIXELS; y += 4) {
      line(0, y, VIEW_PIXELS, y);
    }
    pop();

    // Subtle grid
    push();
    stroke(0, 255, 0, 8);
    strokeWeight(1);
    let gridSize = TILE_SIZE;
    for (let x = 0; x < VIEW_PIXELS; x += gridSize) {
      line(x, 0, x, VIEW_PIXELS);
    }
    for (let y = 0; y < VIEW_PIXELS; y += gridSize) {
      line(0, y, VIEW_PIXELS, y);
    }
    pop();
  },

  drawTile: function(type, x, y, wx, wy) {
    let cx = x + TILE_SIZE / 2;
    let cy = y + TILE_SIZE / 2;

    push();
    textAlign(CENTER, CENTER);
    textFont('Courier New');
    textSize(TILE_SIZE * 0.8);
    noStroke();

    switch (type) {
      case "floor":
        // Scattered dots
        if ((wx + wy) % 3 === 0) {
          fill(...this.colors.terminalDim);
          text("·", cx, cy);
        }
        break;

      case "grass":
        // Wavy grass
        fill(...this.colors.terminal);
        text("≈", cx, cy);
        break;

      case "lava":
        // Animated lava characters
        let lavaFrame = floor(frameCount / 10) % 3;
        fill(...this.colors.red);
        let lavaChars = ["≋", "≈", "∼"];
        text(lavaChars[lavaFrame], cx, cy);
        break;

      case "coin":
        // Spinning coin
        let coinFrame = floor(frameCount / 8) % 4;
        fill(...this.colors.amber);
        let coinChars = ["◯", "◐", "●", "◑"];
        text(coinChars[coinFrame], cx, cy);
        break;

      case "wall":
        // Solid block
        fill(...this.colors.terminal);
        text("█", cx, cy);
        break;

      case "shrine":
        // Pulsing shrine
        let shrineGlow = sin(frameCount * 0.1) * 0.3 + 0.7;
        fill(...this.colors.cyan.slice(0, 3), 255 * shrineGlow);
        text("✦", cx, cy);
        break;

      case "explosion":
        let timer = explosionTimers[wy][wx];

        if (timer <= 10) {
          // Exploding
          fill(...this.colors.amber);
          let explodeFrame = floor(frameCount / 3) % 3;
          let explodeChars = ["✱", "※", "✹"];
          text(explodeChars[explodeFrame], cx, cy);
        } else if (timer < 30) {
          // Warning - blinking
          let blink = floor(timer / 5) % 2;
          if (blink) {
            fill(...this.colors.red);
          } else {
            fill(...this.colors.amber);
          }
          text("!", cx, cy);
        } else {
          // Safe
          fill(...this.colors.amber);
          text("*", cx, cy);
        }
        break;

      case "moving_hazard":
        // Animated enemy
        let enemyFrame = floor(frameCount / 10) % 2;
        fill(...this.colors.red);
        text(enemyFrame === 0 ? "◉" : "●", cx, cy);
        break;
    }
    pop();
  },

  drawPlayer: function(x, y, hurt) {
    push();
    textAlign(CENTER, CENTER);
    textFont('Courier New');
    textSize(TILE_SIZE * 0.9);
    noStroke();

    if (hurt) {
      fill(...this.colors.red);
      text("☹", x, y);
    } else {
      fill(...this.colors.terminal);
      text("☺", x, y);
    }
    pop();
  },

  drawHoverHighlight: function(tx, ty) {
    push();
    noFill();
    stroke(...this.colors.amber);
    strokeWeight(2);
    rect(tx * TILE_SIZE, ty * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    pop();
  },

  drawHUD: function(score, lives, tileInfo) {
    // Better responsive sizing
    const pad = max(TILE_SIZE * 0.4, 8);
    const fontSize = max(TILE_SIZE * 0.45, 11);
    const lineHeight = fontSize * 1.4; // Proper line spacing
    const boxPadding = max(TILE_SIZE * 0.2, 6);

    // Calculate box height based on text
    const h = boxPadding * 2 + lineHeight * 2;
    const w = max(TILE_SIZE * 5, VIEW_PIXELS * 0.22);

    push();
    textFont('Courier New');

    // Score box with ASCII border
    fill(...this.colors.background, 200);
    rect(pad, pad, w, h);
    noFill();
    stroke(...this.colors.terminal);
    strokeWeight(2);
    rect(pad, pad, w, h);

    // Score
    fill(...this.colors.amber);
    textAlign(LEFT, TOP);
    textSize(fontSize);
    text(`$${score}`, pad + boxPadding, pad + boxPadding);

    // Hearts for lives (ASCII style)
    textSize(fontSize);
    let heartStr = "";
    for (let i = 0; i < lives; i++) {
      heartStr += "♥";
    }
    fill(...this.colors.red);
    text(heartStr, pad + boxPadding, pad + boxPadding + lineHeight);

    // Tile info
    if (tileInfo) {
      const ix = VIEW_PIXELS - w - pad;
      fill(...this.colors.background, 200);
      rect(ix, pad, w, h);
      noFill();
      stroke(...this.colors.terminal);
      strokeWeight(2);
      rect(ix, pad, w, h);

      fill(...this.colors.terminal);
      textSize(fontSize * 0.9);
      textAlign(LEFT, TOP);
      text(`${tileInfo.type}`, ix + boxPadding, pad + boxPadding);
      text(`[${tileInfo.x},${tileInfo.y}]`, ix + boxPadding, pad + boxPadding + lineHeight);
    }

    // Instructions - only show if enough space
    if (VIEW_PIXELS > 400) {
      fill(...this.colors.terminalDim);
      textAlign(CENTER);
      textSize(fontSize * 0.8);
      text("> ARROW KEYS / D-PAD <", VIEW_PIXELS / 2, VIEW_PIXELS - pad - fontSize);
    }

    /* mute button */
    const muteSize = max(fontSize * 1.8, 24);
    const muteX = VIEW_PIXELS / 2;
    const muteY = pad + h / 2;
    fill(...this.colors.terminal, audioManager.muted ? 80 : 255);
    textAlign(CENTER, CENTER);
    textSize(muteSize);
    text(audioManager.muted ? "🔇" : "🔊", muteX, muteY);

    pop();
  },

  drawControls: function(dpadConfig) {
    const s = dpadConfig.size,
      o = dpadConfig.dist,
      cx = dpadConfig.cx,
      cy = dpadConfig.cy;

    push();
    textFont('Courier New');

    // Terminal-style D-pad
    fill(...this.colors.background, 180);
    ellipse(cx, cy, s * 2.2);

    stroke(...this.colors.terminal);
    strokeWeight(2);
    noFill();
    ellipse(cx, cy, s * 2.2);

    // Button circles
    fill(...this.colors.background, 200);
    stroke(...this.colors.terminal);
    strokeWeight(2);
    ellipse(cx - o, cy, s);
    ellipse(cx + o, cy, s);
    ellipse(cx, cy - o, s);
    ellipse(cx, cy + o, s);

    // ASCII arrows
    fill(...this.colors.terminal);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(max(s * 0.6, 18));
    text("←", cx - o, cy);
    text("→", cx + o, cy);
    text("↑", cx, cy - o);
    text("↓", cx, cy + o);

    pop();
  }
};

// Available themes array
const THEMES = [
  VAPORWAVE_THEME,
  PIXEL_ART_THEME,
  ASCII_THEME
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
    return handleStartScreenTouch();
  }

  // Check mute button click (center top area)
  const pad = max(TILE_SIZE * 0.4, 8);
  const fontSize = max(TILE_SIZE * 0.45, 11);
  const lineHeight = fontSize * 1.4;
  const h = max(TILE_SIZE * 0.2, 6) * 2 + lineHeight * 2;
  const muteSize = max(fontSize * 1.8, 24);
  const muteX = VIEW_PIXELS / 2;
  const muteY = pad + h / 2;

  if (dist(mouseX, mouseY, muteX, muteY) < muteSize) {
    const wasMuted = audioManager.toggleMute();
    if (!wasMuted) {
      // If unmuted, restart music
      audioManager.startMusic(CURRENT_THEME.name);
    }
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
    return handleStartScreenTouch();
  }

  // Check mute button click (center top area)
  const pad = max(TILE_SIZE * 0.4, 8);
  const fontSize = max(TILE_SIZE * 0.45, 11);
  const lineHeight = fontSize * 1.4;
  const h = max(TILE_SIZE * 0.2, 6) * 2 + lineHeight * 2;
  const muteSize = max(fontSize * 1.8, 24);
  const muteX = VIEW_PIXELS / 2;
  const muteY = pad + h / 2;

  if (dist(mouseX, mouseY, muteX, muteY) < muteSize) {
    const wasMuted = audioManager.toggleMute();
    if (!wasMuted) {
      // If unmuted, restart music
      audioManager.startMusic(CURRENT_THEME.name);
    }
    return false;
  }
}

function handleStartScreenTouch() {
  // Check if user tapped on left arrow (left 30% of screen, middle height)
  if (THEMES.length > 1 && mouseX < VIEW_PIXELS * 0.35 &&
      mouseY > VIEW_PIXELS * 0.48 && mouseY < VIEW_PIXELS * 0.62) {
    // Previous theme
    selectedThemeIndex = (selectedThemeIndex - 1 + THEMES.length) % THEMES.length;
    CURRENT_THEME = THEMES[selectedThemeIndex];
    return false;
  }

  // Check if user tapped on right arrow (right 30% of screen, middle height)
  if (THEMES.length > 1 && mouseX > VIEW_PIXELS * 0.65 &&
      mouseY > VIEW_PIXELS * 0.48 && mouseY < VIEW_PIXELS * 0.62) {
    // Next theme
    selectedThemeIndex = (selectedThemeIndex + 1) % THEMES.length;
    CURRENT_THEME = THEMES[selectedThemeIndex];
    return false;
  }

  // Otherwise start the game
  startGame();
  return false;
}

/*  START SCREEN  */

function drawStartScreen() {
  // Draw background
  CURRENT_THEME.drawBackground();

  // Responsive text sizing with minimum sizes for readability
  const titleSize = max(VIEW_PIXELS * 0.08, 24);
  const subtitleSize = max(VIEW_PIXELS * 0.03, 12);
  const themeSize = max(VIEW_PIXELS * 0.04, 14);
  const instructionSize = max(VIEW_PIXELS * 0.025, 11);
  const startSize = max(VIEW_PIXELS * 0.035, 13);
  const arrowSize = max(VIEW_PIXELS * 0.08, 32);

  // Title
  push();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(titleSize);
  text("HITBOX", VIEW_PIXELS / 2, VIEW_PIXELS * 0.3);

  // Subtitle
  textSize(subtitleSize);
  fill(200);
  text("Collaborative Explorable Artwork", VIEW_PIXELS / 2, VIEW_PIXELS * 0.4);

  // Theme selector with visible arrows for mobile
  if (THEMES.length > 1) {
    // Left arrow
    fill(...CURRENT_THEME.colors.cyan);
    textSize(arrowSize);
    text("◀", VIEW_PIXELS * 0.2, VIEW_PIXELS * 0.55);

    // Theme name
    textSize(themeSize);
    fill(255);
    text(CURRENT_THEME.name, VIEW_PIXELS / 2, VIEW_PIXELS * 0.55);

    // Right arrow
    fill(...CURRENT_THEME.colors.cyan);
    textSize(arrowSize);
    text("▶", VIEW_PIXELS * 0.8, VIEW_PIXELS * 0.55);

    // Instructions
    textSize(instructionSize);
    fill(180);
    text("Tap arrows or use ← → keys", VIEW_PIXELS / 2, VIEW_PIXELS * 0.65);
  } else {
    // Theme info (if only one theme)
    textSize(themeSize);
    fill(255);
    text(`Theme: ${CURRENT_THEME.name}`, VIEW_PIXELS / 2, VIEW_PIXELS * 0.55);
  }

  // Start button
  textSize(startSize);
  fill(...CURRENT_THEME.colors.cyan);
  let pulse = sin(frameCount * 0.1) * 0.3 + 0.7;
  fill(...CURRENT_THEME.colors.pink, 255 * pulse);
  text("Tap Here or Press SPACE to Start", VIEW_PIXELS / 2, VIEW_PIXELS * 0.78);

  pop();
}

function startGame() {
  gameState = "playing";

  // Initialize audio on first user interaction (browser requirement)
  audioManager.init();
  audioManager.startMusic(CURRENT_THEME.name);

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
  audioManager.playDamageSound();
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
        let oldTimer = explosionTimers[y][x];
        explosionTimers[y][x]--;

        // Play sound when explosion starts (transitions to exploding state)
        if (oldTimer === 11 && explosionTimers[y][x] === 10) {
          // Only play if tile is revealed (avoid too many sounds)
          if (revealed[y][x]) {
            audioManager.playExplosionSound();
          }
        }

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
      if (r < 0.25) regions[ry][rx] = BIOMES.LAVA_FIELDS; // 25%
      else if (r < 0.55) regions[ry][rx] = BIOMES.CRYSTAL_GARDEN; // 30%
      else if (r < 0.80) regions[ry][rx] = BIOMES.NEON_CITY; // 25%
      else regions[ry][rx] = BIOMES.VOID; // 20%
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
          // Less static lava, more dynamic hazards
          world[y][x] = r < 0.20 ? "lava"      // 20% lava (was 45%)
                      : r < 0.30 ? "wall"      // 10% walls
                      : r < 0.40 ? "coin"      // 10% coins
                      : r < 0.55 ? "explosion" // 15% explosions (was 5%)
                      : "floor";               // 45% floor for exploring!
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
    audioManager.playCoinSound();
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
  /* 1. Make canvas fill the screen as much as possible while staying square */
  let availableWidth = windowWidth;
  let availableHeight = windowHeight;

  // Use the minimum dimension to keep it square and ensure it fits
  let maxDimension = min(availableWidth, availableHeight);

  // Calculate tile size to fill the available space
  TILE_SIZE = floor(maxDimension / FIXED_VIEW_TILES);
  VIEW_PIXELS = TILE_SIZE * FIXED_VIEW_TILES;

  /* 2. D-pad geometry - scale based on screen size */
  // Make D-pad larger on larger screens, smaller on mobile
  let baseDpadSize = VIEW_PIXELS * 0.12; // 12% of canvas
  dpad.size = constrain(baseDpadSize, DPAD_MIN_PX, TILE_SIZE * 4.5);
  dpad.dist = dpad.size * 1.2; // centre → button
  dpad.hit = dpad.size * 1.4; // generous hit radius

  /* 3. Position D-pad in bottom-right with responsive margin */
  const margin = max(dpad.size * 0.5, TILE_SIZE * 0.8); // responsive margin
  dpad.cx = VIEW_PIXELS - margin - dpad.dist;
  dpad.cy = VIEW_PIXELS - margin - dpad.dist;
}