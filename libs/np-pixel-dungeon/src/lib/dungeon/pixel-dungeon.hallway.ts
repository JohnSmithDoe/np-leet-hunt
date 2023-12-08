import { NPVec2 } from '@shared/np-library';

import { PixelDungeon } from './pixel-dungeon';
import { PixelDungeonTile } from './pixel-dungeon.tile';

export class PixelDungeonHallway {
    fields: NPVec2[] = [];
    region: number;
    connects: number[];
    #dungeon: PixelDungeon;
    #tiles: PixelDungeonTile[];

    constructor(dungeon: PixelDungeon, tiles: PixelDungeonTile[]) {
        this.#dungeon = dungeon;
        this.#tiles = tiles;
    }
}