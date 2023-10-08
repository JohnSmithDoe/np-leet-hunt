import * as Phaser from 'phaser';

// eslint-disable-next-line import/no-cycle
import { NPCamera } from '../cameras/np-camera';
// eslint-disable-next-line import/no-cycle
import { NPFullscreenCamera } from '../cameras/np-fullscreen-camera';
// eslint-disable-next-line import/no-cycle
import { NPScene, TNPLayerKeys } from './np-scene';
// eslint-disable-next-line import/no-cycle
import { NPSceneComponent } from './np-scene-component';

export class NPLayer extends Phaser.GameObjects.Layer implements NPSceneComponent {
    camera?: NPCamera;

    constructor(public scene: NPScene, public readonly name: TNPLayerKeys, makeMain: boolean) {
        super(scene, []);
        this.camera = new NPFullscreenCamera(scene, makeMain).setName(name + '-camera');
        this.camera.debug = makeMain;
    }

    init(): void {
        console.log('init layer', this.name);
        this.camera?.init();
    }

    create(): void {
        this.scene.add.existing(this);
    }
}
