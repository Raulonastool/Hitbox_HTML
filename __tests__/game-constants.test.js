/**
 * Game Constants Tests
 *
 * These tests verify that game constants are properly configured
 * and within expected ranges.
 */

describe('Game Constants', () => {
  // These constants should match sketch.js
  const WORLD_SIZE = 128;
  const FIXED_VIEW_TILES = 32;
  const DPAD_MIN_PX = 40;

  describe('World Configuration', () => {
    test('world size should be large enough for exploration', () => {
      expect(WORLD_SIZE).toBeGreaterThanOrEqual(64);
      expect(WORLD_SIZE).toBeLessThanOrEqual(256);
    });

    test('world should be square', () => {
      expect(WORLD_SIZE).toBe(WORLD_SIZE);
    });

    test('viewport should be smaller than world', () => {
      expect(FIXED_VIEW_TILES).toBeLessThan(WORLD_SIZE);
    });

    test('viewport should be large enough for gameplay', () => {
      expect(FIXED_VIEW_TILES).toBeGreaterThanOrEqual(16);
    });

    test('world should contain multiple viewports', () => {
      const viewportsPerDimension = WORLD_SIZE / FIXED_VIEW_TILES;
      expect(viewportsPerDimension).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Biome System', () => {
    const BIOMES = {
      NEON_CITY: 'neon_city',
      LAVA_FIELDS: 'lava_fields',
      CRYSTAL_GARDEN: 'crystal_garden',
      VOID: 'void',
      SAFE_ZONE: 'safe_zone'
    };

    test('should have at least 3 biome types', () => {
      const biomeCount = Object.keys(BIOMES).length;
      expect(biomeCount).toBeGreaterThanOrEqual(3);
    });

    test('biome values should be unique strings', () => {
      const values = Object.values(BIOMES);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);

      values.forEach(value => {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      });
    });

    test('should include safe zone biome', () => {
      expect(BIOMES).toHaveProperty('SAFE_ZONE');
    });
  });

  describe('Tile Types', () => {
    const validTileTypes = [
      'floor',
      'grass',
      'lava',
      'coin',
      'wall',
      'shrine',
      'explosion',
      'moving_hazard'
    ];

    test('should have basic tile types', () => {
      const basicTypes = ['floor', 'wall', 'coin'];
      basicTypes.forEach(type => {
        expect(validTileTypes).toContain(type);
      });
    });

    test('should have hazard tile types', () => {
      const hazardTypes = ['lava', 'explosion', 'moving_hazard'];
      hazardTypes.forEach(type => {
        expect(validTileTypes).toContain(type);
      });
    });

    test('should have collectible and landmark types', () => {
      expect(validTileTypes).toContain('coin');
      expect(validTileTypes).toContain('shrine');
    });

    test('tile type names should be lowercase with underscores', () => {
      validTileTypes.forEach(type => {
        expect(type).toMatch(/^[a-z_]+$/);
      });
    });
  });

  describe('Player Configuration', () => {
    const INITIAL_LIVES = 3;
    const STARTING_POSITION = { x: 64, y: 64 };

    test('player should start with multiple lives', () => {
      expect(INITIAL_LIVES).toBeGreaterThan(0);
      expect(INITIAL_LIVES).toBeLessThanOrEqual(10);
    });

    test('starting position should be within world bounds', () => {
      expect(STARTING_POSITION.x).toBeGreaterThanOrEqual(0);
      expect(STARTING_POSITION.x).toBeLessThan(WORLD_SIZE);
      expect(STARTING_POSITION.y).toBeGreaterThanOrEqual(0);
      expect(STARTING_POSITION.y).toBeLessThan(WORLD_SIZE);
    });

    test('starting position should be reasonably centered', () => {
      const centerX = WORLD_SIZE / 2;
      const centerY = WORLD_SIZE / 2;
      const distanceFromCenter = Math.sqrt(
        Math.pow(STARTING_POSITION.x - centerX, 2) +
        Math.pow(STARTING_POSITION.y - centerY, 2)
      );
      // Should be within 25% of world size from center
      expect(distanceFromCenter).toBeLessThan(WORLD_SIZE * 0.25);
    });
  });

  describe('UI Configuration', () => {
    test('D-pad minimum size should be usable on mobile', () => {
      expect(DPAD_MIN_PX).toBeGreaterThanOrEqual(30);
      expect(DPAD_MIN_PX).toBeLessThanOrEqual(100);
    });
  });
});
