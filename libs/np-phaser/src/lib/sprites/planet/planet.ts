import * as Phaser from 'phaser';

import { NPScene } from '../../scenes/np-scene';
import { NPSceneComponent } from '../../scenes/np-scene-component';

const frameConfig: Phaser.Types.Loader.FileTypes.ImageFrameConfig = {
    frameWidth: 256 * 2,
    frameHeight: 256 * 2,
};
export const IMAGES = {
    planet1: { key: 'planet-1', url: 'np-phaser/planet/assets/planet01.png' },
    planet2: { key: 'planet-2', url: 'np-phaser/planet/assets/planet02.png' },
    planet3: { key: 'planet-3', url: 'np-phaser/planet/assets/planet03.png' },
    planet4: { key: 'planet-4', url: 'np-phaser/planet/assets/planet04.png' },
    planet5: { key: 'planet-5', url: 'np-phaser/planet/assets/planet05.png' },
    planet6: { key: 'planet-6', url: 'np-phaser/planet/assets/planet06.png' },
    planet7: { key: 'planet-7', url: 'np-phaser/planet/assets/planet07.png' },
    planet8: { key: 'planet-8', url: 'np-phaser/planet/assets/planet08.png' },
    planetBlue: { key: 'planet-blue', url: 'np-phaser/planet/assets/blue-planet.png' },
    planetBrown: { key: 'planet-brown', url: 'np-phaser/planet/assets/brown-planet.png' },
    planetSun: { key: 'planet-sun', url: 'np-phaser/planet/assets/sun.png' },
    planetGalaxy: { key: 'planet-galaxy', url: 'np-phaser/planet/assets/galaxy.png' },
    planetGasGiant: { key: 'planet-gas-giant', url: 'np-phaser/planet/assets/gas-giant.png' },
    planetPurple: { key: 'planet-purple', url: 'np-phaser/planet/assets/purple-planet.png' },
    planetSheet: { key: 'planet-sheet', url: 'np-phaser/planet/assets/planet-sheet-1.png', frameConfig },
};

export class Planet extends Phaser.GameObjects.Sprite implements NPSceneComponent {
    readonly #image: Phaser.Types.Loader.FileTypes.ImageFileConfig;

    constructor(public scene: NPScene, type: keyof typeof IMAGES) {
        super(scene, 0, 0, '');
        this.#image = IMAGES[type];
        this.setName(type);
    }

    preload(): void {
        this.scene.load.image(this.#image);
    }

    public create(): void {
        this.setTexture(this.#image.key);
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

        this.angle += 0.1;
    }
}
