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

    constructor(public mob: PixelDungeonMob, public tile: TileXYType) {}

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
        this.#mobs = this.engine.mobs.filter(mob => mob.canAct());
        this.#nextMob();
    }

    #nextMob() {
        this.#mob = this.#mobs.shift();
        this.#action = undefined;
    }

    next = () => {
        if (!this.#mob) {
            console.log('end turn');
            return States.EndTurn;
        }
        // console.log('handle action');
        this.#handleAction();
        return States.HandleAction;
    };

    #handleAction() {
        this.#action ??= this.#mob.getAction();
        if (this.#action) {
            console.log('handle');

            const success = this.#action.perform();
            if (success) {
                this.#action.finish();
                this.#nextMob();
            }
        }
    }
}
