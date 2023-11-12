import { NPVec2 } from '@shared/np-library';

import { TDungeonTile } from '../@types/pixel-dungeon.types';

export class PixelDungeonHallway {
    fields: NPVec2[] = [];
    region: number;
    connects: number[];

    constructor(region: number) {
        this.region = region;
    }

    addTile({ x, y }: TDungeonTile) {
        this.fields.push(new NPVec2(x, y));
    }
}
