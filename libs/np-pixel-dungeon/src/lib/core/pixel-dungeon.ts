import { ETileType, TDungeonOptions, TDungeonTile } from '../@types/pixel-dungeon.types';
import { PixelDungeonFactory } from './pixel-dungeon.factory';
import { PixelDungeonHallway } from './pixel-dungeon.hallway';
import { PixelDungeonJunction } from './pixel-dungeon.junction';
import { PixelDungeonRoom } from './pixel-dungeon.room';

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
    // regions -> room, hallways
    #regions: Record<number, PixelDungeonRoom | PixelDungeonHallway> = {};
    #rooms: PixelDungeonRoom[] = [];
    #halls: PixelDungeonHallway[] = [];
    #junctions: PixelDungeonJunction[] = [];

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

    init() {
        this.#dungeon = new PixelDungeonFactory().generate(this.#options);
        // this.#mapTiles();
        // console.log(this.#regions, this.#rooms, this.#halls, this.#junctions);
    }

    #mapTiles() {
        for (const tile of this) {
            const { type, region } = tile;
            if (type === ETileType.room) {
                const room = (this.#regions[region] ??= new PixelDungeonRoom(region)) as PixelDungeonRoom;
                room.addTile(tile);
                if (!this.#rooms.includes(room)) this.#rooms.push(room);
            } else if (type === ETileType.floor) {
                const hall = (this.#regions[region] ??= new PixelDungeonHallway(region)) as PixelDungeonHallway;
                hall.addTile(tile);
                if (!this.#halls.includes(hall)) this.#halls.push(hall);
            } else if (type === ETileType.junction) {
                this.#junctions.push(new PixelDungeonJunction(tile));
            }
        }
    }

    get width() {
        return this.#options.width;
    }
    get height() {
        return this.#options.height;
    }
}
