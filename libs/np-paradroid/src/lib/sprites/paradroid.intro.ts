import { NPGameObjectList, NPScene } from '@shared/np-phaser';

import { NPFullscreenCamera } from '../../../../np-phaser/src/lib/cameras/np-fullscreen-camera';
import { NPRNG } from '../../../../np-phaser/src/lib/utilities/piecemeal';
import { ParadroidImage } from './paradroid.image';

export class ParadroidIntro extends NPGameObjectList<ParadroidImage> {
    constructor(scene: NPScene) {
        super(scene);
    }

    init() {
        const imageTest = new ParadroidImage(this.scene, 300, -200, 'vsPlayerFemale', NPRNG.inRange(0, 20));
        const imageTest3 = new ParadroidImage(this.scene, 450, -190, 'vsImage');
        const imageTest2 = new ParadroidImage(this.scene, 600, -200, 'vsDroid');
        this.add(imageTest);
        this.add(imageTest3);
        this.add(imageTest2);
        this.scene.tweens.add({
            targets: [imageTest, imageTest3, imageTest2],
            y: 200,
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

    create() {
        super.create();
        this.list.forEach(img => {
            const ratio = img.height / img.width;
            img.setDisplaySize(128, 128 * ratio);
        });
    }
}
