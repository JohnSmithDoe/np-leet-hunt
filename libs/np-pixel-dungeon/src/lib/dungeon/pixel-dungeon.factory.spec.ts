import { ETileType, TDungeonTile } from '../@types/pixel-dungeon.types';
import { PixelDungeonFactory } from './pixel-dungeon.factory';

const WALKABLE = new Set<ETileType>([ETileType.floor, ETileType.room, ETileType.junction]);
const isWalkable = (tile: TDungeonTile) => WALKABLE.has(tile.type);

const generate = (seed: string, width = 21, height = 21) =>
    new PixelDungeonFactory().generate({ width, height, seed });

const CARDINALS: [number, number][] = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
];

describe('PixelDungeonFactory', () => {
    it('rejects even-sized dungeons (the grid must be odd-sized)', () => {
        expect(() => new PixelDungeonFactory().generate({ width: 20, height: 21 })).toThrow(/odd-sized/);
        expect(() => new PixelDungeonFactory().generate({ width: 21, height: 20 })).toThrow(/odd-sized/);
    });

    it('returns a grid wrapped in a one-tile empty border ((h+2) x (w+2))', () => {
        const grid = generate('frame');
        expect(grid).toHaveLength(23);
        grid.forEach(row => expect(row).toHaveLength(23));

        expect(grid[0].every(t => t.type === ETileType.none)).toBe(true);
        expect(grid[22].every(t => t.type === ETileType.none)).toBe(true);
        expect(grid.every(row => row[0].type === ETileType.none)).toBe(true);
        expect(grid.every(row => row[22].type === ETileType.none)).toBe(true);
    });

    it('is deterministic for a given seed', () => {
        const fingerprint = (grid: TDungeonTile[][]) => grid.map(row => row.map(t => t.type).join('')).join('\n');
        expect(fingerprint(generate('same-seed'))).toBe(fingerprint(generate('same-seed')));
    });

    it('produces a single fully-connected walkable area', () => {
        for (const seed of ['alpha', 'bravo', 'charlie', 'delta']) {
            const grid = generate(seed);
            const walkable = grid.flat().filter(isWalkable);
            expect(walkable.length).toBeGreaterThan(0);

            // Flood-fill from the first walkable tile across cardinal neighbours.
            const start = walkable[0];
            const seen = new Set<string>([`${start.x},${start.y}`]);
            const queue = [start];
            while (queue.length) {
                const { x, y } = queue.pop()!;
                for (const [dx, dy] of CARDINALS) {
                    const next = grid[y + dy]?.[x + dx];
                    if (!next || !isWalkable(next)) continue;
                    const key = `${next.x},${next.y}`;
                    if (seen.has(key)) continue;
                    seen.add(key);
                    queue.push(next);
                }
            }

            // Every walkable tile is reachable from the start => single region.
            expect(seen.size).toBe(walkable.length);
        }
    });

    it('leaves no dead-end corridors (no walkable tile with exactly one walkable neighbour)', () => {
        const grid = generate('no-dead-ends');
        for (const tile of grid.flat().filter(isWalkable)) {
            const exits = CARDINALS.filter(([dx, dy]) => {
                const next = grid[tile.y + dy]?.[tile.x + dx];
                return next && isWalkable(next);
            }).length;
            expect(exits).not.toBe(1);
        }
    });
});
