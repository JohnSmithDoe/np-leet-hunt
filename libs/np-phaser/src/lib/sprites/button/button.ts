import { randomElement } from '@shared/np-library';
import * as Phaser from 'phaser';

import { NPScene } from '../../scenes/np-scene';
import { NPSceneComponent } from '../../scenes/np-scene-component';

// const frameConfig: Phaser.Types.Loader.FileTypes.ImageFrameConfig = {
//     frameWidth: 256 * 2,
//     frameHeight: 256 * 2,
// };
const IMAGES = {
    defaultBtn: {
        key: 'dashed-line-red',
        url: 'np-phaser/dashed-line/assets/red-dashed-2896x205.png',
        width: 2896,
        height: 205,
    },
};

export class Button extends Phaser.GameObjects.Sprite implements NPSceneComponent {
    readonly #image: Phaser.Types.Loader.FileTypes.ImageFileConfig;

    static getRandom() {
        const types = Object.keys(IMAGES) as (keyof typeof IMAGES)[];
        return randomElement(types);
    }

    constructor(public scene: NPScene, type: keyof typeof IMAGES, public start: Phaser.Types.Math.Vector2Like, public target: Phaser.Types.Math.Vector2Like) {
        super(scene, 0, 0, '');
        this.#image = IMAGES[type];
        this.setName(type);
    }

    preload(): void {
        this.scene.load.image(this.#image);
    }

    public create(): void {
        this.setTexture(this.#image.key);
        this.scene.addToLayer('np', this);
    }

    public update(...args: number[]): void {
        super.update(...args);
    }
}
