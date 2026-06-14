import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { parseTilesetMapping, TiledTileset } from './pixel-dungeon-tileset';

// Parse the real PixelDungeon.tsj (the single source of truth) the same way the game does.
// Nx runs vitest from the workspace root, so resolve the asset from there.
const tsjPath = join(process.cwd(), 'libs/np-pixel-dungeon/src/assets/PixelDungeon.tsj');
const tsj = JSON.parse(readFileSync(tsjPath, 'utf8')) as TiledTileset;

describe('parseTilesetMapping', () => {
    const mapping = parseTilesetMapping(tsj);

    it('defines every role the game requires', () => {
        expect(Object.keys(mapping)).toHaveLength(31);
    });

    it('maps a single-tile role to a bare index (placed via putTileAt)', () => {
        expect(mapping.FLOOR).toBe(4);
        expect(mapping.EMPTY).toBe(144);
    });

    it('maps a multi-tile role to a weighted set (placed via weightedRandomize)', () => {
        expect(mapping.WALL_TOP_JUNCTION).toEqual([
            { index: 88, weight: 4 },
            { index: 89, weight: 4 },
            { index: 90, weight: 4 },
        ]);
    });

    it('expands a tile that serves more than one role', () => {
        // tile 80 carries roles "WALL_TOP,WALL_TOP_OUTER"
        expect(mapping.WALL_TOP).toBe(80);
        expect(mapping.WALL_TOP_OUTER).toBe(80);
    });

    it('throws a clear error when a required role is missing', () => {
        const broken: TiledTileset = { tilewidth: 16, tileheight: 16, tiles: [{ id: 4, type: 'FLOOR' }] };
        expect(() => parseTilesetMapping(broken)).toThrow(/missing tile roles/);
    });
});
