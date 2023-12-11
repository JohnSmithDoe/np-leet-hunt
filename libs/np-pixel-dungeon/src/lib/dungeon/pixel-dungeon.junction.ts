import { EDirection } from '@shared/np-library';

import { TDungeonTile } from '../@types/pixel-dungeon.types';
import { NPTilesetMappingNew } from '../map/pixel-dungeon.map';
import { PixelDungeon } from './pixel-dungeon';
import { PixelDungeonTile } from './pixel-dungeon.tile';

export class PixelDungeonJunction extends PixelDungeonTile {
    regions: number[];

    constructor(dungeon: PixelDungeon, tile: TDungeonTile) {
        super(dungeon, tile);
        this.vertical = this.wallTo(EDirection.N) && this.wallTo(EDirection.S);
    }

    toTileIndex(): keyof NPTilesetMappingNew {
        if (this.vertical) {
            return 'DOOR';
        } else {
            return 'DOOR';
        }
    }
}
