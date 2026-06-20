import { PixelDungeonTile } from './pixel-dungeon.tile';

export class PixelDungeonHallway {
    #tiles: PixelDungeonTile[];
    #sorted = false;
    #region: number;

    *[Symbol.iterator](): Iterator<PixelDungeonTile> {
        for (const tile of this.#sortedTiles()) {
            yield tile;
        }
        return undefined;
    }

    constructor(region: number) {
        this.#region = region;
        this.#tiles = [];
    }

    addTile(tile: PixelDungeonTile) {
        this.#tiles.push(tile);
        this.#sorted = false;
    }

    // row-major order (by y, then x); sorted once, lazily, after all tiles are added
    #sortedTiles() {
        if (!this.#sorted) {
            this.#tiles.sort((a, b) => a.y - b.y || a.x - b.x);
            this.#sorted = true;
        }
        return this.#tiles;
    }

    get tiles() {
        return this.#sortedTiles();
    }

    get region(): number {
        return this.#region;
    }
}
