import { EDirection, NPVec2 } from '@shared/np-library';

import { ETileType, TDungeonOptions, TDungeonTile } from '../@types/pixel-dungeon.types';
import { PixelDungeonFactory } from './pixel-dungeon.factory';

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
        this.#dungeon = new PixelDungeonFactory().generate(this.#options);
    }

    get width() {
        return this.#dungeon[0].length;
    }

    get height() {
        return this.#dungeon.length;
    }

    tileXY(x: number, y: number) {
        return y >= 0 && x >= 0 && y < this.#dungeon.length && x < this.#dungeon[y].length ? this.#dungeon[y][x] : null;
    }

    tile(pos: NPVec2) {
        return this.tileXY(pos.x, pos.y);
    }

    hasTypeAt(pos: NPVec2, type: ETileType) {
        return this.tile(pos)?.type === type;
    }

    hasTileAt(pos: NPVec2) {
        return !!this.tile(pos);
    }

    wallTo(tile: TDungeonTile, dir: EDirection) {
        const pos = new NPVec2(tile.x, tile.y).addDirection(dir);
        return this.hasTypeAt(pos, ETileType.wall);
    }

    junctionTo(tile: TDungeonTile, dir: EDirection) {
        const pos = new NPVec2(tile.x, tile.y).addDirection(dir);
        return this.hasTypeAt(pos, ETileType.junction);
    }

    emptyTo(tile: TDungeonTile, dir: EDirection) {
        const pos = new NPVec2(tile.x, tile.y).addDirection(dir);
        return !this.hasTileAt(pos) || this.hasTypeAt(pos, ETileType.none);
    }

    floorTo(tile: TDungeonTile, dir: EDirection) {
        const pos = new NPVec2(tile.x, tile.y).addDirection(dir);
        return (
            this.hasTypeAt(pos, ETileType.room) ||
            this.hasTypeAt(pos, ETileType.floor) ||
            this.hasTypeAt(pos, ETileType.junction)
        );
    }
}
