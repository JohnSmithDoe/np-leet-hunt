import { PixelDungeonTile } from './pixel-dungeon.tile';

export class PixelDungeonHallway {
    #tiles: PixelDungeonTile[];
    #region: number;

    *[Symbol.iterator](): Iterator<PixelDungeonTile> {
        for (const tile of this.#tiles) {
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
        this.#tiles.sort((a, b) => a.x - b.x).sort((a, b) => a.y - b.y);
    }

    get tiles() {
        return this.#tiles;
    }
}
