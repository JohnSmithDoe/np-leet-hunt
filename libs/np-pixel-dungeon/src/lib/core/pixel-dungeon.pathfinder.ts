import PathFinder from 'phaser3-rex-plugins/plugins/board/pathfinder/PathFinder';
import { TileXYType } from 'phaser3-rex-plugins/plugins/board/types/Position';

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
    findPath(endTileXY: TileXYType) {
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

    // costs(tileXY: PathFinder.NodeType | TileXYType): number | PathFinder.BLOCKER | PathFinder.INFINITY {
    //     // const tile = this.map.tileMap.getTileAt(tileXY.x, tileXY.y, true);
    //     // const occupied = !this.#board.isEmptyTileXYZ(tileXY.x, tileXY.y, 1);
    //     // return this.#openTileIdx.includes(tile.index) && !occupied ? 1 : null;
    //     return this.BLOCKER;
    // }
    //
    // preTestCallback(a: TileXYType[], fovRange: number) {
    //     const first = a[0];
    //     const target = a[a.length - 1];
    //     const distance = Phaser.Math.Distance.Snake(first.x, first.y, target.x, target.y);
    //     let lastWasOccupied = false;
    //     if (a.length > 2) {
    //         const preLast = a[a.length - 2];
    //         lastWasOccupied = !this.#board.isEmptyTileXYZ(preLast.x, preLast.y, 1);
    //     }
    //     return !lastWasOccupied && distance <= fovRange;
    // }
}
