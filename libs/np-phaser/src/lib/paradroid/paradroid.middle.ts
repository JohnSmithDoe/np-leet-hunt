import { EParadroidOwner } from './paradroid.types';

export class ParadroidMiddle {
    private owner: EParadroidOwner = EParadroidOwner.Nobody;
    private lastUpdate: number = -1;
    private frameCount: number = 0;

    constructor(public pos: Phaser.Types.Math.Vector2Like) {}

    updateMiddle(owner: EParadroidOwner): void {
        if (this.lastUpdate === this.frameCount) {
            if (owner !== this.owner) {
                owner = EParadroidOwner.Nobody;
            }
        }
        this.lastUpdate = this.frameCount;
        this.setOwner(owner);
    }

    protected setOwner(owner: EParadroidOwner): void {
        this.owner = owner;
        this.goToFrame(this.owner);
    }

    private getPlayerValue(): number {
        return this.ownerIsPlayer() ? 1 : 0;
    }

    private getDroidValue(): number {
        return this.ownerIsDroid() ? 1 : 0;
    }

    getValue(): number {
        return this.getPlayerValue() - this.getDroidValue();
    }

    ownerIsPlayer(): boolean {
        return this.owner === EParadroidOwner.Player;
    }
    ownerIsDroid(): boolean {
        return this.owner === EParadroidOwner.Droid;
    }

    private goToFrame(owner: EParadroidOwner) {
        //nop
        console.log(owner);
    }
}
