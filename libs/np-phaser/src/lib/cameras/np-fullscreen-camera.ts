import * as Phaser from 'phaser';

import { NPScene } from '../scenes/np-scene';
import { NPCamera } from './np-camera';

export class NPFullscreenCamera extends NPCamera {
    constructor(scene: NPScene, makeMain: boolean) {
        super(scene, 0, 0, scene.scale.width, scene.scale.height, makeMain);
    }

    init() {
        super.init();
        this.scene.scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);
    }

    resize(gameSize?: Phaser.Structs.Size): void {
        const { width, height } = gameSize || this.scene.scale.gameSize;
        this.setSize(width, height);
    }
}
