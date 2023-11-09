import { NPScene } from '../../../../np-phaser/src/lib/scenes/np-scene';
import { Image } from '../../../../np-phaser/src/lib/sprites/image/image';

const IMAGES = {
    shot: { key: 'paradroid-img-shot', url: 'np-phaser/button/assets/button1.png' },
    vsImage: { key: 'paradroid-img-vs', url: 'np-paradroid/pngwing.com.png' },
    vsDroid: { key: 'paradroid-img-droid', url: 'np-phaser/cute-robot/assets/cute-robot.png' },
    vsPlayerFemale: {
        key: 'paradroid-img-player-female',
        url: 'np-paradroid/female_pack.png',
        frameConfig: { frameWidth: 144, frameHeight: 144 },
    },
};

export class ParadroidImage extends Image {
    constructor(scene: NPScene, x: number, y: number, image: keyof typeof IMAGES, frame?: number) {
        super(scene, x, y, IMAGES[image], frame);
    }

    create(container?: Phaser.GameObjects.Container) {
        super.create();
        container?.add(this);
    }
}
