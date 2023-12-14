import Board from 'phaser3-rex-plugins/plugins/board/board/Board';
import { TileXYType } from 'phaser3-rex-plugins/plugins/board/types/Position';

import { PixelDungeonTile } from '../dungeon/levels/board/pixel-dungeon.tile';
import { PixelDungeonEngine } from '../engine/pixel-dungeon.engine';
import { PixelDungeonMob } from '../sprites/pixel-dungeon.mob';

type NPChessTypes = PixelDungeonMob | PixelDungeonTile;

export interface TPixelDungeonBoardOptions {
    width: number;
    height: number;
    tileWidth: number;
    tileHeight: number;
}

export class PixelDungeonBoard extends Board<NPChessTypes> {
    constructor(engine: PixelDungeonEngine, options: TPixelDungeonBoardOptions) {
        const config: Board.IConfig = {
            grid: {
                gridType: 'quadGrid',
                type: 'orthogonal', // hmm isometric...
                dir: '8dir',
                cellWidth: options.tileWidth,
                cellHeight: options.tileHeight,
                x: 0,
                y: 0,
            },
            width: options.width,
            height: options.height,
        };
        super(engine.scene, config);
    }

    getTile(tileXY: TileXYType) {
        const res = this.tileXYZToChess(tileXY.x, tileXY.y, 'objects');
        return res instanceof PixelDungeonTile ? res : null;
    }
}
