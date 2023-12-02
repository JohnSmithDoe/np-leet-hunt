import { EDirection } from '@shared/np-library';

import { EWallType, TDungeonTile } from '../@types/pixel-dungeon.types';
import { NPTilesetMapping } from '../sprites/pixel-dungeon.map';
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

        if (wallToN && wallToE && wallToS && wallToW) {
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
