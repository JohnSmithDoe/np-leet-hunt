import { PixelDungeonJunction } from './pixel-dungeon.junction';
import { PixelDungeonTile } from './pixel-dungeon.tile';

export class PixelDungeonRoom {
    junctions: PixelDungeonJunction[] = [];

    #tiles: PixelDungeonTile[] = [];
    #sorted = false;
    #topLeft?: PixelDungeonTile;
    #bottomLeft?: PixelDungeonTile;
    #topRight?: PixelDungeonTile;
    #bottomRight?: PixelDungeonTile;
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

    topLeft() {
        // a room always contains at least one tile
        return (this.#topLeft ??= this.#tiles.reduce<PixelDungeonTile | null>((tile, curr) => {
            tile ??= curr;
            return tile.x <= curr.x && tile.y <= curr.y ? tile : curr;
        }, null)!);
    }

    topRight() {
        // a room always contains at least one tile
        return (this.#topRight ??= this.#tiles.reduce<PixelDungeonTile | null>((tile, curr) => {
            tile ??= curr;
            return tile.x >= curr.x && tile.y <= curr.y ? tile : curr;
        }, null)!);
    }

    bottomRight() {
        // a room always contains at least one tile
        return (this.#bottomRight ??= this.#tiles.reduce<PixelDungeonTile | null>((tile, curr) => {
            tile ??= curr;
            return tile.x >= curr.x && tile.y >= curr.y ? tile : curr;
        }, null)!);
    }

    bottomLeft() {
        // a room always contains at least one tile
        return (this.#bottomLeft ??= this.#tiles.reduce<PixelDungeonTile | null>((tile, curr) => {
            tile ??= curr;
            return tile.x <= curr.x && tile.y >= curr.y ? tile : curr;
        }, null)!);
    }
    get tiles() {
        return this.#sortedTiles();
    }

    get region(): number {
        return this.#region;
    }
}
