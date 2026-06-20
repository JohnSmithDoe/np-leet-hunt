import * as Phaser from 'phaser';

import { NPScene } from '../scenes/np-scene';
import { NPGameObject } from '../scenes/np-scene-component';

/** A Phaser TileSprite wired to our framework. Extend this instead of `Phaser.GameObjects.TileSprite`. */
export class NPTileSprite extends Phaser.GameObjects.TileSprite implements NPGameObject {
    constructor(
        public override scene: NPScene,
        x: number,
        y: number,
        width: number,
        height: number,
        texture: string,
        frame?: string | number
    ) {
        super(scene, x, y, width, height, texture, frame);
    }
}
