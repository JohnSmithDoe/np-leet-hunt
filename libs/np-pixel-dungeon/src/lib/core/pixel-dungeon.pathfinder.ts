import * as Phaser from 'phaser';
import PathFinder from 'phaser4-rex-plugins/plugins/board/pathfinder/PathFinder';
import { TileXYType } from 'phaser4-rex-plugins/plugins/board/types/Position';

import { PixelDungeonEngine } from '../engine/pixel-dungeon.engine';
import { PixelDungeonBoard } from './pixel-dungeon-board';
import Vector2 = Phaser.Math.Vector2;

export class PixelDungeonPathfinder extends PathFinder {
    #board: PixelDungeonBoard;
    #pathGraphics: Phaser.GameObjects.Graphics;
    #debug = false;
    constructor(engine: PixelDungeonEngine, board: PixelDungeonBoard) {
        super(engine.player, {
            pathMode: 'A*-line',
            blockerTest: true,
            occupiedTest: true,
        });
        this.#board = board;
        this.#pathGraphics = this.scene.add.graphics({ lineStyle: { width: 3 } });
    }
    override findPath(endTileXY: TileXYType) {
        const pathToMove = super.findPath(endTileXY);
        if (!this.#debug) return pathToMove;
        // debug
        ((path?: PathFinder.NodeType[]) => {
            if (path && path.length) {
                this.#pathGraphics.clear();
                const p = path
                    .map(tile => this.#board.tileXYToWorldXY(tile.x, tile.y))
                    .map(pv => new Vector2(pv).add({ x: 8, y: 8 }));
                this.#pathGraphics.strokePoints(p);
            }
        })(pathToMove);
        return pathToMove;
    }
}
