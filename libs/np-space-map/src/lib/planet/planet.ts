import { NPGameObject, NPScene } from '@shared/np-phaser';
import * as Phaser from 'phaser';

import { NPRNG } from '../../../../np-phaser/src/lib/utilities/piecemeal';

// const frameConfig: Phaser.Types.Loader.FileTypes.ImageFrameConfig = {
//     frameWidth: 256 * 2,
//     frameHeight: 256 * 2,
// };
const IMAGES = {
    planet1: { key: 'planet-1', url: 'np-space-map/planets/planet01.png' },
    planet2: { key: 'planet-2', url: 'np-space-map/planets/planet02.png' },
    planet3: { key: 'planet-3', url: 'np-space-map/planets/planet03.png' },
    planet4: { key: 'planet-4', url: 'np-space-map/planets/planet04.png' },
    planet5: { key: 'planet-5', url: 'np-space-map/planets/planet05.png' },
    planet6: { key: 'planet-6', url: 'np-space-map/planets/planet06.png' },
    planet7: { key: 'planet-7', url: 'np-space-map/planets/planet07.png' },
    planet8: { key: 'planet-8', url: 'np-space-map/planets/planet08.png' },
    planetBlue: { key: 'planet-blue', url: 'np-space-map/planets/blue-planet.png' },
    planetBrown: { key: 'planet-brown', url: 'np-space-map/planets/brown-planet.png' },
    planetSun: { key: 'planet-sun', url: 'np-space-map/planets/sun.png' },
    planetGalaxy: { key: 'planet-galaxy', url: 'np-space-map/planets/galaxy.png' },
    planetGasGiant: { key: 'planet-gas-giant', url: 'np-space-map/planets/gas-giant.png' },
    planetPurple: { key: 'planet-purple', url: 'np-space-map/planets/purple-planet.png' },
    // planetSheet: { key: 'planet-sheet', url: 'np-space-map/planets/planet-sheet-1.png', frameConfig },
};

export class Planet extends Phaser.GameObjects.Sprite implements NPGameObject {
    readonly #image: Phaser.Types.Loader.FileTypes.ImageFileConfig;

    static getRandom() {
        const types = Object.keys(IMAGES) as (keyof typeof IMAGES)[];
        return NPRNG.item(types);
    }

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
        this.setOrigin(0.5);
        if (this.width < 512) {
            this.setDisplaySize(512, 512);
        }
        // const a = this.scene.anims.create({
        //     key: this.#image.key,
        //     frames: this.#image.key,
        //     frameRate: 1,
        //     repeat: -1,
        //     yoyo: true,
        // });
        // console.log(a, 'kdsfjlksadjflksajdflksajdlk');
        // this.scene.add.existing(this);
        // this.scene.addToLayer('np', this);
        // this.play(this.#image.key);
        // this.stop();
    }

    addToScene(): void {
        console.log('64:addToScene-planet');

        this.scene.addExisting(this);
    }

    public update(...args: number[]): void {
        super.update(...args);
        // console.log(this.anims.currentFrame.index, this.anims.currentFrame);

        // console.log(this.anims.currentAnim.duration, this.frame.sourceIndex);

        this.angle += 0.1;
    }
}
