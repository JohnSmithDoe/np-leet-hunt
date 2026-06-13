import * as Phaser from 'phaser';

import { NPCamera } from '../cameras/np-camera';
import { NPFullscreenCamera } from '../cameras/np-fullscreen-camera';
import { NPScene, TNPLayerKeys } from './np-scene';

// NPLayer is not an NPGameObject: Phaser.GameObjects.Layer does not extend GameObject.
//https://github.com/photonstorm/phaser/issues/6675
export class NPLayer extends Phaser.GameObjects.Layer {
    camera?: NPCamera;

    constructor(
        public scene: NPScene,
        public readonly name: TNPLayerKeys,
        makeMain: boolean
    ) {
        super(scene, []);
        this.camera = new NPFullscreenCamera(scene, makeMain).setName(name + '-camera');
        this.camera.debug = makeMain;
        // this.camera.backgroundColor = Phaser.Display.Color.RandomRGB();
    }

    init(): void {
        console.log('init layer', this.name);
        this.camera?.init();
    }

    create(): void {
        this.scene.add.existing(this);
    }
}
