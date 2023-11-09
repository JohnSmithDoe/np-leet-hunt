import { NPScene } from '../../../../np-phaser/src/lib/scenes/np-scene';
import { Image } from '../../../../np-phaser/src/lib/sprites/image/image';

const IMAGES = {
    vsImage: { key: 'paradroid-img-vs', url: 'np-paradroid/vs.png' },
    vsDroid: { key: 'paradroid-img-vs', url: 'np-phaser/cute-robot/assets/cute-robot.png' },
    vsPlayer: {
        key: 'paradroid-img-vs',
        url: 'np-paradroid/vs.png',
        frameConfig: { frameWidth: 144, frameHeight: 144 },
    },
};

export class ParadroidImage extends Image {
    constructor(scene: NPScene, x: number, y: number, image: keyof typeof IMAGES) {
        super(scene, x, y, IMAGES[image]);
    }

    create(container?: Phaser.GameObjects.Container) {
        super.create();
        container?.add(this);
    }
}
