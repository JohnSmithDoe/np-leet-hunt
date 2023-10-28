import * as Phaser from 'phaser';

import { NPCamera } from '../cameras/np-camera';
import { NPFullscreenCamera } from '../cameras/np-fullscreen-camera';
import { NPScene, TNPLayerKeys } from './np-scene';
import { NPSceneComponent } from './np-scene-component';

export class NPLayer extends Phaser.GameObjects.Layer implements NPSceneComponent {
    camera?: NPCamera;

    constructor(public scene: NPScene, public readonly name: TNPLayerKeys, makeMain: boolean) {
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
