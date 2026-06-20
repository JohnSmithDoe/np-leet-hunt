import * as Phaser from 'phaser';

import { NPScene } from '../scenes/np-scene';
import { NPGameObject } from '../scenes/np-scene-component';

/** A Phaser Rectangle wired to our framework. Extend this instead of `Phaser.GameObjects.Rectangle`. */
export class NPRectangle extends Phaser.GameObjects.Rectangle implements NPGameObject {
    constructor(
        public override scene: NPScene,
        x: number,
        y: number,
        width?: number,
        height?: number,
        fillColor?: number,
        fillAlpha?: number
    ) {
        super(scene, x, y, width, height, fillColor, fillAlpha);
    }
}
