// eslint-disable-next-line import/no-cycle
import { ParadroidEngine } from './paradroid.engine';
import { EParadroidPlayer } from './paradroid.types';

export class ParadroidButton {
    constructor(
        public pos: Phaser.Types.Math.Vector2Like,
        public engine: ParadroidEngine,
        public row: number,
        public owner: EParadroidPlayer
    ) {}
    private onClicked(): void {
        this.engine.activateRow(this.row, this.owner);
    }
}
