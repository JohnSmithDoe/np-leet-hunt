import { EDirection, NPVec2 } from '@shared/np-library';

import { ETileType, TDungeonOptions, TDungeonTile } from '../@types/pixel-dungeon.types';
import { PixelDungeonFactory } from './pixel-dungeon.factory';
import { PixelDungeonHallway } from './pixel-dungeon.hallway';
import { PixelDungeonJunction } from './pixel-dungeon.junction';
import { PixelDungeonRoom } from './pixel-dungeon.room';
import { PixelDungeonTile } from './pixel-dungeon.tile';
import { PixelDungeonWall } from './pixel-dungeon.wall';

const defaultDungeon: TDungeonOptions = {
    roomArea: 75,
    height: 25,
    width: 25,
    extraConnectorChance: 20,
    roomExtraSize: 0,
    straightenPercentage: 50,
};

export class PixelDungeon implements Iterable<TDungeonTile> {
    #options: TDungeonOptions;
    #dungeon: TDungeonTile[][];
    // regions -> room, hallways, junctions
    #regionTiles: Record<number, PixelDungeonTile[]> = {};
    #rooms: PixelDungeonRoom[];
    #halls: PixelDungeonHallway[];
    #junctions: PixelDungeonJunction[];
    #walls: PixelDungeonWall[];

    *[Symbol.iterator](): Iterator<TDungeonTile> {
        for (const tileRow of this.#dungeon) {
            for (const tile of tileRow) {
                yield tile;
            }
        }
        return undefined;
    }

    constructor(options?: TDungeonOptions) {
        this.#options = Object.assign({}, defaultDungeon, options ?? {});
    }

    init(mapTiles = true) {
        this.#dungeon = new PixelDungeonFactory().generate(this.#options);
        if (mapTiles) this.#mapTiles();
        // console.log(this.#regions, this.#rooms, this.#halls, this.#junctions);
    }

    #mapTiles() {
        this.#regionTiles = {};
        for (const tile of this) {
            switch (tile.type) {
                case ETileType.none:
                    break;
                case ETileType.room:
                case ETileType.floor:
                    (this.#regionTiles[tile.region] ??= []).push(new PixelDungeonTile(this, tile));
                    break;
                case ETileType.wall:
                    (this.#regionTiles[0] ??= []).push(new PixelDungeonWall(this, tile));
                    break;
                case ETileType.junction:
                    (this.#regionTiles[0] ??= []).push(new PixelDungeonJunction(this, tile));
                    break;
            }
        }
        console.log(this.#regionTiles);

        for (const tiles of Object.values(this.#regionTiles)) {
            switch (tiles[0].type) {
                case ETileType.floor:
                    (this.#halls ??= []).push(new PixelDungeonHallway(this, tiles));
                    break;
                case ETileType.room:
                    (this.#rooms ??= []).push(new PixelDungeonRoom(this, tiles));
                    break;
                case ETileType.wall:
                case ETileType.junction:
                    for (const wall of tiles) {
                        if (wall.type === ETileType.wall) {
                            (this.#walls ??= []).push(wall as PixelDungeonWall);
                        } else {
                            (this.#junctions ??= []).push(wall as PixelDungeonJunction);
                        }
                    }
                    break;
            }
        }
    }

    get width() {
        return this.#options.width;
    }

    get height() {
        return this.#options.height;
    }

    get rooms() {
        return this.#rooms;
    }

    get walls() {
        return this.#walls;
    }

    get junctions() {
        return this.#junctions;
    }

    tileXY(x: number, y: number) {
        return y >= 0 && x >= 0 && y < this.#dungeon.length && x < this.#dungeon[y].length ? this.#dungeon[y][x] : null;
    }

    tile(pos: NPVec2) {
        return this.tileXY(pos.x, pos.y);
    }

    neighbours(tile: TDungeonTile) {
        const tilePos = new NPVec2(tile.x, tile.y);
        const result = {} as Record<EDirection, TDungeonTile | null>;
        tilePos.neighbors.map(({ dir, pos }) => (result[dir] = this.tile(pos)));
        return result;
    }
}
