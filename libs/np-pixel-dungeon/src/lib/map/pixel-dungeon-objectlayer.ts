import { EDirection } from '../../../../np-phaser/src/lib/utilities/piecemeal';
import { PixelDungeon } from '../dungeon/pixel-dungeon';
import { PixelDungeonTilelayer } from './pixel-dungeon-tilelayer';

export class PixelDungeonObjectlayer extends PixelDungeonTilelayer {
    mapDungeonToLayer(dungeon: PixelDungeon) {
        for (const junction of dungeon.junctions) {
            this.putTileAt(junction.pos, junction.toTileIndex());
            if (junction.needsStitching()) {
                this.putTileAt(junction.pos.addDirection(EDirection.N), junction.toStitchingTileIndex());
            }
        }
    }
}
