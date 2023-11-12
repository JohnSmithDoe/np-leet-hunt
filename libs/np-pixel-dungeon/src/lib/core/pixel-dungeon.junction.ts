import { EDirection, NPVec2 } from '@shared/np-library';

import { TDungeonTile } from '../@types/pixel-dungeon.types';

export class PixelDungeonJunction {
    pos: NPVec2;
    regions: number[];
    direction: EDirection;

    constructor({ x, y }: TDungeonTile) {
        this.pos = new NPVec2(x, y);
    }
}
