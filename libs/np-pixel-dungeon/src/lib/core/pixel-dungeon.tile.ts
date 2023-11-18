import { EDirection, NPVec2 } from '@shared/np-library';

import { ETileType, TDungeonTile } from '../@types/pixel-dungeon.types';
import { PixelDungeon } from './pixel-dungeon';

export class PixelDungeonTile {
    pos: NPVec2;
    neighbours: Record<EDirection, TDungeonTile | null>;
    vertical = true;
    type: ETileType;
    region: number;

    constructor(dungeon: PixelDungeon, tile: TDungeonTile) {
        this.neighbours = dungeon.neighbours(tile);
        this.pos = new NPVec2(tile.x, tile.y);
        this.type = tile.type;
        this.region = tile.region;
    }

    wallTo(dir: EDirection) {
        return this.neighbours[dir]?.type === ETileType.wall;
    }

    get tileX(): number {
        return this.pos.x;
    }

    get tileY(): number {
        return this.pos.y;
    }
}
