import { EDirection } from '@shared/np-library';

import { EWallType, TDungeonTile } from '../@types/pixel-dungeon.types';
import { NPTilesetMapping } from '../map/pixel-dungeon.map';
import { PixelDungeon } from './pixel-dungeon';
import { PixelDungeonTile } from './pixel-dungeon.tile';

export class PixelDungeonWall extends PixelDungeonTile {
    regions: number[];
    #wallType: EWallType;

    constructor(dungeon: PixelDungeon, tile: TDungeonTile) {
        super(dungeon, tile);

        this.#wallType = this.#initWallType();
    }

    #initWallType() {
        const wallToN = this.wallTo(EDirection.N);
        const wallToE = this.wallTo(EDirection.E);
        const wallToS = this.wallTo(EDirection.S);
        const wallToW = this.wallTo(EDirection.W);
        const emptyToN = this.emptyTo(EDirection.N);
        const emptyToE = this.emptyTo(EDirection.E);
        const emptyToS = this.emptyTo(EDirection.S);
        const emptyToW = this.emptyTo(EDirection.W);
        const roomToN = this.roomTo(EDirection.N);
        const roomToE = this.roomTo(EDirection.E);
        // const roomToS = this.roomTo(EDirection.S);
        const roomToW = this.roomTo(EDirection.W);

        if (emptyToW && emptyToS) {
            return EWallType.CORNER_BOTTOM_LEFT;
        } else if (emptyToE && emptyToS) {
            return EWallType.CORNER_BOTTOM_RIGHT;
        } else if (emptyToN && emptyToE) {
            return EWallType.CORNER_TOP_RIGHT_;
        } else if (emptyToN && emptyToW) {
            return EWallType.CORNER_TOP_LEFT;
        } else if (roomToN && roomToE) {
            return EWallType.CORNER_BOTTOM_RIGHT_OUTSIDE;
        } else if (roomToN && roomToW) {
            return EWallType.CORNER_BOTTOM_LEFT_OUTSIDE;
        } else if (emptyToN) {
            return EWallType.TOP;
        } else if (emptyToW) {
            return EWallType.RIGHT;
        } else if (emptyToS) {
            return EWallType.BOTTOM;
        } else if (emptyToE) {
            return EWallType.LEFT;
            // } else if (emptyToW && roomToE && wallToN && wallToS) {
            //     return EWallType.RIGHT;
            // } else if (emptyToE && roomToW && wallToN && wallToS) {
            //     return EWallType.LEFT;
        } else if (wallToN && wallToE && wallToS && wallToW) {
            return EWallType.CROSS;
        } else if (wallToN && wallToE && wallToS && !wallToW) {
            return EWallType.TSHAPE_LEFT;
        } else if (wallToN && !wallToE && wallToS && wallToW) {
            return EWallType.TSHAPE_RIGHT;
        } else if (!wallToN && wallToE && wallToS && wallToW) {
            return EWallType.TSHAPE_UP;
        } else if (wallToN && wallToE && !wallToS && wallToW) {
            return EWallType.TSHAPE_DOWN;
        } else if (wallToN && !wallToE && wallToS && !wallToW) {
            return EWallType.STRAIGHT_VERT;
        } else if (!wallToN && wallToE && !wallToS && wallToW) {
            return EWallType.STRAIGHT_HORIZ;
        } else if (wallToN && wallToE && !wallToS && !wallToW) {
            return EWallType.CORNER_BOTTOM_LEFT;
        } else if (!wallToN && !wallToE && wallToS && wallToW) {
            return EWallType.CORNER_TOP_RIGHT_;
        } else if (wallToN && !wallToE && !wallToS && wallToW) {
            return EWallType.CORNER_BOTTOM_RIGHT;
        } else if (!wallToN && wallToE && wallToS && !wallToW) {
            return EWallType.CORNER_TOP_LEFT;
        } else if (!wallToN && !wallToE && !wallToS && wallToW) {
            return EWallType.DEADEND_RIGHT;
        } else if (!wallToN && !wallToE && wallToS && !wallToW) {
            return EWallType.DEADEND_UP;
        } else if (!wallToN && wallToE && !wallToS && !wallToW) {
            return EWallType.DEADEND_LEFT;
        } else if (wallToN && !wallToE && !wallToS && !wallToW) {
            return EWallType.DEADEND_DOWN;
        }
        console.log(this);
        throw new Error('wrong tile');
    }

    toTileIndex(): keyof NPTilesetMapping {
        switch (this.#wallType) {
            case EWallType.CORNER_BOTTOM_LEFT_OUTSIDE:
                return 'CORNER_BOTTOM_LEFT_OUTSIDE';
            case EWallType.CORNER_BOTTOM_RIGHT_OUTSIDE:
                return 'CORNER_BOTTOM_RIGHT_OUTSIDE';
            case EWallType.LEFT:
                return 'LEFT_WALL';
            case EWallType.TOP:
                return 'TOP_WALL';
            case EWallType.BOTTOM:
                return 'BOTTOM_WALL';
            case EWallType.RIGHT:
                return 'RIGHT_WALL';
            case EWallType.CORNER_TOP_RIGHT_:
                return 'TOP_RIGHT_WALL';
            case EWallType.CORNER_TOP_LEFT:
                return 'TOP_LEFT_WALL';
            case EWallType.CORNER_BOTTOM_RIGHT:
                return 'BOTTOM_RIGHT_WALL';
            case EWallType.CORNER_BOTTOM_LEFT:
                return 'BOTTOM_LEFT_WALL';
            case EWallType.STRAIGHT_VERT:
                return 'STRAIGHT_WALL_VERT';
            case EWallType.STRAIGHT_HORIZ:
                return 'STRAIGHT_WALL_HORIZ';
            case EWallType.TSHAPE_DOWN:
                return 'BOTTOM_T_WALL';
            case EWallType.TSHAPE_UP:
                return 'TOP_T_WALL';
            case EWallType.TSHAPE_RIGHT:
                return 'RIGHT_T_WALL';
            case EWallType.CROSS:
                return 'CROSS_WALL';
            case EWallType.TSHAPE_LEFT:
                return 'LEFT_T_WALL';
            case EWallType.DEADEND_DOWN:
                return 'BOTTOM_DEADEND_WALL';
            case EWallType.DEADEND_UP:
                return 'TOP_DEADEND_WALL';
            case EWallType.DEADEND_LEFT:
                return 'LEFT_DEADEND_WALL';
            case EWallType.DEADEND_RIGHT:
                return 'RIGHT_DEADEND_WALL';
        }
    }
}
