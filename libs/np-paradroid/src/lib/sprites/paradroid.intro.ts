import { rng } from '@shared/np-library';

import { NPFullscreenCamera } from '../../../../np-phaser/src/lib/cameras/np-fullscreen-camera';
import { NPScene } from '../../../../np-phaser/src/lib/scenes/np-scene';
import { NPSceneContainer } from '../../../../np-phaser/src/lib/scenes/np-scene-component';
import { ParadroidImage } from './paradroid.image';

export class ParadroidIntro extends NPSceneContainer<ParadroidImage> {
    constructor(scene: NPScene) {
        super(scene);
    }

    init() {
        const imageTest = new ParadroidImage(this.scene, 300, -200, 'vsPlayerFemale', rng(0, 20));
        const imageTest3 = new ParadroidImage(this.scene, 450, -190, 'vsImage');
        const imageTest2 = new ParadroidImage(this.scene, 600, -200, 'vsDroid');
        this.add(imageTest);
        this.add(imageTest3);
        this.add(imageTest2);
        this.scene.tweens.add({
            targets: [imageTest, imageTest3, imageTest2],
            y: 400,
            ease: 'Power1',
            duration: 2000,
            onComplete: () => {
                this.scene.cameras
                    .getCamera('ui-camera')
                    .shake(1200, 0.02, undefined, (_: NPFullscreenCamera, percent: number) => {
                        if (percent === 1) {
                            this.list.forEach(img => img.destroy());
                        }
                    });
            },
        });
        this.scene.addToLayer('ui', imageTest);
        super.init();
    }

    create(container?: Phaser.GameObjects.Container) {
        super.create(container);
        this.list.forEach(img => {
            const ratio = img.height / img.width;
            img.setDisplaySize(128, 128 * ratio);
        });
    }
}
