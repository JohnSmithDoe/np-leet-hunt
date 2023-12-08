import { EDirection } from '@shared/np-library';

import { PixelDungeon } from '../dungeon/pixel-dungeon';
import { PixelDungeonTilelayer } from './pixel-dungeon-tilelayer';

export class PixelDungeonObjectlayer extends PixelDungeonTilelayer {
    mapDungeonToLayer(dungeon: PixelDungeon) {
        for (const junction of dungeon.junctions) {
            if (junction.vertical) {
                this.putTileAt(junction.pos.addDirection(EDirection.N), junction.toTileIndex());
            }
        }
    }
}
