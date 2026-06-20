import { mapRexPluginDirection } from '@shared/np-library';
import MoveToTask from 'phaser4-rex-plugins/plugins/behaviors/moveto/MoveTo';
import MoveTo from 'phaser4-rex-plugins/plugins/board/moveto/MoveTo';
import { TileXYType } from 'phaser4-rex-plugins/plugins/board/types/Position';

import { WalkToAction } from '../../engine/states/handle-action.state';
import { PixelDungeonMob } from '../pixel-dungeon.mob';

export class MobMovement extends MoveTo<PixelDungeonMob> {
    moveToTask!: MoveToTask & {
        targetX: number;
        targetY: number;
    };

    #pathToMove?: TileXYType[];

    constructor(private mob: PixelDungeonMob) {
        super(mob, {
            speed: mob.options.moveSpeed,
            rotateToTarget: mob.options.moveRotate,
            blockerTest: true,
            occupiedTest: false,
            sneak: false,
        });
    }
    onceMoved(fn: () => void) {
        this.once('complete', () => fn());
        return this;
    }

    onceMovedOccupied(fn: () => void) {
        this.once('occupy', () => fn());
        return this;
    }
    update(time: number, delta: number) {
        // Do the move first and then check if completed
        // Parent checks complete and then moves.
        // rex's MoveTo.update is untyped here (variadic base signature), so both the TS error and the
        // resulting unsafe-call lint are suppressed at this one third-party boundary.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
        return this;
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
        return this.#pathToMove?.shift();
    }
    canMoveToTile(tile: TileXYType) {
        return this.canMoveTo(tile.x, tile.y);
    }

    warp(tile: TileXYType) {
        if (this.canMoveToTile(tile)) {
            this.mob.engine.level.moveMob(this.mob, tile);
        }
    }
    moveOnPath(path: TileXYType[]) {
        this.setPath(path);
        if (this.hasMoves()) {
            const pathTile = this.nextMove();
            this.mob.activity.setNextAction(new WalkToAction(this.mob, pathTile));
        }
    }

    moveToTile(tile: TileXYType) {
        this.moveTo(tile);
        this.mob.animateFaceToDirection(mapRexPluginDirection(this.destinationDirection));
        this.mob.animateWalk(mapRexPluginDirection(this.destinationDirection));
        this.mob.engine.onMobMoved(this.mob);
    }
}
