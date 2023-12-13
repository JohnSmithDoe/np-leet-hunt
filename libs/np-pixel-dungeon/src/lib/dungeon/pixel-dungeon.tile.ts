import { EDirection, NPVec2 } from '@shared/np-library';
import ChessData from 'phaser3-rex-plugins/plugins/board/chess/ChessData';
import { TileXYType } from 'phaser3-rex-plugins/plugins/board/types/Position';

import { ETileType, TDungeonTile } from '../@types/pixel-dungeon.types';
import { PixelDungeon } from './pixel-dungeon';

export class PixelDungeonTile {
    rexChess: ChessData;
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

    junctionTo(dir: EDirection) {
        return this.neighbours[dir]?.type === ETileType.junction;
    }

    emptyTo(dir: EDirection) {
        return !this.neighbours[dir] || this.neighbours[dir].type === ETileType.none;
    }

    roomTo(dir: EDirection) {
        return (
            this.neighbours[dir]?.type === ETileType.room ||
            this.neighbours[dir]?.type === ETileType.floor ||
            this.neighbours[dir]?.type === ETileType.junction
        );
    }

    get tile(): TileXYType {
        return this.pos;
    }
    get tileX(): number {
        return this.pos.x;
    }

    get tileY(): number {
        return this.pos.y;
    }
}
