import { randomElement } from '@shared/np-library';
import * as Phaser from 'phaser';

import { NPScene } from '../../scenes/np-scene';
import { NPSceneComponent } from '../../scenes/np-scene-component';

// const frameConfig: Phaser.Types.Loader.FileTypes.ImageFrameConfig = {
//     frameWidth: 256 * 2,
//     frameHeight: 256 * 2,
// };
const IMAGES = {
    dashedLineRed: {
        key: 'dashed-line-red',
        url: 'np-phaser/dashed-line/assets/red-dashed-2896x205.png',
        width: 2896,
        height: 205,
    },
};

export class DashedLine extends Phaser.GameObjects.TileSprite implements NPSceneComponent {
    readonly #image: Phaser.Types.Loader.FileTypes.ImageFileConfig;

    static getRandom() {
        const types = Object.keys(IMAGES) as (keyof typeof IMAGES)[];
        return randomElement(types);
    }

    constructor(public scene: NPScene, type: keyof typeof IMAGES, public start: Phaser.Types.Math.Vector2Like, public target: Phaser.Types.Math.Vector2Like) {
        super(scene, 0, 0, 0, 0, '');
        this.#image = IMAGES[type];
        this.setName(type);
    }

    preload(): void {
        this.scene.load.image(this.#image);
    }

    public create(): void {
        const length = Phaser.Math.Distance.BetweenPoints(this.start, this.target);
        const angle = Phaser.Math.Angle.BetweenPoints(this.start, this.target);
        this.setTexture(this.#image.key)
            .setOrigin(0)
            .setRotation(angle)
            .setSize(length, 205)
            .setScale(1, 0.5)
            .setPosition(this.start.x, this.start.y - 205 / 4);

        // const a = this.scene.anims.create({
        //     key: this.#image.key,
        //     frames: this.#image.key,
        //     frameRate: 1,
        //     repeat: -1,
        //     yoyo: true,
        // });
        // console.log(a, 'kdsfjlksadjflksajdflksajdlk');
        // this.scene.add.existing(this);
        this.scene.addToLayer('np', this);
        // this.play(this.#image.key);
        // this.stop();
    }

    public update(...args: number[]): void {
        super.update(...args);
        // console.log(this.anims.currentFrame.index, this.anims.currentFrame);

        // console.log(this.anims.currentAnim.duration, this.frame.sourceIndex);
        this.tilePositionX += 0.5;
    }
}