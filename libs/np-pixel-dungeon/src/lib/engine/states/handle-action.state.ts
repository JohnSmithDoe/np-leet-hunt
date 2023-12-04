// eslint-disable-next-line max-classes-per-file
import { TileXYType } from 'phaser3-rex-plugins/plugins/board/types/Position';

import { EMobInfoType } from '../../sprites/pixel-dungeon.info-text';
import { PixelDungeonMob } from '../../sprites/pixel-dungeon.mob';
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
        this.mob.drainEnergy(this.costs);
        this.mob.setNextAction(null);
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
                    this.target.showInfo('3', EMobInfoType.LoseHealth);
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
            this.mob.moveToTile(this.tile);
            this.tile = undefined;
        }
        return !this.mob.isMoving();
    }
}

export class WarpAction extends WalkToAction implements PixelDungeonAction {
    perform(): boolean {
        if (this.tile) {
            this.mob.warp(this.tile);
            console.log('Warping', this);
            this.tile = undefined;
        }
        return true;
    }
}

export class RestAction extends PixelDungeonBaseAction implements PixelDungeonAction {
    perform(): boolean {
        // this.mob.gainEnergy(); // extra energy
        console.log('Resting', this.mob.energy);
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

    next = () => {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (this.#actions.length) {
                // perform each action once -> keep pending actions until they are done
                // some actions take longer some are faster
                // waiting for the longest action to finish creates sync point
                // hmm i think this could make some serious trouble when attack and move are executed at the same time
                while (this.#actions.length) {
                    let action = this.#actions.shift();
                    if (action instanceof WaitForInputAction) {
                        action = action.mob.getAction() ?? action;
                    }
                    const done = action.perform();
                    if (done) {
                        action.finish();
                    } else {
                        this.#actions.unshift(action);
                        // pending.push(action);
                        break;
                    }
                }
                if (this.#actions.length) {
                    return States.HandleAction; // handle actions before move on
                }
                // if (pending.length) {
                //     this.#actions = pending;
                //     return States.HandleAction; // handle actions before move on
                // }
            }

            // gain energy until one can act
            while (!this.#mobs?.length) {
                this.engine.gainEnergy();
                this.#mobs = this.engine.mobs.filter(mob => mob.canAct());
            }

            // start a new turn ... hmm
            this.engine.startTurn();
            // get the actions of all actors that can act
            while (this.#mobs.length) {
                const mob = this.#mobs.shift();
                const action = mob.getAction();
                if (action) {
                    this.#actions.push(action);
                } else {
                    // no action should be the waiting for input
                    this.#actions.push(new WaitForInputAction(mob));
                }
            }
            this.engine.endTurn();
        }
        // return States.HandleAction;
    };
}
