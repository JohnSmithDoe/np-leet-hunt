// eslint-disable-next-line max-classes-per-file
import { TileXYType } from 'phaser3-rex-plugins/plugins/board/types/Position';

import { EMobInfoType } from '../../sprites/pixel-dungeon.info-text';
import { PixelDungeonMob } from '../../sprites/pixel-dungeon.mob';
import { PixelDungeonPlayer } from '../../sprites/pixel-dungeon.player';
import { PixelDungeonState } from '../pixel-dungeon.state';
import { States } from './states';

export interface PixelDungeonAction {
    mob: PixelDungeonMob;
    costs: number;

    perform(): boolean;

    finish(): void;
}

export abstract class PixelDungeonBaseAction implements PixelDungeonAction {
    costs = 100;

    constructor(public mob: PixelDungeonMob) {}

    finish(): void {
        this.mob.activity.drainEnergy(this.costs);
        this.mob.activity.setNextAction(null);
    }

    abstract perform(): boolean;
}

export class AttackMobAction extends PixelDungeonBaseAction implements PixelDungeonAction {
    #isRunning = false;
    #done = false;

    constructor(mob: PixelDungeonMob, public target: PixelDungeonMob) {
        super(mob);
    }

    perform(): boolean {
        if (!this.#isRunning) {
            this.#isRunning = true;
            const angle = this.mob.engine.board.angleBetween(this.mob, this.target);
            const pos = new Phaser.Math.Vector2(this.mob.x, this.mob.y);
            Phaser.Math.RotateTo(pos, this.mob.x, this.mob.y, angle, 8);
            this.mob.scene.tweens.add({
                targets: this.mob,
                x: pos.x,
                y: pos.y,
                ease: 'Power1',
                duration: 250,
                yoyo: true,
                onComplete: () => {
                    this.#done = true;
                },
                onYoyo: () => {
                    this.target.info('3', EMobInfoType.LoseHealth);
                },
            });
        }
        return this.#done;
    }
}

export class WalkToAction extends PixelDungeonBaseAction implements PixelDungeonAction {
    constructor(mob: PixelDungeonMob, public tile: TileXYType) {
        super(mob);
    }

    perform(): boolean {
        if (this.tile) {
            this.mob.movement.moveToTile(this.tile);
            this.tile = undefined;
        }
        return !this.mob.movement.isMoving;
    }
}

export class WarpAction extends WalkToAction implements PixelDungeonAction {
    perform(): boolean {
        if (this.tile) {
            this.mob.movement.warp(this.tile);
            this.tile = undefined;
        }
        return true;
    }
}

export class RestAction extends PixelDungeonBaseAction implements PixelDungeonAction {
    perform(): boolean {
        // this.mob.gainEnergy(); // extra energy
        return true;
    }
}

export class WaitForInputAction extends PixelDungeonBaseAction implements PixelDungeonAction {
    perform(): boolean {
        return false;
    }
}

// 1. No one has energy
//    - Gain energy on each update? or on each turn
//        - on each update -> there is nearly always something to do -> more time slots
//        - on each turn -> there is waiting time but fixed time slots
//        - on one update cycle -> wait here until an action is ready -> Always have an action should be faster
//           - only update if something needs animation... is coupled on the fps.. is it?
// 2. Some have enough energy to perform an action
//    - Actions should take one turn for now
//    - So finish all action before advancing
// 3. When all actions are done a turn has ended
// 4. Start over
export class HandleActionState extends PixelDungeonState {
    name = States.HandleAction;
    #mobs: PixelDungeonMob[];
    #actions: PixelDungeonAction[] = [];
    #waitForInputAction: WaitForInputAction;

    constructor(player: PixelDungeonPlayer) {
        super();
        this.#waitForInputAction = new WaitForInputAction(player);
    }

    next = () => {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            // gain energy until one or more mobs can act
            while (!this.#mobs?.length) {
                this.engine.gainEnergy();
                this.#mobs = this.engine.mobs.filter(mob => {
                    const canAct = mob.activity.canAct();
                    if (canAct && mob === this.engine.player) {
                        // start a new turn if the player is on
                        this.engine.startTurn();
                    }
                    return canAct;
                });
            }
            // get the action of the first one and if animated wait for it to end
            while (this.#mobs.length) {
                const mob = this.#mobs.shift();

                const action = mob.action ?? this.#waitForInputAction;
                const done = action.perform();
                if (done) {
                    // done -> finish action and continue with the next mob instantly
                    action.finish();
                } else {
                    // not done -> enqueue first and wait an update cylce
                    this.#mobs.unshift(mob);
                    return States.HandleAction;
                }
            }
        }
    };
}
