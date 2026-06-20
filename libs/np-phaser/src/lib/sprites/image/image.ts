import * as Phaser from 'phaser';

import { NPScene } from '../../scenes/np-scene';
import { NPGameObject } from '../../scenes/np-scene-component';

/**
 * A Phaser Image wired to our framework that loads its own asset: pass an image/spritesheet config and
 * it queues the load in `preload()` and sets the texture in `create()`. Use instead of
 * `Phaser.GameObjects.Image` when you want the object to own its asset loading.
 */
export class NPImage extends Phaser.GameObjects.Image implements NPGameObject {
    readonly #image: Phaser.Types.Loader.FileTypes.ImageFileConfig;
    #frameKey?: number;

    constructor(
        public override scene: NPScene,
        x: number,
        y: number,
        image: Phaser.Types.Loader.FileTypes.ImageFileConfig,
        frame?: number
    ) {
        super(scene, x, y, '', frame);
        this.#image = image;
        this.#frameKey = frame;
    }

    preload(): void {
        if (this.#image.frameConfig) {
            this.scene.load.spritesheet(this.#image);
        } else {
            this.scene.load.image(this.#image);
        }
    }

    create(container?: Phaser.GameObjects.Container): void {
        this.setTexture(this.#image.key, this.#frameKey);
        container?.add(this);
    }
}
