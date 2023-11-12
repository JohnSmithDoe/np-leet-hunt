import { NPRect } from '@shared/np-library';

import { TDungeonTile } from '../@types/pixel-dungeon.types';
import { PixelDungeonJunction } from './pixel-dungeon.junction';

export class PixelDungeonRoom {
    bounds: NPRect;
    region: number;
    junctions: PixelDungeonJunction[];
    connects: number[];

    constructor(region: number) {
        this.region = region;
        this.bounds = new NPRect(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 0, 0);
    }

    addTile(tile: TDungeonTile) {
        const x = Math.min(this.bounds.x, tile.x);
        const width = Math.max(this.bounds.width, tile.x - this.bounds.x + 1); // hmm is this the other +1
        const y = Math.min(this.bounds.y, tile.y);
        const height = Math.max(this.bounds.height, tile.y - this.bounds.y + 1);
        this.bounds = new NPRect(x, y, width, height);
    }
}
