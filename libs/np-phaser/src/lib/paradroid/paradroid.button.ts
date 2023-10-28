import { ParadroidEngine } from './paradroid.engine';
import { TParadroidPlayer } from './paradroid.types';

export class ParadroidButton {
    constructor(
        public pos: Phaser.Types.Math.Vector2Like,
        public engine: ParadroidEngine,
        public row: number,
        public owner: TParadroidPlayer
    ) {}
    private onClicked(): void {
        this.engine.activateRow(this.row, this.owner);
    }
}
