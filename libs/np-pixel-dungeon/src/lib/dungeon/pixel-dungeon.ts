import { CardinalDirections, directionToPos, EDirection, NPVec2 } from '@shared/np-library';

import { ETileType, TDungeonOptions, TDungeonTile } from '../@types/pixel-dungeon.types';
import { PixelDungeonFloor } from './parts/pixel-dungeon.floor';
import { PixelDungeonHallway } from './parts/pixel-dungeon.hallway';
import { PixelDungeonJunction } from './parts/pixel-dungeon.junction';
import { PixelDungeonRoom } from './parts/pixel-dungeon.room';
import { PixelDungeonTile } from './parts/pixel-dungeon.tile';
import { PixelDungeonWall } from './parts/pixel-dungeon.wall';
import { PixelDungeonFactory } from './pixel-dungeon.factory';

export class PixelDungeon implements Iterable<TDungeonTile> {
    readonly #dungeon: TDungeonTile[][];

    #walls: PixelDungeonWall[] = [];
    #junctions: PixelDungeonJunction[] = [];
    #halls: PixelDungeonHallway[] = [];
    #rooms: PixelDungeonRoom[] = [];
    // additional tile lists (populated in #mapDungeon, called from the constructor)
    #allTiles!: PixelDungeonTile[];
    #hallTiles!: PixelDungeonTile[];
    #roomTiles!: PixelDungeonTile[];

    *[Symbol.iterator](): Iterator<TDungeonTile> {
        for (const tileRow of this.#dungeon) {
            for (const tile of tileRow) {
                yield tile;
            }
        }
        return undefined;
    }

    // generation defaults are owned by PixelDungeonFactory (the single source of truth)
    constructor(options?: TDungeonOptions) {
        this.#dungeon = new PixelDungeonFactory().generate(options);
        this.#mapDungeon();
        this.#addStructure();
    }

    #addStructure() {
        this.#rooms.forEach(room => {
            room.junctions = this.junctions.filter(j => j.regions.has(room.region));
            // a room with a single door starts open
            if (room.junctions.length === 1) {
                room.junctions[0].setOpen(true, false);
            }
        });
    }

    #mapDungeon() {
        const regionRoomTiles: Record<number, PixelDungeonRoom> = {};
        const regionHallTiles: Record<number, PixelDungeonHallway> = {};

        for (const tile of this) {
            switch (tile.type) {
                case ETileType.none:
                    break;
                case ETileType.room:
                    (regionRoomTiles[tile.region] ??= new PixelDungeonRoom(tile.region)).addTile(
                        new PixelDungeonFloor(tile, this, true)
                    );
                    break;
                case ETileType.floor:
                    (regionHallTiles[tile.region] ??= new PixelDungeonHallway(tile.region)).addTile(
                        new PixelDungeonFloor(tile, this, false)
                    );
                    break;
                case ETileType.wall:
                    this.#walls.push(new PixelDungeonWall(tile, this));
                    break;
                case ETileType.junction:
                    this.#junctions.push(new PixelDungeonJunction(tile, this));
                    break;
            }
        }
        this.#rooms.push(...Object.values(regionRoomTiles));
        this.#halls.push(...Object.values(regionHallTiles));
        // additional access helper
        this.#hallTiles = this.#halls.reduce((all, cur) => {
            all.push(...cur.tiles);
            return all;
        }, [] as PixelDungeonTile[]);
        this.#roomTiles = this.#rooms.reduce((all, cur) => {
            all.push(...cur.tiles);
            return all;
        }, [] as PixelDungeonTile[]);
        this.#allTiles = [...this.#walls, ...this.#junctions, ...this.#hallTiles, ...this.#roomTiles];
    }

    get width() {
        return this.#dungeon[0].length;
    }

    get height() {
        return this.#dungeon.length;
    }

    get walls(): PixelDungeonWall[] {
        return this.#walls;
    }

    get junctions(): PixelDungeonJunction[] {
        return this.#junctions;
    }

    get halls(): PixelDungeonHallway[] {
        return this.#halls;
    }

    get rooms(): PixelDungeonRoom[] {
        return this.#rooms;
    }

    get all(): PixelDungeonTile[] {
        return this.#allTiles;
    }

    #tileXY(x: number, y: number) {
        return y >= 0 && x >= 0 && y < this.#dungeon.length && x < this.#dungeon[y].length ? this.#dungeon[y][x] : null;
    }

    #tile(pos: NPVec2) {
        return this.#tileXY(pos.x, pos.y);
    }

    hasTypeAt(pos: NPVec2, type: ETileType) {
        return this.#tile(pos)?.type === type;
    }

    hasTileAt(pos: NPVec2) {
        return !!this.#tile(pos);
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

    cardinalRegions(tile: TDungeonTile) {
        const regions = new Set<number>();
        const pos = new NPVec2(tile.x, tile.y);
        // collect cardinal regions of the wall
        CardinalDirections.forEach(dir => {
            const next = pos.add(directionToPos(dir));
            const neighbour = this.#tile(next);
            if (!neighbour) return;
            if (neighbour.region !== 0) regions.add(neighbour.region);
        });
        return regions;
    }
}
