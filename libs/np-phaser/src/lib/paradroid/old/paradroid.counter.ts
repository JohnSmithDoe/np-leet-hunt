import { EParadroidOwner } from '../paradroid.consts';
import { ParadroidMiddle } from './paradroid.middle';

export class ParadroidCounter {
    private count: number = 0;
    private owner: EParadroidOwner;

    constructor(private middle: ParadroidMiddle[]) {}

    private calculateValue(): number {
        let result: number = 0;
        this.middle.forEach((middle: ParadroidMiddle): void => {
            result += middle.getValue();
        });
        return result;
    }

    updateCounter(): void {
        this.count = this.calculateValue();
        const owner: EParadroidOwner =
            this.count > 0 ? EParadroidOwner.Player : this.count < 0 ? EParadroidOwner.Droid : EParadroidOwner.Nobody;
        this.setOwner(owner);
    }

    private setOwner(owner: EParadroidOwner) {
        this.owner = owner;
    }
}
