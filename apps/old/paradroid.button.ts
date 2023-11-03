import { TParadroidPlayer } from '../../libs/np-phaser/src/lib/paradroid/paradroid.types';
import { ParadroidEngine } from './paradroid.engine';

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
