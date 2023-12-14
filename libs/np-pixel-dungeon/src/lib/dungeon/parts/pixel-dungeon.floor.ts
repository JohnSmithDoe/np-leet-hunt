import { TDungeonTile } from '../../@types/pixel-dungeon.types';
import { PixelDungeonMap } from '../../map/pixel-dungeon.map';
import { PixelDungeon } from '../pixel-dungeon';
import { PixelDungeonTile } from './pixel-dungeon.tile';

export class PixelDungeonFloor extends PixelDungeonTile {
    constructor(tile: TDungeonTile, dungeon: PixelDungeon, private isRoomFloor: boolean) {
        super(tile, dungeon);
    }

    public addToLevel(map: PixelDungeonMap) {
        if (this.isRoomFloor) {
            map.floorlayer.putPixeldungeonTileAt(this, 'ROOM');
        } else {
            map.floorlayer.putPixeldungeonTileAt(this, 'FLOOR');
        }
    }
}
