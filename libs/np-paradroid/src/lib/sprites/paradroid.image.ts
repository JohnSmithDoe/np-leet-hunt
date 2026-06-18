import { NPScene } from '../../../../np-phaser/src/lib/scenes/np-scene';
import { Image } from '../../../../np-phaser/src/lib/sprites/image/image';

/** Texture configs for the paradroid sprites. Exported so the VS intro can preload them up front. */
export const PARADROID_IMAGES = {
    shot: { key: 'paradroid-img-shot', url: 'np-phaser/button/assets/button1.png' },
    vsImage: { key: 'paradroid-img-vs', url: 'np-paradroid/pngwing.com.png' },
    vsFight: { key: 'paradroid-img-fight', url: 'np-paradroid/fight-leonardo.png' },
    vsDroid: { key: 'paradroid-img-droid', url: 'np-phaser/cute-robot/assets/cute-robot.png' },
    vsPlayerFemale: {
        key: 'paradroid-img-player-female',
        url: 'np-paradroid/female_pack.png',
        frameConfig: { frameWidth: 144, frameHeight: 144 },
    },
};

export type TParadroidImageKey = keyof typeof PARADROID_IMAGES;

export class ParadroidImage extends Image {
    constructor(scene: NPScene, x: number, y: number, image: TParadroidImageKey, frame?: number) {
        super(scene, x, y, PARADROID_IMAGES[image], frame);
    }

    create(container?: Phaser.GameObjects.Container) {
        super.create();
        container?.add(this);
    }
}
