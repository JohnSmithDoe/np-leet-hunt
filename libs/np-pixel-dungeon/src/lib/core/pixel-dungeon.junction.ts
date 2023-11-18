import { EDirection } from '@shared/np-library';

import { TDungeonTile } from '../@types/pixel-dungeon.types';
import { NPTilesetMapping } from '../sprites/pixel-dungeon.map';
import { PixelDungeon } from './pixel-dungeon';
import { PixelDungeonTile } from './pixel-dungeon.tile';

export class PixelDungeonJunction extends PixelDungeonTile {
    regions: number[];

    constructor(dungeon: PixelDungeon, tile: TDungeonTile) {
        super(dungeon, tile);
        this.vertical = this.wallTo(EDirection.E) && this.wallTo(EDirection.W);
    }

    toTileIndex(): keyof NPTilesetMapping {
        if (this.vertical) {
            return 'LEFT_DOOR';
        } else {
            return 'BOTTOM_DOOR';
        }
    }
}
