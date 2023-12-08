import { PixelDungeon } from '../dungeon/pixel-dungeon';
import { PixelDungeonTilelayer } from './pixel-dungeon-tilelayer';

export class PixelDungeonWallLayer extends PixelDungeonTilelayer {
    mapDungeonToLayer(dungeon: PixelDungeon) {
        for (const wall of dungeon.walls) {
            this.putTileAt(wall.pos, wall.toTileIndex());
        }
    }
}
