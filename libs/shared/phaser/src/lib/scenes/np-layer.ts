import * as Phaser from 'phaser';

// eslint-disable-next-line import/no-cycle
import { NPCamera } from '../cameras/np-camera';
// eslint-disable-next-line import/no-cycle
import { NPFullscreenCamera } from '../cameras/np-fullscreen-camera';
// eslint-disable-next-line import/no-cycle
import { NPScene, TNPLayerKeys } from './np-scene';
// eslint-disable-next-line import/no-cycle
import { NPBaseComponent } from './np-scene-component';

export class NPLayer extends Phaser.GameObjects.Layer implements NPBaseComponent {
    camera?: NPCamera;

    constructor(public scene: NPScene, public readonly key: TNPLayerKeys, makeMain: boolean) {
        super(scene, []);
        this.camera = new NPFullscreenCamera(scene, makeMain).setName(key);
        this.camera.debug = makeMain;
    }

    init(): void {
        console.log('init layer', this.key);
        this.camera?.init();
    }
}
