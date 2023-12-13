import { EDirection } from '@shared/np-library';

import { TDungeonTile } from '../@types/pixel-dungeon.types';
import { NPTilesetMappingNew } from '../map/pixel-dungeon-tileset';
import { PixelDungeon } from './pixel-dungeon';
import { PixelDungeonTile } from './pixel-dungeon.tile';

export class PixelDungeonWall extends PixelDungeonTile {
    regions: number[];

    constructor(dungeon: PixelDungeon, tile: TDungeonTile) {
        super(dungeon, tile);
    }

    toTileIndex(): keyof NPTilesetMappingNew {
        const wallToN = this.wallTo(EDirection.N);
        const wallToSE = this.wallTo(EDirection.SE);
        const wallToS = this.wallTo(EDirection.S);
        const wallToSW = this.wallTo(EDirection.SW);
        const emptyToS = this.emptyTo(EDirection.S);
        const roomToS = this.roomTo(EDirection.S);
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

    public needStitching() {
        const wallToN = this.wallTo(EDirection.N);
        return !wallToN;
    }

    public toStichTileIndex(): keyof NPTilesetMappingNew {
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
