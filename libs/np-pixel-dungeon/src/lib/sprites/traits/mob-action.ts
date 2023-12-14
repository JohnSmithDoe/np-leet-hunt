import { PixelDungeonAction } from '../../engine/states/handle-action.state';
import { PixelDungeonMob } from '../pixel-dungeon.mob';

const FULL_ENERGY = 100;

export class MobAction {
    #energy = 0;
    #nextAction: PixelDungeonAction | null;

    constructor(private mob: PixelDungeonMob) {}
    gainEnergy() {
        //console.log(`${this.key} gain energy: ${this.options.energyGain}/${this.#energy}`);
        return (this.#energy += this.mob.options.energyGain) >= FULL_ENERGY;
    }

    canAct() {
        return this.#energy >= FULL_ENERGY;
    }
    isIdle() {
        return !this.#nextAction && this.canAct();
    }

    setNextAction(action: PixelDungeonAction) {
        this.#nextAction = action;
    }

    getAction(): PixelDungeonAction | null {
        return this.#nextAction;
    }

    drainEnergy(amount: number) {
        this.#energy -= amount;
    }

    get hasNextAction() {
        return !!this.#nextAction;
    }
}
