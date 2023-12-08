import { ETileType } from '../@types/pixel-dungeon.types';
import { PixelDungeon } from './pixel-dungeon';
import { PixelDungeonJunction } from './pixel-dungeon.junction';
import { PixelDungeonTile } from './pixel-dungeon.tile';

export class PixelDungeonRoom {
    region: number;
    junctions: PixelDungeonJunction[];
    connects: number[];

    #tiles: PixelDungeonTile[] = [];
    #dungeon: PixelDungeon;
    #topLeft: PixelDungeonTile;
    #bottomLeft: PixelDungeonTile;
    #topRight: PixelDungeonTile;
    #bottomRight: PixelDungeonTile;

    *[Symbol.iterator](): Iterator<PixelDungeonTile> {
        const tiles = [...this.#tiles, ...this.#perspectiveBottomRow()];
        for (const tile of tiles) {
            yield tile;
        }
        return undefined;
    }

    constructor(dungeon: PixelDungeon, tiles: PixelDungeonTile[]) {
        this.#dungeon = dungeon;
        this.#tiles = tiles;
        this.#tiles.sort((a, b) => a.tileX - b.tileX).sort((a, b) => a.tileY - b.tileY);
        this.region ??= tiles[0].region;
    }

    topLeft() {
        return (this.#topLeft ??= this.#tiles.reduce((tile, curr) => {
            tile ??= curr;
            return tile.tileX <= curr.tileX && tile.tileY <= curr.tileY ? tile : curr;
        }, null));
    }

    topRight() {
        return (this.#topRight ??= this.#tiles.reduce((tile, curr) => {
            tile ??= curr;
            return tile.tileX >= curr.tileX && tile.tileY <= curr.tileY ? tile : curr;
        }, null));
    }

    bottomRight() {
        return (this.#bottomRight ??= this.#tiles.reduce((tile, curr) => {
            tile ??= curr;
            return tile.tileX >= curr.tileX && tile.tileY >= curr.tileY ? tile : curr;
        }, null));
    }

    bottomLeft() {
        return (this.#bottomLeft ??= this.#tiles.reduce((tile, curr) => {
            tile ??= curr;
            return tile.tileX <= curr.tileX && tile.tileY >= curr.tileY ? tile : curr;
        }, null));
    }

    #perspectiveBottomRow() {
        const left = this.bottomLeft().tileX;
        const bottom = this.bottomLeft().tileY + 1;
        const right = this.bottomRight().tileX;
        const result: PixelDungeonTile[] = [];
        for (let i = left; i <= right; i++) {
            result.push(
                new PixelDungeonTile(this.#dungeon, {
                    type: ETileType.room,
                    x: i,
                    y: bottom,
                    region: this.region,
                })
            );
        }
        return result;
    }
}
