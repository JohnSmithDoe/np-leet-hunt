import { PixelDungeon } from '../pixel-dungeon';
import { PixelDungeonJunction } from './pixel-dungeon.junction';
import { PixelDungeonTile } from './pixel-dungeon.tile';

export class PixelDungeonRoom {
    junctions: PixelDungeonJunction[];

    #tiles: PixelDungeonTile[] = [];
    #dungeon: PixelDungeon;
    #topLeft: PixelDungeonTile;
    #bottomLeft: PixelDungeonTile;
    #topRight: PixelDungeonTile;
    #bottomRight: PixelDungeonTile;
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

    topLeft() {
        return (this.#topLeft ??= this.#tiles.reduce((tile, curr) => {
            tile ??= curr;
            return tile.x <= curr.x && tile.y <= curr.y ? tile : curr;
        }, null));
    }

    topRight() {
        return (this.#topRight ??= this.#tiles.reduce((tile, curr) => {
            tile ??= curr;
            return tile.x >= curr.x && tile.y <= curr.y ? tile : curr;
        }, null));
    }

    bottomRight() {
        return (this.#bottomRight ??= this.#tiles.reduce((tile, curr) => {
            tile ??= curr;
            return tile.x >= curr.x && tile.y >= curr.y ? tile : curr;
        }, null));
    }

    bottomLeft() {
        return (this.#bottomLeft ??= this.#tiles.reduce((tile, curr) => {
            tile ??= curr;
            return tile.x <= curr.x && tile.y >= curr.y ? tile : curr;
        }, null));
    }
    get tiles() {
        return this.#tiles;
    }

    get region(): number {
        return this.#region;
    }
}
