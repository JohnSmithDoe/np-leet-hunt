import Board from 'phaser3-rex-plugins/plugins/board/board/Board';

import { PixelDungeon } from '../dungeon/pixel-dungeon';
import { PixelDungeonTile } from '../dungeon/pixel-dungeon.tile';
import { PixelDungeonEngine } from '../engine/pixel-dungeon.engine';
import { PixelDungeonMob } from '../sprites/pixel-dungeon.mob';

type NPChessTypes = PixelDungeonMob | PixelDungeonTile;

export class PixelDungeonBoard extends Board<NPChessTypes> {
    #engine: PixelDungeonEngine;

    constructor(engine: PixelDungeonEngine) {
        const tilemap = engine.map.tilemap;
        const config: Board.IConfig = {
            grid: {
                gridType: 'quadGrid',
                type: 'orthogonal', // hmm isometric...
                dir: '8dir',
                cellWidth: tilemap.tileWidth,
                cellHeight: tilemap.tileHeight,
                x: 0,
                y: 0,
            },
            width: tilemap.width,
            height: tilemap.height,
        };
        super(engine.scene, config);
        this.#addDungeon(engine.dungeon);
        this.#engine = engine;
    }

    #addDungeon(dungeon: PixelDungeon) {
        for (const wall of dungeon.walls) {
            console.log(wall.rexChess);
            this.addChess(wall, wall.tileX, wall.tileY, 'wall', false);
            console.log(wall.rexChess);
            wall.rexChess.setBlocker(true);
        }
    }
}
