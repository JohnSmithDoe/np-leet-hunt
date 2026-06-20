import * as Phaser from 'phaser';

import { NPScene } from '../scenes/np-scene';
import { NPGameObject } from '../scenes/np-scene-component';

/**
 * A Phaser Sprite wired to our framework: typed to an {@link NPScene} and tagged {@link NPGameObject}
 * so it drops into the scene component lifecycle. Extend this instead of `Phaser.GameObjects.Sprite`
 * so game code doesn't reach into the Phaser namespace for the base class.
 */
export class NPSprite extends Phaser.GameObjects.Sprite implements NPGameObject {
    constructor(
        public override scene: NPScene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture = '',
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame);
    }
}
