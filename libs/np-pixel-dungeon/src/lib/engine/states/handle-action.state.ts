// eslint-disable-next-line max-classes-per-file
import { TileXYType } from 'phaser3-rex-plugins/plugins/board/types/Position';

import { PixelDungeonMob } from '../../sprites/pixel-dungeon.mob';
import { PixelDungeonEngine } from '../pixel-dungeon.engine';
import { PixelDungeonState } from '../pixel-dungeon.state';
import { States } from './states';

export interface PixelDungeonAction {
    mob: PixelDungeonMob;
    costs: number;

    perform(): boolean;

    finish(): void;
}

export class WalkToAction implements PixelDungeonAction {
    costs = 100;

    constructor(public mob: PixelDungeonMob, public tile: TileXYType) {
        console.log(tile);
    }

    finish(): void {
        this.mob.drainEnergy(this.costs);
    }

    perform(): boolean {
        if (this.tile) {
            this.mob.moveToTile(this.tile);
            this.tile = undefined;
        }
        return !this.mob.isMoving();
    }
}

export class RestAction implements PixelDungeonAction {
    costs = 100;

    constructor(public mob: PixelDungeonMob) {}

    finish(): void {
        this.mob.drainEnergy(this.costs);
    }

    perform(): boolean {
        this.mob.gainEnergy(); // extra energy
        console.log('Resting', this.mob.energy);

        return true;
    }
}

export class HandleActionState extends PixelDungeonState {
    name = States.HandleAction;

    #action?: PixelDungeonAction;
    #mob?: PixelDungeonMob;
    #mobs: PixelDungeonMob[];

    enter(engine: PixelDungeonEngine) {
        super.enter(engine);
        this.engine.startTurn();
        this.#mobs = this.engine.mobs.filter(mob => mob.canAct());
        this.#nextMob();
    }

    #nextMob() {
        this.#mob = this.#mobs.shift();
        this.#action = undefined;
    }

    next = () => {
        while (this.#mob) {
            this.#action = this.#mob.getAction();
            if (this.#action) {
                const done = this.#action.perform();
                if (done) {
                    this.#action.finish();
                    console.log('action done');
                    this.#nextMob();
                } else {
                    // action is not done wait a cycle
                    //break;
                    console.log('action should do some more');
                    this.#nextMob();
                }
            } else {
                // no action should be the player waiting for input
                break;
            }
            if (!this.#mob) {
                this.engine.endTurn();
                this.engine.gainEnery();
                this.engine.startTurn();
                this.#mobs = this.engine.mobs.filter(mob => mob.canAct());
                this.#nextMob();
            }
        }
        return States.HandleAction;
    };
}
