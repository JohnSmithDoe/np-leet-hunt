import * as Phaser from 'phaser';

import { NPScene } from '../scenes/np-scene';
import { NPGameObject } from '../scenes/np-scene-component';

/** A Phaser Text wired to our framework. Extend this instead of `Phaser.GameObjects.Text`. */
export class NPText extends Phaser.GameObjects.Text implements NPGameObject {
    constructor(
        public override scene: NPScene,
        x: number,
        y: number,
        text: string | string[],
        style?: Phaser.Types.GameObjects.Text.TextStyle
    ) {
        super(scene, x, y, text, style ?? {});
    }
}
