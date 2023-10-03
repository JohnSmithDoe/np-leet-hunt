import * as Phaser from 'phaser';

// eslint-disable-next-line import/no-cycle
import { NPScene } from '../scenes/np-scene';
// eslint-disable-next-line import/no-cycle
// eslint-disable-next-line import/no-cycle
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
        console.log('resize fullscreen cam', this.scene.cameras, this.name);
        const { width, height } = gameSize || this.scene.scale.gameSize;
        this.setSize(width, height);
    }
}
