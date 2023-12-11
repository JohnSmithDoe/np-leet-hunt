import { mapRexPluginDirection } from '@shared/np-library';
import MoveToTask from 'phaser3-rex-plugins/plugins/behaviors/moveto/MoveTo';
import MoveTo from 'phaser3-rex-plugins/plugins/board/moveto/MoveTo';
import { TileXYType } from 'phaser3-rex-plugins/plugins/board/types/Position';

import { WalkToAction } from '../engine/states/handle-action.state';
import { EMobInfoType } from '../sprites/pixel-dungeon.info-text';
import { PixelDungeonMob } from '../sprites/pixel-dungeon.mob';

export class MobMovement extends MoveTo<PixelDungeonMob> {
    moveToTask: MoveToTask & {
        targetX: number;
        targetY: number;
    };

    #pathToMove?: TileXYType[];

    constructor(private mob: PixelDungeonMob) {
        super(mob, {
            speed: mob.options.moveSpeed,
            rotateToTarget: mob.options.moveRotate,
            blockerTest: true,
            occupiedTest: true,
            sneak: false,
            // moveableTestScope: undefined,
            // moveableTest: (from, to) => !!this.costs(to),
        });
    }
    // costs(tileXY: PathFinder.NodeType | TileXYType): number | PathFinder.BLOCKER | PathFinder.INFINITY {
    //     const tile = this.map.tileMap.getTileAt(tileXY.x, tileXY.y, true);
    //     const occupied = !this.#board.isEmptyTileXYZ(tileXY.x, tileXY.y, 1);
    //     return this.#openTileIdx.includes(tile.index) && !occupied ? 1 : null;
    // }
    onceMoved(fn: () => void) {
        this.once('complete', () => fn());
        return this;
    }

    onceMovedOccupied(fn: () => void) {
        this.once('occupy', () => fn());
        return this;
    }
    update(time, delta) {
        // Do the move first and then check if completed
        // Parent checks complete and then moves
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        super.update(time, delta);
        if (!this.isRunning || !this.enable) {
            return this;
        }
        const curX = this.mob.x;
        const curY = this.mob.y;
        const targetX = this.moveToTask.targetX;
        const targetY = this.moveToTask.targetY;
        if (curX === targetX && curY === targetY) {
            this.moveToTask.complete(); // complete early
            return this;
        }
    }
    get isMoving() {
        return this.moveToTask.isRunning;
    }

    setPath(path: TileXYType[]) {
        this.#pathToMove = path;
    }

    hasMoves() {
        return !!this.#pathToMove?.length;
    }

    nextMove() {
        return this.#pathToMove.shift();
    }
    canMoveToTile(tile: TileXYType) {
        return this.canMoveTo(tile.x, tile.y);
    }

    warp(tile: TileXYType) {
        if (this.canMoveToTile(tile)) {
            this.mob.engine.board.moveChess(this.mob, tile.x, tile.y, 1);
            this.mob.info(`!`, EMobInfoType.GainHealth);
        }
    }
    moveOnPath(path: TileXYType[]) {
        console.log('269:moveOnPath');
        this.setPath(path);
        if (this.hasMoves()) {
            const pathTile = this.nextMove();
            console.log('new action walk');
            this.mob.activity.setNextAction(new WalkToAction(this.mob, pathTile));
        }
    }

    moveToTile(tile: TileXYType) {
        this.moveTo(tile);
        console.log('move to tile');
        this.mob.animateFaceToDirection(mapRexPluginDirection(this.destinationDirection));
        this.mob.animateWalk(mapRexPluginDirection(this.destinationDirection));
        this.mob.engine.updateFoV();
    }
}
