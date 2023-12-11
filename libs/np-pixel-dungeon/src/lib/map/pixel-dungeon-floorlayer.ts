import { TileXYType } from 'phaser3-rex-plugins/plugins/board/types/Position';

import { PixelDungeon } from '../dungeon/pixel-dungeon';
import { PixelDungeonRoom } from '../dungeon/pixel-dungeon.room';
import { PixelDungeonTilelayer } from './pixel-dungeon-tilelayer';

export class PixelDungeonFloorLayer extends PixelDungeonTilelayer {
    mapDungeonToLayer(dungeon: PixelDungeon) {
        let start: TileXYType;
        for (const room of dungeon.rooms) {
            this.#mapDungeonRoomToTilemap(room);
            start = room.topRight().tile;
        }
        for (const hallway of dungeon.hallways) {
            for (const tile of hallway) {
                this.putPixeldungeonTileAt(tile, 'FLOOR');
                // this.putTileAt(tile.pos.addDirection(EDirection.S), 'FLOOR');
            }
        }
        for (const junction of dungeon.junctions) {
            this.putTileAt(junction.pos, 'FLOOR');
        }
        return start;
    }

    #mapDungeonRoomToTilemap(room: PixelDungeonRoom) {
        for (const tile of room) {
            // Fill the floor with mostly clean tiles, but occasionally place a dirty tile
            this.putPixeldungeonTileAt(tile, 'ROOM');
        }
        // this.#putPixeldungeonTileAt(room.topLeft(), 'TOP_LEFT_WALL');
        // this.#putPixeldungeonTileAt(room.topRight(), 'TOP_RIGHT_WALL');
    }
}
