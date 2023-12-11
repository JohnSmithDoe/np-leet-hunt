import { EDirection } from '@shared/np-library';

import { PixelDungeon } from '../dungeon/pixel-dungeon';
import { PixelDungeonTilelayer } from './pixel-dungeon-tilelayer';

export class PixelDungeonWallLayer extends PixelDungeonTilelayer {
    mapDungeonToLayer(dungeon: PixelDungeon) {
        for (const wall of dungeon.walls) {
            this.putPixeldungeonTileAt(wall, wall.toTileIndex());
            if (wall.needStitching()) {
                this.putTileAt(wall.pos.addDirection(EDirection.N), wall.toStichTileIndex());
            }
        }
    }
}
