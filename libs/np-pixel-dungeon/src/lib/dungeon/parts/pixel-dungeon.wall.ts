import { EDirection } from '@shared/np-library';

import { PixelDungeonBoard } from '../../core/pixel-dungeon-board';
import { PixelDungeonMap } from '../../map/pixel-dungeon.map';
import { NPTilesetMappingNew } from '../../map/pixel-dungeon-tileset';
import { PixelDungeonTile } from './pixel-dungeon.tile';

export class PixelDungeonWall extends PixelDungeonTile {
    addToLevel(map: PixelDungeonMap, board: PixelDungeonBoard): void {
        board.addChess(this, this.x, this.y, 'walls', false);
        this.rexChess.setBlocker(true);

        map.walllayer.putTileAt(this, this.#toTileIndex());
        if (this.#needStitching()) {
            map.stitchlayer.putTileAt(this.pos.addDirection(EDirection.N), this.#toStichTileIndex());
        }
    }

    #toTileIndex(): keyof NPTilesetMappingNew {
        const wallToN = this.wallTo(EDirection.N);
        const wallToSE = this.wallTo(EDirection.SE);
        const wallToS = this.wallTo(EDirection.S);
        const wallToSW = this.wallTo(EDirection.SW);
        const emptyToS = this.emptyTo(EDirection.S);
        const roomToS = this.floorTo(EDirection.S);
        const junctionToS = this.junctionTo(EDirection.S);

        if (junctionToS) {
            return 'WALL_TOP_JUNCTION';
        }
        if (roomToS) {
            return 'WALL_TOP';
        } else if (emptyToS) {
            return 'WALL_TOP_OUTER';
        }

        if (wallToSE && wallToSW) {
            return 'WALL_VERT_T';
        }
        if (wallToSE) {
            return 'WALL_LEFT_BOTTOM';
        }
        if (wallToSW) {
            return 'WALL_RIGHT_BOTTOM';
        }

        if (wallToN || wallToS) return 'WALL_VERT';
    }

    #needStitching() {
        const wallToN = this.wallTo(EDirection.N);
        return !wallToN;
    }

    #toStichTileIndex(): keyof NPTilesetMappingNew {
        const wallToE = this.wallTo(EDirection.E);
        const wallToS = this.wallTo(EDirection.S);
        const wallToW = this.wallTo(EDirection.W);
        if (wallToE && wallToW && wallToS) {
            return 'WALL_TOP_STITCH';
        }

        if (!wallToE && !wallToW) {
            return 'WALL_TOP_DEADEND_STITCH';
        }
        if (!wallToE && wallToW) {
            return 'WALL_TOP_RIGHT_STITCH';
        }
        if (wallToE && !wallToW) {
            return 'WALL_TOP_LEFT_STITCH';
        }
        if (wallToS && wallToE) {
            return 'WALL_TOP_LEFT_STITCH';
        }
        if (wallToS && wallToW) {
            return 'WALL_TOP_RIGHT_STITCH';
        }
        return 'WALL_TOP_STITCH';
    }
}
